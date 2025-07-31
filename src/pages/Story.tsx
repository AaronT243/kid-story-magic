import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, Palette, Loader2, Download, Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

interface Story {
  id: string;
  title: string;
  child_name: string;
  child_age: number;
  characters: string[];
  theme: string;
  story_length: string;
  status: string;
  created_at: string;
  content?: string;
  illustration_urls?: string[];
}

const Story = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchStory();
    }
  }, [user, id]);

  const fetchStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setStory(data);
    } catch (error: any) {
      console.error('Error fetching story:', error);
      toast.error('Erreur lors du chargement de l\'histoire');
      navigate('/stories');
    } finally {
      setLoading(false);
    }
  };

  const getThemeDisplay = (theme: string) => {
    const themes: Record<string, string> = {
      'aventure': 'Aventure',
      'amitie': 'Amitié',
      'courage': 'Courage',
      'magie': 'Magie',
      'nature': 'Nature',
      'espace': 'Espace',
      'mer': 'Océan',
      'foret': 'Forêt enchantée'
    };
    return themes[theme] || theme;
  };

  const getLengthDisplay = (length: string) => {
    const lengths: Record<string, string> = {
      'short': 'Courte',
      'medium': 'Moyenne',
      'long': 'Longue'
    };
    return lengths[length] || length;
  };

  const handleExportPDF = async () => {
    if (!story?.id) return;
    
    setPdfLoading(true);
    try {
      console.log('Calling export-pdf function with story ID:', story.id);
      
      // Call the function and get raw response
      const response = await fetch(`https://tmsktyzdbqqmhyczkngn.supabase.co/functions/v1/export-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2t0eXpkYnFxbWh5Y3prbmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzA4NjcsImV4cCI6MjA2OTUwNjg2N30.Qc2szKGShcUA8fRQgPCtYRB8vFMh2UG5n25uuY8_87I'
        },
        body: JSON.stringify({ story_id: story.id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF as blob directly
      const blob = await response.blob();
      
      if (blob.type === 'application/pdf' || blob.size > 0) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('PDF téléchargé avec succès !');
      } else {
        throw new Error('PDF invalide reçu');
      }
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast.error('Erreur lors de l\'export PDF: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrintOrder = async () => {
    if (!story?.id) return;
    
    setPrintLoading(true);
    try {
      console.log('Generating PDF for printing with story ID:', story.id);
      
      // Call the function and get raw response
      const response = await fetch(`https://tmsktyzdbqqmhyczkngn.supabase.co/functions/v1/export-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2t0eXpkYnFxbWh5Y3prbmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzA4NjcsImV4cCI6MjA2OTUwNjg2N30.Qc2szKGShcUA8fRQgPCtYRB8vFMh2UG5n25uuY8_87I'
        },
        body: JSON.stringify({ story_id: story.id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF as blob directly
      const blob = await response.blob();
      
      if (blob.type === 'application/pdf' || blob.size > 0) {
        // Create URL for the PDF
        const url = URL.createObjectURL(blob);
        
        // Open PDF in new window and trigger print dialog
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 1000); // Longer delay to ensure PDF is fully loaded
          };
        }
        
        // Clean up URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000);
        
        toast.success('Document prêt pour impression !');
      } else {
        throw new Error('PDF invalide reçu');
      }
    } catch (error: any) {
      console.error('Error preparing print:', error);
      toast.error('Erreur lors de la préparation de l\'impression: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setPrintLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir cette histoire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Histoire introuvable</CardTitle>
            <CardDescription>
              Cette histoire n'existe pas ou vous n'avez pas l'autorisation de la voir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/stories">Retour aux histoires</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <Navigation showBackButton backTo="/stories" backLabel="Mes histoires" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Story Header */}
          <Card className="bg-background/50 backdrop-blur-sm border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{story.title}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {story.child_name}, {story.child_age} ans
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Palette className="h-4 w-4" />
                  {getThemeDisplay(story.theme)} • {getLengthDisplay(story.story_length)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(story.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardHeader>
            {story.characters.length > 0 && (
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Personnages:</p>
                  <div className="flex flex-wrap gap-2">
                    {story.characters.map((character, index) => (
                      <Badge key={index} variant="outline">
                        {character}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Story Content */}
          {story.status === 'completed' && story.content ? (
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <CardTitle>Histoire</CardTitle>
                  <div className="flex gap-2 order-first sm:order-last">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      disabled={pdfLoading}
                      className="flex-1 sm:flex-none"
                    >
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Télécharger PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintOrder}
                      disabled={printLoading}
                      className="flex-1 sm:flex-none"
                    >
                      {printLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4 mr-2" />
                      )}
                      Imprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  {story.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Illustrations */}
                {story.illustration_urls && story.illustration_urls.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Illustrations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {story.illustration_urls.map((url, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Illustration ${index + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : story.status === 'generating' ? (
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Histoire en cours de génération</h3>
                <p className="text-muted-foreground">
                  Votre histoire personnalisée est en cours de création. Cela peut prendre quelques minutes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold mb-2">Histoire non disponible</h3>
                <p className="text-muted-foreground">
                  Cette histoire n'est pas encore prête ou a rencontré un problème lors de la génération.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Story;