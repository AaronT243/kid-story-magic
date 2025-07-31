import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
    logStep("Attempting to fetch story", { story_id, user_id: user.id });
    const { data: story, error: storyError } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('id', story_id)
      .eq('user_id', user.id)
      .maybeSingle();

    logStep("Story query result", { story: story ? { id: story.id, title: story.title, status: story.status } : null, error: storyError });

    if (storyError) {
      logStep("Database error", storyError);
      throw new Error(`Database error: ${storyError.message}`);
    }
    
    if (!story) {
      throw new Error("Story not found or access denied");
    }
    logStep("Story fetched", { title: story.title });

    if (story.status !== 'completed' || !story.content) {
      throw new Error("Story is not completed yet");
    }

    // Generate PDF for print using simple PDF generation
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

    // Create PDF for print order (we'll store it temporarily for Gelato)
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add first page
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;
    
    // Title
    page.drawText(templateData.story_title, {
      x: margin,
      y: yPosition,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;
    
    // Child info
    page.drawText(`Histoire pour ${templateData.child_name}, ${templateData.child_age} ans`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 30;
    
    // Theme and characters
    if (templateData.theme) {
      page.drawText(`Thème: ${templateData.theme}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= lineHeight;
    }
    
    if (templateData.characters) {
      page.drawText(`Personnages: ${templateData.characters}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= lineHeight;
    }
    
    yPosition -= 20; // Extra space before content
    
    // Story content with pagination - handle line breaks properly
    if (templateData.story_content && templateData.story_content.trim()) {
      const paragraphs = templateData.story_content.split(/\n\n+/);
      
      for (const paragraph of paragraphs) {
        const cleanParagraph = paragraph.trim();
        if (cleanParagraph === '') {
          yPosition -= lineHeight; // Empty line
          continue;
        }
        
        const words = cleanParagraph.split(/\s+/);
        let currentLine = '';
        const maxWidth = width - (margin * 2);
        
        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const textWidth = helveticaFont.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > maxWidth && currentLine !== '') {
            // Draw current line
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            
            yPosition -= lineHeight;
            currentLine = word;
            
            // Check if we need a new page
            if (yPosition < margin + lineHeight * 3) {
              page = pdfDoc.addPage([595, 842]);
              yPosition = height - margin;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text in the paragraph
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
        
        // Add extra space between paragraphs
        yPosition -= lineHeight * 0.5;
        
        // Check if we need a new page
        if (yPosition < margin + lineHeight * 3) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }
      }
    } else {
      // If no content, add a message
      page.drawText("Contenu de l'histoire en cours de chargement...", {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0.7, 0.7, 0.7),
      });
    }
    
    
    // Add footer with custom message
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    
    // Add thank you message
    lastPage.drawText("Merci d'avoir lu cette histoire !", {
      x: margin,
      y: 70,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Add created with love message
    lastPage.drawText("Créé avec ❤ par StoryKidAI", {
      x: margin,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    // Add creation date
    lastPage.drawText(`Créé le ${templateData.created_date}`, {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });
    
    const pdfBytes = await pdfDoc.save();
    logStep("PDF generated for print", { size: pdfBytes.length });

    // For now, we'll use a placeholder URL since we're not using external PDF service
    const pdfUrl = `data:application/pdf;base64,${btoa(String.fromCharCode(...pdfBytes))}`;
    logStep("PDF data prepared", { pdfUrl: "data URL created" });

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