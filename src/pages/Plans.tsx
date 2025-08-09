import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  Check, 
  Star, 
  Sparkles,
  RefreshCw,
  Loader2,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SubscriptionInfo {
  subscription_active: boolean;
  subscription_plan: string;
  stories_created_this_month: number;
  max_stories_per_month: number;
}

const Plans = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast.error('Erreur lors de la vérification de l\'abonnement');
    } finally {
      setCheckingSubscription(false);
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: 'starter' | 'premium') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      toast.loading('Création de la session de paiement...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('URL de checkout manquante');
      }

      console.log('Opening checkout URL:', data.url);
      
      // Try to open in new tab, fallback to current window if blocked
      const newWindow = window.open(data.url, '_blank', 'width=800,height=600');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, open in current window
        console.log('Popup blocked, redirecting in current window');
        window.location.href = data.url;
      } else {
        toast.success('Redirection vers Stripe...');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(`Erreur lors de la création du paiement: ${error.message}`);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail client');
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Plan Gratuit',
      price: '0€',
      period: 'par mois',
      description: 'Parfait pour découvrir',
      features: [
        '1 histoire personnalisée uniquement',
        'Illustrations incluses',
        'Thèmes variés',
        'Export PDF'
      ],
      popular: false,
      buttonText: 'Plan actuel',
      disabled: true
    },
    {
      id: 'starter',
      name: 'Plan Starter',
      price: '9€',
      period: 'par mois',
      description: 'Pour créer d\'autres livres',
      features: [
        '3 histoires personnalisées par mois',
        'Illustrations premium incluses',
        'Tous les thèmes disponibles',
        'Export PDF haute qualité',
        'Support prioritaire'
      ],
      popular: true,
      buttonText: 'Choisir ce plan',
      disabled: false
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '19€',
      period: 'par mois',
      description: 'Histoires illimitées',
      features: [
        'Histoires illimitées',
        'Illustrations premium exclusives',
        'Tous les thèmes + thèmes exclusifs',
        'Export PDF haute qualité',
        'Support prioritaire',
        'Nouvelles fonctionnalités en avant-première',
        'Personnalisation avancée'
      ],
      popular: false,
      buttonText: 'Choisir ce plan',
      disabled: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Crown className="h-16 w-16 text-primary" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Choisissez votre plan magique
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Créez des histoires personnalisées inoubliables pour vos enfants avec nos plans adaptés à tous les besoins
            </p>

            {user && subscriptionInfo && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkSubscription}
                  disabled={checkingSubscription}
                >
                  {checkingSubscription ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Actualiser l'abonnement
                </Button>
                
                {subscriptionInfo.subscription_active && (
                  <Button variant="outline" size="sm" onClick={handleCustomerPortal}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gérer mon abonnement
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Usage Stats */}
          {user && subscriptionInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4 text-center">Utilisation ce mois-ci</h4>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {subscriptionInfo.stories_created_this_month}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subscriptionInfo.max_stories_per_month === -1 
                          ? 'histoires créées (illimité)' 
                          : `/ ${subscriptionInfo.max_stories_per_month} histoires`
                        }
                      </div>
                    </div>
                    {subscriptionInfo.max_stories_per_month !== -1 && (
                      <div className="flex-1 max-w-xs bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min((subscriptionInfo.stories_created_this_month / subscriptionInfo.max_stories_per_month) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isCurrentPlan = user && subscriptionInfo && subscriptionInfo.subscription_plan === plan.id;
              const isActive = user && subscriptionInfo && subscriptionInfo.subscription_active;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'ring-2 ring-primary shadow-lg scale-105' 
                      : isCurrentPlan && isActive
                        ? 'ring-2 ring-secondary shadow-lg'
                        : 'hover:ring-1 hover:ring-primary/50'
                  }`}>
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 text-sm font-medium">
                        <Star className="inline h-4 w-4 mr-1" />
                        Le plus populaire
                      </div>
                    )}
                    
                    {isCurrentPlan && isActive && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-accent text-white text-center py-2 text-sm font-medium">
                        <Crown className="inline h-4 w-4 mr-1" />
                        Plan actuel
                      </div>
                    )}

                    <CardHeader className={`text-center ${plan.popular || (isCurrentPlan && isActive) ? 'pt-12' : 'pt-6'}`}>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.description}</CardDescription>
                      <div className="py-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4">
                        {isCurrentPlan && isActive ? (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleCustomerPortal}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Gérer mon abonnement
                          </Button>
                        ) : plan.id === 'free' ? (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            disabled
                          >
                            Plan gratuit
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                            onClick={() => handleCheckout(plan.id as 'starter' | 'premium')}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {plan.buttonText}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-muted/50 to-background/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Pourquoi choisir StoryKidAI ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p><strong>IA Avancée</strong><br />Histoires uniques et personnalisées</p>
                  </div>
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p><strong>Qualité Premium</strong><br />Illustrations professionnelles</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p><strong>Satisfaction Garantie</strong><br />Résiliable à tout moment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Plans;