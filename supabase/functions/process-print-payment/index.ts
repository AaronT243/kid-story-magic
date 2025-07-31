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
  console.log(`[PROCESS-PRINT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }
    
    logStep("Payment verified", { sessionId: session.id });

    // Extract metadata
    const { story_id, user_id, product_type, pdf_url, gelato_product_id } = session.metadata || {};
    
    if (!story_id || !user_id || !pdf_url || !gelato_product_id) {
      throw new Error("Missing metadata from checkout session");
    }

    // Create Gelato order
    const gelatoApiKey = Deno.env.get('GELATO_API_KEY');
    if (!gelatoApiKey) throw new Error("Gelato API key not configured");

    // Get customer details from Stripe
    let customerEmail = session.customer_details?.email;
    let customerName = session.customer_details?.name;
    let shippingAddress = session.shipping_details?.address;

    if (!customerEmail || !shippingAddress) {
      throw new Error("Missing customer or shipping information");
    }

    // Create Gelato order
    const gelatoOrder = {
      orderReferenceId: `story-${story_id}-${Date.now()}`,
      currency: "EUR",
      items: [{
        productTypeId: gelato_product_id,
        fileUrl: pdf_url,
        quantity: 1
      }],
      shippingAddress: {
        firstName: customerName?.split(' ')[0] || '',
        lastName: customerName?.split(' ').slice(1).join(' ') || '',
        email: customerEmail,
        addressLine1: shippingAddress.line1,
        addressLine2: shippingAddress.line2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postal_code,
        country: shippingAddress.country
      }
    };

    const gelatoResponse = await fetch('https://api.gelato.com/v4/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gelatoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gelatoOrder),
    });

    if (!gelatoResponse.ok) {
      const errorText = await gelatoResponse.text();
      logStep("Gelato error", { status: gelatoResponse.status, error: errorText });
      throw new Error(`Gelato order creation failed: ${gelatoResponse.status} - ${errorText}`);
    }

    const gelatoResult = await gelatoResponse.json();
    logStep("Gelato order created", { orderId: gelatoResult.id });

    // Save order information to database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("print_orders").insert({
      user_id: user_id,
      story_id: story_id,
      stripe_session_id: session_id,
      gelato_order_id: gelatoResult.id,
      product_type: product_type,
      status: 'ordered',
      amount: session.amount_total,
      currency: session.currency,
      customer_email: customerEmail,
      created_at: new Date().toISOString()
    });

    logStep("Order saved to database");

    return new Response(JSON.stringify({
      success: true,
      gelato_order_id: gelatoResult.id,
      message: "Print order created successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-print-payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});