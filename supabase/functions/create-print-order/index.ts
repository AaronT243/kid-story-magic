import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PRINT-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { story_id, product_type = 'hardcover_book' } = await req.json();
    if (!story_id) throw new Error("story_id is required");
    logStep("Request received", { story_id, product_type });

    // Fetch story from database
    const { data: story, error: storyError } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('id', story_id)
      .eq('user_id', user.id)
      .single();

    if (storyError || !story) {
      throw new Error("Story not found or access denied");
    }
    logStep("Story fetched", { title: story.title });

    if (story.status !== 'completed' || !story.content) {
      throw new Error("Story is not completed yet");
    }

    // First, create PDF with PdfMonkey for print
    const pdfMonkeyApiKey = Deno.env.get('PDFMONKEY_API_KEY');
    if (!pdfMonkeyApiKey) throw new Error("PdfMonkey API key not configured");

    const templateData = {
      story_title: story.title,
      child_name: story.child_name,
      child_age: story.child_age,
      story_content: story.content,
      characters: story.characters?.join(', ') || '',
      theme: story.theme,
      created_date: new Date(story.created_at).toLocaleDateString('fr-FR'),
      illustrations: story.illustration_urls || []
    };

    const pdfResponse = await fetch('https://api.pdfmonkey.io/api/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pdfMonkeyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          document_template_id: 'story-print-template', // Different template optimized for print
          payload: templateData,
          meta: {
            _filename: `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_print.pdf`
          }
        }
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      logStep("PdfMonkey error", { status: pdfResponse.status, error: errorText });
      throw new Error(`PDF generation failed: ${pdfResponse.status} - ${errorText}`);
    }

    const pdfResult = await pdfResponse.json();
    const pdfUrl = pdfResult.document?.download_url;
    
    if (!pdfUrl) {
      throw new Error("PDF generation failed - no download URL");
    }
    logStep("PDF generated", { pdfUrl });

    // Create Gelato print order
    const gelatoApiKey = Deno.env.get('GELATO_API_KEY');
    if (!gelatoApiKey) throw new Error("Gelato API key not configured");

    // Define product specifications
    const productSpecs = {
      'hardcover_book': {
        productTypeId: 'photobook_hardcover_210x280',
        price: 1999, // €19.99 in cents
        name: 'Livre relié personnalisé'
      },
      'softcover_book': {
        productTypeId: 'photobook_softcover_210x280', 
        price: 1299, // €12.99 in cents
        name: 'Livre broché personnalisé'
      }
    };

    const selectedProduct = productSpecs[product_type as keyof typeof productSpecs] || productSpecs.hardcover_book;

    // For now, we'll create a Stripe checkout session for payment
    // Once payment is confirmed, we'll create the actual Gelato order
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session for print order
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: selectedProduct.name,
              description: `Histoire "${story.title}" pour ${story.child_name}`,
              images: story.illustration_urls?.slice(0, 1) || []
            },
            unit_amount: selectedProduct.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/print-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/story/${story_id}`,
      metadata: {
        story_id: story.id,
        user_id: user.id,
        product_type: product_type,
        pdf_url: pdfUrl,
        gelato_product_id: selectedProduct.productTypeId
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-print-order", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});