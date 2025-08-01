import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ArrowLeft, Plus, Calendar, User, Palette, Loader2, Eye, Crown, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
}

interface SubscriptionInfo {
  subscription_active: boolean;
  subscription_plan: string;
  stories_created_this_month: number;
  max_stories_per_month: number;
}

const Stories = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStories();
      checkSubscription();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      toast.error('Erreur lors du chargement des histoires');
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleCheckout = async (plan: 'starter' | 'premium') => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminée</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir vos histoires
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">StoryKidAI</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </Button>
          {/* Desktop: Button in nav */}
          <div className="hidden md:block">
            <Button asChild>
              <Link to="/create-story">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle histoire
              </Link>
            </Button>
          </div>
        </div>
      </nav>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Mobile: Button above title */}
          <div className="md:hidden mb-6 text-center">
            <Button asChild>
              <Link to="/create-story">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle histoire
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mes histoires
            </h1>
            <p className="text-muted-foreground text-lg">
              Retrouvez toutes vos histoires personnalisées
            </p>
          </div>

          {/* Subscription Status */}
          {subscriptionInfo && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Mon abonnement
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkSubscription}
                      disabled={checkingSubscription}
                    >
                      {checkingSubscription ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <Card className={`relative ${subscriptionInfo.subscription_plan === 'free' ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Gratuit</CardTitle>
                        <CardDescription>1 histoire par mois</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">0€</div>
                        <div className="text-sm text-muted-foreground mb-4">par mois</div>
                        {subscriptionInfo.subscription_plan === 'free' && (
                          <Badge className="mb-4">Plan actuel</Badge>
                        )}
                        <div className="space-y-2 text-sm">
                          <div>✓ 1 histoire personnalisée</div>
                          <div>✓ Illustrations incluses</div>
                          <div>✓ Thèmes variés</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Starter Plan */}
                    <Card className={`relative ${subscriptionInfo.subscription_plan === 'starter' ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Starter</CardTitle>
                        <CardDescription>3 histoires par mois</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">9€</div>
                        <div className="text-sm text-muted-foreground mb-4">par mois</div>
                        {subscriptionInfo.subscription_plan === 'starter' && subscriptionInfo.subscription_active ? (
                          <div className="space-y-2 mb-4">
                            <Badge className="mb-2">Plan actuel</Badge>
                            <Button variant="outline" size="sm" onClick={handleCustomerPortal}>
                              <Settings className="h-4 w-4 mr-2" />
                              Gérer mon abonnement
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full mb-4" 
                            onClick={() => handleCheckout('starter')}
                          >
                            Choisir ce plan
                          </Button>
                        )}
                        <div className="space-y-2 text-sm">
                          <div>✓ 3 histoires personnalisées</div>
                          <div>✓ Illustrations incluses</div>
                          <div>✓ Tous les thèmes</div>
                          <div>✓ Support prioritaire</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Premium Plan */}
                    <Card className={`relative ${subscriptionInfo.subscription_plan === 'premium' ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Premium</CardTitle>
                        <CardDescription>Histoires illimitées</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">19€</div>
                        <div className="text-sm text-muted-foreground mb-4">par mois</div>
                        {subscriptionInfo.subscription_plan === 'premium' && subscriptionInfo.subscription_active ? (
                          <div className="space-y-2 mb-4">
                            <Badge className="mb-2">Plan actuel</Badge>
                            <Button variant="outline" size="sm" onClick={handleCustomerPortal}>
                              <Settings className="h-4 w-4 mr-2" />
                              Gérer mon abonnement
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full mb-4" 
                            onClick={() => handleCheckout('premium')}
                          >
                            Choisir ce plan
                          </Button>
                        )}
                        <div className="space-y-2 text-sm">
                          <div>✓ Histoires illimitées</div>
                          <div>✓ Illustrations premium</div>
                          <div>✓ Tous les thèmes</div>
                          <div>✓ Support prioritaire</div>
                          <div>✓ Nouvelles fonctionnalités en avant-première</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Stats */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Utilisation ce mois-ci</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{subscriptionInfo.stories_created_this_month}</span>
                        {subscriptionInfo.max_stories_per_month === -1 
                          ? ' histoires créées (illimité)' 
                          : ` / ${subscriptionInfo.max_stories_per_month} histoires utilisées`
                        }
                      </div>
                      {subscriptionInfo.max_stories_per_month !== -1 && (
                        <div className="flex-1 bg-background rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.min((subscriptionInfo.stories_created_this_month / subscriptionInfo.max_stories_per_month) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune histoire encore</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre première histoire personnalisée pour votre enfant
            </p>
            <Button asChild size="lg">
              <Link to="/create-story">
                <Plus className="h-5 w-5 mr-2" />
                Créer ma première histoire
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                    {getStatusBadge(story.status)}
                  </div>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      {story.child_name}, {story.child_age} ans
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="h-4 w-4" />
                      {getThemeDisplay(story.theme)} • {getLengthDisplay(story.story_length)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(story.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {story.characters.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Personnages:</p>
                      <div className="flex flex-wrap gap-1">
                        {story.characters.slice(0, 3).map((character, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {character}
                          </Badge>
                        ))}
                        {story.characters.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{story.characters.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {story.status === 'completed' ? (
                      <Button asChild className="flex-1">
                        <Link to={`/story/${story.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lire
                        </Link>
                      </Button>
                    ) : story.status === 'generating' ? (
                      <Button disabled className="flex-1">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération...
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1" disabled>
                        Brouillon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;