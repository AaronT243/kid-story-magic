import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
          <Link 
            to="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Politique de confidentialité
          </Link>
          <span className="hidden md:inline">·</span>
          <Link 
            to="/terms" 
            className="hover:text-foreground transition-colors"
          >
            Conditions d'utilisation
          </Link>
          <span className="hidden md:inline">·</span>
          <Link 
            to="/contact" 
            className="hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-4">
          © 2025 StoryKid AI. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;