import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  Printer, 
  Star, 
  Heart, 
  Users, 
  Camera, 
  Wand2, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Handle scroll to anchor when URL contains #plans
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#plans') {
      const element = document.getElementById('plans');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const testimonials = [
    {
      parent: "Sophie, maman de Léa (6 ans)",
      text: "Ma fille était émerveillée de se voir dans son livre ! Elle me demande de le relire tous les soirs.",
      child: "Léa : 'C'est MOI la princesse dans l'histoire ! Papa, regarde !'"
    },
    {
      parent: "Marc, papa de Tom (8 ans)",
      text: "Tom était timide, mais depuis qu'il est le héros de ses histoires, il a plus confiance en lui.",
      child: "Tom : 'Je veux être astronaute comme dans mon livre !'"
    },
    {
      parent: "Julie, maman de Clara (5 ans)",
      text: "Clara collectionne ses livres personnalisés. C'est devenu notre rituel du coucher préféré.",
      child: "Clara : 'Maman, on fait une nouvelle aventure ?'"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = async (plan: 'starter' | 'premium') => {
    if (!user) {
      // Si l'utilisateur n'est pas connecté, le rediriger vers l'auth avec le plan sélectionné
      setSelectedPlan(plan);
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
      
      // Try to open in new tab, fallback to current window if blocked (mobile)
      const newWindow = window.open(data.url, '_blank', 'width=800,height=600');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked (common on mobile), open in current window
        console.log('Popup blocked, redirecting in current window');
        window.location.href = data.url;
      } else {
        toast.success('Redirection vers Stripe...');
      }
      toast.dismiss();
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.dismiss();
      toast.error('Erreur lors de la création de la session de paiement');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c81eab' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='33' cy='5' r='1'/%3E%3Ccircle cx='3' cy='23' r='1.5'/%3E%3Ccircle cx='23' cy='17' r='1'/%3E%3Ccircle cx='13' cy='33' r='1'/%3E%3Ccircle cx='33' cy='23' r='1.5'/%3E%3Ccircle cx='43' cy='15' r='1'/%3E%3Ccircle cx='25' cy='35' r='1'/%3E%3Ccircle cx='45' cy='35' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: [0, 1, 0, -1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <Sparkles className="h-16 w-16 text-secondary mx-auto mb-4" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Créez un livre magique où votre enfant est le héros
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transformez votre enfant en personnage principal d'histoires uniques grâce à l'intelligence artificielle. 
              Des aventures personnalisées qui feront briller ses yeux ! ✨
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300" 
                  asChild
                >
                  <Link to="/create-story">
                    {profile?.stories_created_this_month && profile.stories_created_this_month > 0 
                      ? "Continuer mes créations magiques" 
                      : "Créer ma première histoire"}
                    <Wand2 className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/auth">
                    Commencer l'aventure maintenant
                    <Wand2 className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Hero Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img 
                  src="/lovable-uploads/94d8d03a-f93f-4e53-ae6c-aa735e6c8e80.png" 
                  alt="Famille lisant ensemble" 
                  className="w-full h-64 object-contain"
                />
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img 
                  src="/lovable-uploads/34c72a1e-2b83-4459-9a12-642ca8703a28.png" 
                  alt="Livre magique avec illustrations" 
                  className="w-full h-64 object-contain"
                />
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img 
                  src="/lovable-uploads/5abad710-211f-4e3f-be46-bbaee88ab3c7.png" 
                  alt="Enfant lisant avec des étoiles magiques" 
                  className="w-full h-64 object-contain"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour créer un livre magique personnalisé
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                icon: Users,
                title: "Parlez-nous de votre enfant",
                description: "Prénom, âge, passions, couleurs préférées... Plus nous en savons, plus l'histoire sera personnalisée !",
                image: "/lovable-uploads/64450931-8399-406a-bdbe-4981b68faed4.png"
              },
              {
                step: "2", 
                icon: Wand2,
                title: "L'IA crée la magie",
                description: "Notre intelligence artificielle génère une histoire unique avec des illustrations sur mesure où votre enfant est le héros.",
                image: "/lovable-uploads/8e23cfa4-aa51-46c7-9bbc-aea890d2957b.png"
              },
              {
                step: "3",
                icon: BookOpen,
                title: "Téléchargez ou imprimez",
                description: "Récupérez votre livre en PDF ou commandez une version imprimée de qualité pour garder ce trésor à vie.",
                image: "/lovable-uploads/2a418326-2b00-4459-8b52-7f20d94f8250.png"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-full h-48"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>
                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ils ont testé la magie
            </h2>
            <p className="text-xl text-muted-foreground">
              Des sourires, des étoiles dans les yeux, et des souvenirs pour la vie
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            <Card className="bg-white/50 backdrop-blur-sm border-primary/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={prevTestimonial}
                    className="text-primary hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <blockquote className="text-lg italic text-muted-foreground mb-4">
                        "{testimonials[currentTestimonial].text}"
                      </blockquote>
                      
                      <p className="font-semibold text-primary">
                        {testimonials[currentTestimonial].parent}
                      </p>
                      
                      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg p-4 mt-6">
                        <p className="text-accent font-medium">
                          💬 {testimonials[currentTestimonial].child}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={nextTestimonial}
                    className="text-primary hover:bg-primary/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-primary' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans Tarifaires */}
      <section id="plans" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Choisissez votre formule magique
            </h2>
            <p className="text-xl text-muted-foreground">
              Des prix transparents pour des souvenirs inestimables
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "9€",
                period: "/mois",
                description: "Parfait pour commencer l'aventure",
                features: [
                  "3 livres personnalisés par mois",
                  "Histoires uniques générées par IA", 
                  "Illustrations sur mesure",
                  "Téléchargement PDF",
                  "Support par email"
                ],
                popular: false,
                gradient: "from-primary to-secondary"
              },
              {
                name: "Premium",
                price: "19€", 
                period: "/mois",
                description: "L'expérience magique complète",
                features: [
                  "Livres illimités",
                  "Styles d'illustrations variés",
                  "Impression haute qualité disponible",
                  "Personnalisations avancées",
                  "Support prioritaire",
                  "Accès aux nouveautés en avant-première"
                ],
                popular: true,
                gradient: "from-secondary to-accent"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card className={`relative overflow-hidden border-2 ${
                  plan.popular 
                    ? 'border-secondary shadow-2xl' 
                    : 'border-primary/20 shadow-lg'
                } bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-secondary to-accent text-white px-4 py-1 text-sm font-medium">
                      ⭐ Populaire
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center mt-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {user ? (
                      <Button
                        onClick={() => handleCheckout(plan.name.toLowerCase() as 'starter' | 'premium')}
                        className={`w-full mt-6 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-medium py-3 transition-all duration-300 ${
                          selectedPlan === plan.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                      >
                        {selectedPlan === plan.name ? 'Plan sélectionné ✓' : 'Choisir ce plan'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePlanSelection(plan.name)}
                        className={`w-full mt-6 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-medium py-3 transition-all duration-300 ${
                          selectedPlan === plan.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        asChild
                      >
                        <Link to="/auth">
                          {selectedPlan === plan.name ? 'Plan sélectionné ✓' : 'Choisir ce plan'}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Questions fréquentes
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Est-ce que c'est imprimable ?",
                answer: "Oui ! Vous pouvez télécharger votre livre en PDF haute qualité ou commander une version imprimée professionnelle."
              },
              {
                question: "Est-ce que je peux inclure une photo ?",
                answer: "Bien sûr ! Vous pouvez ajouter la photo de votre enfant pour une personnalisation encore plus poussée."
              },
              {
                question: "Les histoires sont-elles uniques ?",
                answer: "Absolument ! Chaque histoire est générée spécialement pour votre enfant, aucune ne se ressemble."
              },
              {
                question: "Pour quel âge ?",
                answer: "Nos histoires sont adaptées aux enfants de 3 à 10 ans, avec des contenus personnalisés selon l'âge."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/50 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-primary mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;