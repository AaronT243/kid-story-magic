import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ArrowLeft, Plus, Calendar, User, Palette, Loader2, Eye } from 'lucide-react';
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

const Stories = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStories();
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
          <Button asChild>
            <Link to="/create-story">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle histoire
            </Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mes histoires
          </h1>
          <p className="text-muted-foreground text-lg">
            Retrouvez toutes vos histoires personnalisées
          </p>
        </div>

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