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
  BookOpen, 
  Download, 
  Printer, 
  User, 
  FolderOpen, 
  CreditCard,
  Sparkles,
  Wand2,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/dashboard-hero.jpg';
import slider1 from '@/assets/slider-1.jpg';
import slider2 from '@/assets/slider-2.jpg';
import slider3 from '@/assets/slider-3.jpg';
import slider4 from '@/assets/slider-4.jpg';
import slider5 from '@/assets/slider-5.jpg';
import slider6 from '@/assets/slider-6.jpg';

interface Story {
  id: string;
  title: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch recent stories
  useEffect(() => {
    const fetchRecentStories = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentStories(data || []);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentStories();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getWelcomeMessage = () => {
    const firstName = profile?.first_name;
    if (firstName) {
      return t('dashboard.welcome').replace('{name}', firstName);
    }
    return t('dashboard.welcomeDefault');
  };

  const getSuggestionText = () => {
    const firstName = profile?.first_name;
    if (firstName) {
      return t('dashboard.suggestionText').replace('{name}', firstName);
    }
    return t('dashboard.suggestionTextDefault');
  };

  const handleDownloadStory = async (storyId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { storyId }
      });
      if (error) throw error;
      
      // Open PDF in new tab
      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleReadStory = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  const handlePrintStory = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  const sliderImages = [
    { src: slider1, alt: "Princesse magique dans une forêt enchantée" },
    { src: slider2, alt: "Aventure magique avec des animaux" },
    { src: slider3, alt: "Monde fantastique avec des pingouins" },
    { src: slider4, alt: "Paysage magique de montagne" },
    { src: slider5, alt: "Aventure dans la nature avec des cerfs" },
    { src: slider6, alt: "Super-héros pour enfants" }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => 
        prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const quickActions = [
    {
      icon: BookOpen,
      title: t('dashboard.createBook'),
      description: 'Laissez libre cours à votre imagination',
      href: '/create-story',
      gradient: 'from-primary to-secondary',
      emoji: '📖'
    },
    {
      icon: FolderOpen,
      title: t('dashboard.myBooks'),
      description: 'Découvrez vos créations',
      href: '/stories',
      gradient: 'from-secondary to-accent',
      emoji: '📂'
    },
    {
      icon: CreditCard,
      title: t('dashboard.subscription'),
      description: 'Gérez votre abonnement',
      href: '/plans',
      gradient: 'from-accent to-primary',
      emoji: '🧾'
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c81eab' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='33' cy='5' r='1'/%3E%3Ccircle cx='3' cy='23' r='1.5'/%3E%3Ccircle cx='23' cy='17' r='1'/%3E%3Ccircle cx='13' cy='33' r='1'/%3E%3Ccircle cx='33' cy='23' r='1.5'/%3E%3Ccircle cx='43' cy='15' r='1'/%3E%3Ccircle cx='25' cy='35' r='1'/%3E%3Ccircle cx='45' cy='35' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
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
                className="mb-6"
              >
                <Sparkles className="h-12 w-12 text-secondary mb-4" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
                {getWelcomeMessage()}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Votre bibliothèque magique vous attend ! Créez de nouvelles aventures ou redécouvrez vos histoires préférées.
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 mb-8" 
                asChild
              >
                <Link to="/create-story">
                  <Wand2 className="mr-2 h-5 w-5" />
                  {t('dashboard.createBook')}
                </Link>
              </Button>

              {/* Image Slider */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="relative w-full h-full">
                  {sliderImages.map((image, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: currentSlideIndex === index ? 1 : 0,
                        scale: currentSlideIndex === index ? 1 : 1.1
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                  ))}
                </div>
                
                {/* Slider Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlideIndex === index 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      onClick={() => setCurrentSlideIndex(index)}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img 
                src={heroImage} 
                alt="Illustration magique pour enfants" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('dashboard.quickActions')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full bg-white/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${action.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {action.emoji}
                    </div>
                    <h3 className="font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors duration-300"
                      asChild
                    >
                      <Link to={action.href}>
                        <action.icon className="mr-2 h-4 w-4" />
                        Accéder
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Books */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BookOpen className="h-6 w-6" />
                  {t('dashboard.recentBooks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentStories.length > 0 ? (
                  <div className="space-y-4">
                    {recentStories.map((story) => (
                      <motion.div
                        key={story.id}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {story.title.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{story.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('dashboard.createdOn')} {formatDate(story.created_at)}
                          </p>
                        </div>
                         <div className="flex gap-2">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="hover:bg-primary hover:text-white"
                             onClick={() => handleDownloadStory(story.id)}
                           >
                             <Download className="h-4 w-4" />
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="hover:bg-secondary hover:text-white"
                             onClick={() => handleReadStory(story.id)}
                           >
                             <FileText className="h-4 w-4" />
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="hover:bg-accent hover:text-white"
                             onClick={() => handlePrintStory(story.id)}
                           >
                             <Printer className="h-4 w-4" />
                           </Button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">{t('dashboard.noBooks')}</p>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" asChild>
                      <Link to="/create-story">
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('dashboard.createBook')}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Magical Suggestions */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Sparkles className="h-6 w-6" />
                  {t('dashboard.suggestions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl mb-4"
                  >
                    🦄
                  </motion.div>
                  
                  <p className="text-lg font-medium text-foreground mb-6 italic">
                    "{getSuggestionText()}"
                  </p>
                  
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link to="/create-story">
                      <Wand2 className="mr-2 h-5 w-5" />
                      {t('dashboard.createStory')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;