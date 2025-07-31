import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { storyId, childName, childAge, characters, theme, storyLength } = await req.json();

    console.log('Generating story for:', { storyId, childName, childAge, characters, theme, storyLength });

    // Generate story content
    const storyPrompt = `Écris une histoire personnalisée pour ${childName}, ${childAge} ans.

Thème: ${theme}
Personnages à inclure: ${characters.join(', ')}
Longueur: ${storyLength === 'short' ? 'Courte (200-300 mots)' : storyLength === 'medium' ? 'Moyenne (400-600 mots)' : 'Longue (700-1000 mots)'}

Instructions:
- L'histoire doit être adaptée à l'âge de l'enfant (${childAge} ans)
- Inclure ${childName} comme personnage principal
- Utiliser les personnages mentionnés de manière créative
- L'histoire doit avoir une morale positive
- Style narratif engageant et adapté aux enfants
- Diviser l'histoire en paragraphes courts
- Terminer par une fin heureuse et éducative

Écris uniquement l'histoire, sans titre ni métadonnées.`;

    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un auteur spécialisé dans les histoires pour enfants. Tu écris des histoires captivantes, éducatives et adaptées à l\'âge de l\'enfant.' 
          },
          { role: 'user', content: storyPrompt }
        ],
        temperature: 0.8,
        max_tokens: storyLength === 'short' ? 500 : storyLength === 'medium' ? 800 : 1200,
      }),
    });

    if (!storyResponse.ok) {
      throw new Error('Failed to generate story');
    }

    const storyData = await storyResponse.json();
    const storyContent = storyData.choices[0].message.content;

    // Generate illustrations
    const illustrations: string[] = [];
    const numIllustrations = storyLength === 'short' ? 2 : storyLength === 'medium' ? 3 : 4;

    for (let i = 0; i < numIllustrations; i++) {
      const illustrationPrompt = `A colorful, child-friendly illustration for a story about ${childName}, age ${childAge}. Theme: ${theme}. Characters: ${characters.join(', ')}. Style: cartoon, bright colors, suitable for children's book, safe for kids. Scene ${i + 1} of ${numIllustrations}.`;

      try {
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: illustrationPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            output_format: 'png'
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageBase64 = imageData.data[0].b64_json;
          illustrations.push(`data:image/png;base64,${imageBase64}`);
        }
      } catch (error) {
        console.error('Error generating illustration:', error);
        // Continue without this illustration
      }
    }

    // Update story in database
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        content: storyContent,
        illustration_urls: illustrations,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);

    if (updateError) {
      throw updateError;
    }

    console.log('Story generated successfully for storyId:', storyId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        storyId,
        content: storyContent,
        illustrations: illustrations.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});