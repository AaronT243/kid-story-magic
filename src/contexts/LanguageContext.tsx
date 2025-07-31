import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SupportedLanguage = 'fr' | 'en' | 'es' | 'pt';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation keys and values
const translations: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.create': 'Créer une histoire',
    'nav.stories': 'Mes histoires',
    'nav.profile': 'Profil',
    'nav.admin': 'Administration',
    'nav.signin': 'Se connecter',
    'nav.signup': 'S\'inscrire',
    'nav.signout': 'Se déconnecter',
    
    // Auth
    'auth.signin': 'Se connecter',
    'auth.signup': 'S\'inscrire',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.firstName': 'Prénom',
    'auth.lastName': 'Nom',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.noAccount': 'Pas encore de compte ?',
    'auth.hasAccount': 'Déjà un compte ?',
    'auth.signupSuccess': 'Inscription réussie ! Vérifiez vos emails.',
    'auth.signinError': 'Email ou mot de passe incorrect',
    'auth.signupError': 'Erreur lors de l\'inscription',
    
    // Home
    'home.title': 'Bienvenue sur StoryKidAI',
    'home.subtitle': 'Créez des histoires personnalisées et illustrées pour vos enfants',
    'home.cta': 'Créer ma première histoire',
    'home.features.personalized': 'Histoires personnalisées',
    'home.features.illustrated': 'Illustrations IA',
    'home.features.pdf': 'Export PDF',
    'home.features.print': 'Impression possible',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.create': 'Create Story',
    'nav.stories': 'My Stories',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.signout': 'Sign Out',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.signupSuccess': 'Sign up successful! Check your email.',
    'auth.signinError': 'Invalid email or password',
    'auth.signupError': 'Sign up error',
    
    // Home
    'home.title': 'Welcome to StoryKidAI',
    'home.subtitle': 'Create personalized and illustrated stories for your children',
    'home.cta': 'Create my first story',
    'home.features.personalized': 'Personalized Stories',
    'home.features.illustrated': 'AI Illustrations',
    'home.features.pdf': 'PDF Export',
    'home.features.print': 'Print Available',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.create': 'Crear Historia',
    'nav.stories': 'Mis Historias',
    'nav.profile': 'Perfil',
    'nav.admin': 'Administración',
    'nav.signin': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.signout': 'Cerrar Sesión',
    
    // Auth
    'auth.signin': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.firstName': 'Nombre',
    'auth.lastName': 'Apellido',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.signupSuccess': '¡Registro exitoso! Revisa tu email.',
    'auth.signinError': 'Email o contraseña incorrectos',
    'auth.signupError': 'Error en el registro',
    
    // Home
    'home.title': 'Bienvenido a StoryKidAI',
    'home.subtitle': 'Crea historias personalizadas e ilustradas para tus hijos',
    'home.cta': 'Crear mi primera historia',
    'home.features.personalized': 'Historias Personalizadas',
    'home.features.illustrated': 'Ilustraciones IA',
    'home.features.pdf': 'Exportar PDF',
    'home.features.print': 'Impresión Disponible',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.create': 'Criar História',
    'nav.stories': 'Minhas Histórias',
    'nav.profile': 'Perfil',
    'nav.admin': 'Administração',
    'nav.signin': 'Entrar',
    'nav.signup': 'Cadastrar',
    'nav.signout': 'Sair',
    
    // Auth
    'auth.signin': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.firstName': 'Nome',
    'auth.lastName': 'Sobrenome',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.noAccount': 'Não tem conta?',
    'auth.hasAccount': 'Já tem conta?',
    'auth.signupSuccess': 'Cadastro realizado! Verifique seu email.',
    'auth.signinError': 'Email ou senha incorretos',
    'auth.signupError': 'Erro no cadastro',
    
    // Home
    'home.title': 'Bem-vindo ao StoryKidAI',
    'home.subtitle': 'Crie histórias personalizadas e ilustradas para seus filhos',
    'home.cta': 'Criar minha primeira história',
    'home.features.personalized': 'Histórias Personalizadas',
    'home.features.illustrated': 'Ilustrações IA',
    'home.features.pdf': 'Exportar PDF',
    'home.features.print': 'Impressão Disponível',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('language') as SupportedLanguage;
    const initialLang = saved && ['fr', 'en', 'es', 'pt'].includes(saved) ? saved : 'fr';
    console.log('LanguageContext: Initial language from localStorage:', saved, 'Using:', initialLang);
    return initialLang;
  });

  const setLanguage = (lang: SupportedLanguage) => {
    console.log('LanguageContext: Setting language from', language, 'to', lang);
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    console.log('LanguageContext: Language set, new state should be', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Update document language
    console.log('LanguageContext: useEffect triggered, setting document lang to:', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};