import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Vérifier que l'utilisateur est connecté
        if (!user) {
          navigate('/auth');
          return;
        }

        // Vérifier le paiement via l'edge function check-subscription
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) throw error;

        // Si l'abonnement est actif, le paiement a été traité avec succès
        if (data?.subscribed) {
          setPaymentVerified(true);
          toast.success('Paiement confirmé ! Bienvenue dans votre nouveau plan !');
          
          // Rediriger vers la page de création d'histoires après 3 secondes
          setTimeout(() => {
            navigate('/create-story');
          }, 3000);
        } else {
          // Paiement non confirmé - rediriger vers la page de checkout
          toast.error('Paiement non confirmé. Redirection vers les plans...');
          setTimeout(() => {
            navigate('/plans');
          }, 2000);
          return;
        }
      } catch (error: any) {
        console.error('Erreur lors de la vérification du paiement:', error);
        // En cas d'erreur - rediriger vers la page de checkout
        toast.error('Erreur lors de la vérification du paiement. Redirection vers les plans...');
        setTimeout(() => {
          navigate('/plans');
        }, 2000);
        return;
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [user, navigate]);

  const handleGoToCreateStory = () => {
    navigate('/create-story');
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Vérification du paiement...</h2>
              <p className="text-muted-foreground">
                Nous vérifions que votre paiement a été traité correctement.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg mx-auto px-4"
      >
        <Card className="text-center">
          <CardHeader className="pb-4">
            {paymentVerified ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              </motion.div>
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
            )}
            
            <CardTitle className="text-2xl font-bold">
              {paymentVerified ? 'Paiement réussi !' : 'Erreur de paiement'}
            </CardTitle>
            
            <CardDescription className="text-lg">
              {paymentVerified 
                ? 'Votre abonnement a été activé avec succès'
                : error || 'Une erreur s\'est produite lors du traitement de votre paiement'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {paymentVerified ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">
                    🎉 Félicitations ! Vous pouvez maintenant créer vos histoires personnalisées.
                  </p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-muted-foreground mb-4"
                >
                  Redirection automatique dans 3 secondes...
                </motion.div>

                <Button 
                  onClick={handleGoToCreateStory}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  size="lg"
                >
                  Créer mes livres maintenant
                </Button>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    Si vous pensez que c'est une erreur, veuillez contacter notre support.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleContactSupport}
                    variant="outline"
                    className="w-full"
                  >
                    Contacter le support
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/plans')}
                    variant="outline"
                    className="w-full"
                  >
                    Retour aux plans
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;