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

  const { signIn, signUp, resetPassword, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const planSelected = location.state?.planSelected;

  useEffect(() => {
    if (user) {
      // Si un plan a été sélectionné, rediriger vers la page plans
      if (planSelected) {
        navigate('/plans', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from, planSelected]);

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
            title: t('auth.error'),
            description: t('auth.gdprError'),
            variant: 'destructive',
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: t('auth.error'),
            description: t('auth.passwordMismatch'),
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
            title: t('auth.error'),
            description: t('auth.signupError'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.success'),
            description: t('auth.signupSuccess'),
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          toast({
            title: t('auth.error'),
            description: t('auth.signinError'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? t('auth.signup') : t('auth.signin')}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? t('auth.createAccountDesc')
                : t('auth.signInDesc')
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
                      {t('auth.gdprConsent')}{" "}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">
                        {t('auth.terms')}
                      </Link>{" "}
                      {t('auth.and')}{" "}
                      <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                        {t('auth.privacy')}
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
                      {t('auth.newsletterConsent')}
                    </Label>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? t('auth.loading') : (isSignUp ? t('auth.signup') : t('auth.signin'))}
              </Button>
            </form>
            
            {!isSignUp && (
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={async () => {
                    if (!formData.email) {
                      toast({
                        title: t('auth.error'),
                        description: 'Veuillez entrer votre email d\'abord',
                        variant: 'destructive',
                      });
                      return;
                    }
                    
                    const { error } = await resetPassword(formData.email);
                    if (error) {
                      toast({
                        title: t('auth.error'),
                        description: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
                        variant: 'destructive',
                      });
                    } else {
                      toast({
                        title: 'Email envoyé',
                        description: 'Vérifiez votre email pour réinitialiser votre mot de passe',
                      });
                    }
                  }}
                >
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