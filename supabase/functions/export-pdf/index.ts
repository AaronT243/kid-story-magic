import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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

    // Generate simple PDF using pdf-lib
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
    
    // Story content with pagination
    if (templateData.story_content) {
      // Split by double newlines to separate paragraphs
      const paragraphs = templateData.story_content.split('\n\n');
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;
        
        const words = paragraph.trim().split(' ');
        let currentLine = '';
        const maxWidth = width - (margin * 2);
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = helveticaFont.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > maxWidth && currentLine) {
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
            if (yPosition < margin + 60) {
              page = pdfDoc.addPage([595, 842]);
              yPosition = height - margin;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
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
        
        // Extra space between paragraphs
        yPosition -= lineHeight * 0.5;
        
        // Check if we need a new page
        if (yPosition < margin + 60) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }
      }
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
    lastPage.drawText("Cree avec amour par StoryKidAI", {
      x: margin,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    // Add creation date
    lastPage.drawText(`Cree le ${templateData.created_date}`, {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });
    
    const pdfBytes = await pdfDoc.save();
    logStep("PDF generated successfully", { size: pdfBytes.length });

    // Return the PDF directly
    return new Response(pdfBytes, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`
      },
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