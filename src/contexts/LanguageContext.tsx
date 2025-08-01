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
    'auth.gdprError': 'Vous devez accepter les conditions générales et la politique de confidentialité',
    'auth.passwordMismatch': 'Les mots de passe ne correspondent pas',
    'auth.unexpectedError': 'Une erreur inattendue s\'est produite',
    'auth.createAccountDesc': 'Créez votre compte pour commencer',
    'auth.signInDesc': 'Connectez-vous à votre compte',
    'auth.gdprConsent': 'J\'accepte les',
    'auth.terms': 'conditions générales',
    'auth.and': 'et la',
    'auth.privacy': 'politique de confidentialité',
    'auth.newsletterConsent': 'Je souhaite recevoir la newsletter et les nouveautés de StoryKid AI.',
    'auth.loading': 'Chargement...',
    'auth.success': 'Succès',
    'auth.error': 'Erreur',
    
    // Home
    'home.title': 'Bienvenue sur StoryKidAI',
    'home.subtitle': 'Créez des histoires personnalisées et illustrées pour vos enfants',
    'home.cta': 'Créer ma première histoire',
    'home.features.personalized': 'Histoires personnalisées',
    'home.features.illustrated': 'Illustrations IA',
    'home.features.pdf': 'Export PDF',
    'home.features.print': 'Impression possible',
    
    // Dashboard
    'dashboard.welcome': 'Bonjour {name} 👋 Prêt(e) à créer une nouvelle aventure magique ?',
    'dashboard.welcomeDefault': 'Bonjour 👋 Prêt(e) à créer une nouvelle aventure magique ?',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.createBook': 'Créer un nouveau livre',
    'dashboard.myBooks': 'Voir mes livres',
    'dashboard.subscription': 'Gérer mon abonnement',
    'dashboard.profile': 'Modifier mon profil d\'enfant',
    'dashboard.downloads': 'Télécharger mes PDF',
    'dashboard.recentBooks': 'Mes derniers livres',
    'dashboard.noBooks': 'Aucun livre créé pour le moment',
    'dashboard.download': 'Télécharger',
    'dashboard.edit': 'Modifier',
    'dashboard.print': 'Imprimer',
    'dashboard.suggestions': 'Suggestions magiques',
    'dashboard.suggestionText': 'Et si aujourd\'hui {name} partait à la recherche d\'une licorne cachée dans la forêt magique ?',
    'dashboard.suggestionTextDefault': 'Et si aujourd\'hui vous partiez à la recherche d\'une licorne cachée dans la forêt magique ?',
    'dashboard.createStory': 'Créer cette histoire',
    'dashboard.createdOn': 'Créé le',
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
    
    // Dashboard
    'dashboard.welcome': 'Hello {name} 👋 Ready to create a new magical adventure?',
    'dashboard.welcomeDefault': 'Hello 👋 Ready to create a new magical adventure?',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.createBook': 'Create a new book',
    'dashboard.myBooks': 'View my books',
    'dashboard.subscription': 'Manage my subscription',
    'dashboard.profile': 'Edit my child profile',
    'dashboard.downloads': 'Download my PDFs',
    'dashboard.recentBooks': 'My recent books',
    'dashboard.noBooks': 'No books created yet',
    'dashboard.download': 'Download',
    'dashboard.edit': 'Edit',
    'dashboard.print': 'Print',
    'dashboard.suggestions': 'Magical suggestions',
    'dashboard.suggestionText': 'What if today {name} went searching for a unicorn hidden in the magical forest?',
    'dashboard.suggestionTextDefault': 'What if today you went searching for a unicorn hidden in the magical forest?',
    'dashboard.createStory': 'Create this story',
    'dashboard.createdOn': 'Created on',
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
    
    // Dashboard
    'dashboard.welcome': 'Hola {name} 👋 ¿Listo para crear una nueva aventura mágica?',
    'dashboard.welcomeDefault': 'Hola 👋 ¿Listo para crear una nueva aventura mágica?',
    'dashboard.quickActions': 'Acciones rápidas',
    'dashboard.createBook': 'Crear un nuevo libro',
    'dashboard.myBooks': 'Ver mis libros',
    'dashboard.subscription': 'Gestionar mi suscripción',
    'dashboard.profile': 'Editar mi perfil de niño',
    'dashboard.downloads': 'Descargar mis PDFs',
    'dashboard.recentBooks': 'Mis libros recientes',
    'dashboard.noBooks': 'Ningún libro creado aún',
    'dashboard.download': 'Descargar',
    'dashboard.edit': 'Editar',
    'dashboard.print': 'Imprimir',
    'dashboard.suggestions': 'Sugerencias mágicas',
    'dashboard.suggestionText': '¿Y si hoy {name} fuera en busca de un unicornio escondido en el bosque mágico?',
    'dashboard.suggestionTextDefault': '¿Y si hoy fueras en busca de un unicornio escondido en el bosque mágico?',
    'dashboard.createStory': 'Crear esta historia',
    'dashboard.createdOn': 'Creado el',
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
    
    // Dashboard
    'dashboard.welcome': 'Olá {name} 👋 Pronto para criar uma nova aventura mágica?',
    'dashboard.welcomeDefault': 'Olá 👋 Pronto para criar uma nova aventura mágica?',
    'dashboard.quickActions': 'Ações rápidas',
    'dashboard.createBook': 'Criar um novo livro',
    'dashboard.myBooks': 'Ver meus livros',
    'dashboard.subscription': 'Gerenciar minha assinatura',
    'dashboard.profile': 'Editar meu perfil infantil',
    'dashboard.downloads': 'Baixar meus PDFs',
    'dashboard.recentBooks': 'Meus livros recentes',
    'dashboard.noBooks': 'Nenhum livro criado ainda',
    'dashboard.download': 'Baixar',
    'dashboard.edit': 'Editar',
    'dashboard.print': 'Imprimir',
    'dashboard.suggestions': 'Sugestões mágicas',
    'dashboard.suggestionText': 'E se hoje {name} partisse em busca de um unicórnio escondido na floresta mágica?',
    'dashboard.suggestionTextDefault': 'E se hoje você partisse em busca de um unicórnio escondido na floresta mágica?',
    'dashboard.createStory': 'Criar esta história',
    'dashboard.createdOn': 'Criado em',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('fr');

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as SupportedLanguage;
    if (saved && ['fr', 'en', 'es', 'pt'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    console.log('LanguageContext: Setting language from', language, 'to', lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Force document language update
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Update document language when language changes
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};