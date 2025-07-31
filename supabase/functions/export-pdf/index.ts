import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-PDF] ${step}${detailsStr}`);
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
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { story_id } = await req.json();
    if (!story_id) throw new Error("story_id is required");
    logStep("Request received", { story_id });

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

    // Prepare PDF template data
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

    logStep("Template data prepared", { templateData });

    // Call PdfMonkey API
    const pdfMonkeyApiKey = Deno.env.get('PDFMONKEY_API_KEY');
    if (!pdfMonkeyApiKey) throw new Error("PdfMonkey API key not configured");

    const pdfResponse = await fetch('https://api.pdfmonkey.io/api/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pdfMonkeyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          document_template_id: '8136431D-B530-4158-920B-9D4A7964AC40',
          payload: templateData,
          meta: {
            _filename: `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          }
        }
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      logStep("PdfMonkey error", { status: pdfResponse.status, error: errorText });
      throw new Error(`PdfMonkey API error: ${pdfResponse.status} - ${errorText}`);
    }

    const pdfResult = await pdfResponse.json();
    logStep("PDF generation initiated", { documentId: pdfResult.document?.id });

    // Return the PDF generation result
    return new Response(JSON.stringify({
      success: true,
      document_id: pdfResult.document?.id,
      download_url: pdfResult.document?.download_url,
      status: pdfResult.document?.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in export-pdf", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});