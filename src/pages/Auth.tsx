import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';
import { Link } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!gdprConsent) {
          toast({
            title: 'Erreur',
            description: 'Vous devez accepter les conditions générales et la politique de confidentialité',
            variant: 'destructive',
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Erreur',
            description: 'Les mots de passe ne correspondent pas',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        if (error) {
          toast({
            title: 'Erreur',
            description: t('auth.signupError'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Succès',
            description: t('auth.signupSuccess'),
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          toast({
            title: 'Erreur',
            description: t('auth.signinError'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center mb-6">
          <LanguageSelector />
        </div>
        
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? t('auth.signup') : t('auth.signin')}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Créez votre compte pour commencer'
                : 'Connectez-vous à votre compte'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50"
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50"
                  />
                </div>
              )}

              {isSignUp && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="gdpr-consent"
                      checked={gdprConsent}
                      onCheckedChange={(checked) => setGdprConsent(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="gdpr-consent" className="text-sm leading-relaxed cursor-pointer">
                      J'accepte les{" "}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">
                        conditions générales
                      </Link>{" "}
                      et la{" "}
                      <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                        politique de confidentialité
                      </Link>. <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="newsletter-consent"
                      checked={newsletterConsent}
                      onCheckedChange={(checked) => setNewsletterConsent(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="newsletter-consent" className="text-sm leading-relaxed cursor-pointer">
                      Je souhaite recevoir la newsletter et les nouveautés de StoryKid AI.
                    </Label>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Chargement...' : (isSignUp ? t('auth.signup') : t('auth.signin'))}
              </Button>
            </form>
            
            {!isSignUp && (
              <div className="mt-4 text-center">
                <Button variant="link" className="text-sm">
                  {t('auth.forgotPassword')}
                </Button>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
              </p>
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-medium"
              >
                {isSignUp ? t('auth.signin') : t('auth.signup')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;