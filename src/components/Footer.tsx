import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

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
        
        <div className="flex justify-center items-center space-x-6 mt-6">
          <a 
            href="https://www.facebook.com/share/1KNynNqMca/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={20} />
          </a>
          <a 
            href="https://www.instagram.com/storykidai_?igsh=MXR5cWl4OXdodnJwaA%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a 
            href="https://www.tiktok.com/@storykidai1?_t=ZN-8yjnTXl2qz0&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="TikTok"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          © 2025 StoryKid AI. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;