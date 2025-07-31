import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { BookOpen, Sparkles, Download, Printer } from 'lucide-react';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">StoryKidAI</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/stories">Mes histoires</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Bonjour, {profile?.first_name || user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                {t('nav.signout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link to="/auth">{t('nav.signin')}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">{t('nav.signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        
        {user ? (
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/create-story">
              {profile?.stories_created_this_month && profile.stories_created_this_month > 0 
                ? "Continuer à créer mes histoires" 
                : "Créer ma première histoire"}
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">{t('home.cta')}</Link>
          </Button>
        )}
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('home.features.personalized')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Des histoires uniques adaptées à votre enfant
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('home.features.illustrated')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Illustrations générées par intelligence artificielle
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <Download className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('home.features.pdf')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Téléchargez vos histoires au format PDF
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <Printer className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('home.features.print')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Commandez une version imprimée de qualité
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
