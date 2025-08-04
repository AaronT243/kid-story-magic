import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddToBrevoRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  listId?: number;
  tags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured');
    }

    const { email, firstName, lastName, listId = 2, tags = [] }: AddToBrevoRequest = await req.json();

    console.log('Adding contact to Brevo:', { email, firstName, lastName, listId, tags });

    // Prepare contact data for Brevo
    const contactData = {
      email,
      attributes: {
        FIRSTNAME: firstName || '',
        LASTNAME: lastName || '',
      },
      listIds: [listId],
      updateEnabled: true, // Update contact if already exists
    };

    // Add tags if provided
    if (tags.length > 0) {
      (contactData as any).tags = tags;
    }

    // Add contact to Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(contactData),
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      // If contact already exists, that's OK
      if (brevoResponse.status === 400 && responseData.message?.includes('Contact already exist')) {
        console.log('Contact already exists in Brevo, updating...');
        
        // Update existing contact
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            attributes: contactData.attributes,
            listIds: contactData.listIds,
          }),
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          throw new Error(`Failed to update contact in Brevo: ${updateError.message}`);
        }

        console.log('Contact updated successfully in Brevo');
      } else {
        throw new Error(`Brevo API error: ${responseData.message || 'Unknown error'}`);
      }
    } else {
      console.log('Contact added successfully to Brevo:', responseData);
    }

    // Trigger automation tags if specified
    if (tags.length > 0) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}/tags`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            tags: tags,
          }),
        });
        console.log('Tags added successfully:', tags);
      } catch (tagError) {
        console.error('Error adding tags:', tagError);
        // Don't fail the whole request if tagging fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact successfully added/updated in Brevo',
        contactData: responseData 
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
    console.error('Error in add-to-brevo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
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