import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateStory = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    characters: [] as string[],
    theme: '',
    storyLength: 'medium',
    customCharacters: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const predefinedCharacters = [
    'Princesse', 'Dragon', 'Licorne', 'Pirate', 'Robot', 'Astronaute',
    'Sorcier', 'Chat', 'Chien', 'Éléphant', 'Lion', 'Ours'
  ];

  const themes = [
    { value: 'aventure', label: 'Aventure' },
    { value: 'amitie', label: 'Amitié' },
    { value: 'courage', label: 'Courage' },
    { value: 'magie', label: 'Magie' },
    { value: 'nature', label: 'Nature' },
    { value: 'espace', label: 'Espace' },
    { value: 'mer', label: 'Océan' },
    { value: 'foret', label: 'Forêt enchantée' }
  ];

  const handleCharacterToggle = (character: string) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.includes(character)
        ? prev.characters.filter(c => c !== character)
        : [...prev.characters, character]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour créer une histoire');
      return;
    }

    if (!formData.childName || !formData.childAge || !formData.theme) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);

    try {
      // Check subscription status and story limits
      const { data: subscriptionData } = await supabase.functions.invoke('check-subscription');
      
      if (subscriptionData && subscriptionData.max_stories_per_month !== -1) {
        if (subscriptionData.stories_created_this_month >= subscriptionData.max_stories_per_month) {
          toast.error(`Vous avez atteint votre limite de ${subscriptionData.max_stories_per_month} histoire(s) par mois. Passez à un plan supérieur pour créer plus d'histoires.`);
          navigate('/stories');
          return;
        }
      }

      // Combine predefined and custom characters
      const allCharacters = [...formData.characters];
      if (formData.customCharacters) {
        allCharacters.push(...formData.customCharacters.split(',').map(c => c.trim()));
      }

      // Create story in database
      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: `L'aventure de ${formData.childName}`,
          child_name: formData.childName,
          child_age: parseInt(formData.childAge),
          characters: allCharacters,
          theme: formData.theme,
          story_length: formData.storyLength,
          status: 'generating'
        })
        .select()
        .single();

      if (error) throw error;

      // Update story count in profile
      await supabase
        .from('profiles')
        .update({ 
          stories_created_this_month: (subscriptionData?.stories_created_this_month || 0) + 1 
        })
        .eq('user_id', user.id);

      // Generate story content using edge function
      const { data: generatedStory, error: generateError } = await supabase.functions.invoke('generate-story', {
        body: {
          storyId: story.id,
          childName: formData.childName,
          childAge: parseInt(formData.childAge),
          characters: allCharacters,
          theme: formData.theme,
          storyLength: formData.storyLength
        }
      });

      if (generateError) throw generateError;

      toast.success('Histoire créée avec succès !');
      navigate('/stories');
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast.error('Erreur lors de la création de l\'histoire');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour créer une histoire
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
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Créer une nouvelle histoire
            </h1>
            <p className="text-muted-foreground text-lg">
              Personnalisez votre histoire pour {user.email}
            </p>
          </div>

          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Informations sur l'histoire
              </CardTitle>
              <CardDescription>
                Remplissez les détails pour créer une histoire personnalisée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Child Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Nom de l'enfant *</Label>
                    <Input
                      id="childName"
                      value={formData.childName}
                      onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                      placeholder="Ex: Emma"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Âge de l'enfant *</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min="3"
                      max="12"
                      value={formData.childAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, childAge: e.target.value }))}
                      placeholder="Ex: 6"
                      required
                    />
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème de l'histoire *</Label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Characters */}
                <div className="space-y-4">
                  <Label>Personnages (choisissez jusqu'à 3)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {predefinedCharacters.map((character) => (
                      <div key={character} className="flex items-center space-x-2">
                        <Checkbox
                          id={character}
                          checked={formData.characters.includes(character)}
                          onCheckedChange={() => handleCharacterToggle(character)}
                          disabled={formData.characters.length >= 3 && !formData.characters.includes(character)}
                        />
                        <Label htmlFor={character} className="text-sm">
                          {character}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customCharacters">Autres personnages (optionnel)</Label>
                    <Textarea
                      id="customCharacters"
                      value={formData.customCharacters}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCharacters: e.target.value }))}
                      placeholder="Ajoutez d'autres personnages séparés par des virgules"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Story Length */}
                <div className="space-y-2">
                  <Label htmlFor="storyLength">Longueur de l'histoire</Label>
                  <Select value={formData.storyLength} onValueChange={(value) => setFormData(prev => ({ ...prev, storyLength: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Courte (5 minutes de lecture)</SelectItem>
                      <SelectItem value="medium">Moyenne (10 minutes de lecture)</SelectItem>
                      <SelectItem value="long">Longue (15 minutes de lecture)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Créer mon histoire
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;