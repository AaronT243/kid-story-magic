import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    console.log('BREVO_API_KEY configured:', !!brevoApiKey);
    console.log('BREVO_API_KEY length:', brevoApiKey?.length || 0);
    
    if (!brevoApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'BREVO_API_KEY not configured',
          configured: false 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Test Brevo API connectivity
    const brevoResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': brevoApiKey,
      },
    });

    const accountData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      throw new Error(`Brevo API test failed: ${accountData.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Brevo API connection successful',
        account: accountData,
        configured: true
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in test-brevo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        configured: !!Deno.env.get('BREVO_API_KEY')
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);