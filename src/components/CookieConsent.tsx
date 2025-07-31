import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-primary text-primary-foreground p-4 text-center z-50 shadow-lg">
      <p className="text-sm mb-3 max-w-4xl mx-auto">
        StoryKid AI utilise des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{" "}
        <Link 
          to="/privacy" 
          className="text-accent hover:underline font-medium"
        >
          politique de confidentialité
        </Link>.
      </p>
      <Button 
        onClick={handleAccept}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        J'accepte
      </Button>
    </div>
  );
};

export default CookieConsent;