import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PrintSuccess = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && sessionId) {
      processPayment();
    }
  }, [user, sessionId]);

  const processPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-print-payment', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess(true);
        toast.success('Commande d\'impression créée avec succès !');
      } else {
        toast.error('Erreur lors du traitement de la commande');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Erreur lors du traitement: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connexion requise</CardTitle>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">StoryKidAI</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardContent className="py-12 text-center">
              {processing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Traitement de votre commande</h3>
                  <p className="text-muted-foreground">
                    Nous créons votre commande d'impression personnalisée...
                  </p>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Commande confirmée !</h3>
                  <p className="text-muted-foreground mb-6">
                    Votre livre personnalisé a été commandé avec succès. Vous recevrez un email de confirmation 
                    avec les détails de livraison sous peu.
                  </p>
                  <div className="space-y-4">
                    <h4 className="font-medium">Prochaines étapes :</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                      <li>• Confirmation par email dans les prochaines minutes</li>
                      <li>• Impression et préparation : 2-3 jours ouvrés</li>
                      <li>• Expédition et livraison : 5-7 jours ouvrés</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Erreur de traitement</h3>
                  <p className="text-muted-foreground">
                    Une erreur s'est produite lors du traitement de votre commande. 
                    Veuillez contacter notre support si le problème persiste.
                  </p>
                </>
              )}
              
              <div className="flex gap-4 justify-center mt-8">
                <Button asChild>
                  <Link to="/stories">Mes histoires</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Accueil</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrintSuccess;