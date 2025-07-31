import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import LanguageSelector from './LanguageSelector';
import LanguageSelectorTest from './LanguageSelectorTest';

interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
}

const Navigation: React.FC<NavigationProps> = ({ showBackButton, backTo = '/stories', backLabel = 'Mes histoires' }) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
          StoryKidAI
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Language selector always visible */}
        <LanguageSelectorTest />
        
        {/* Desktop navigation */}
        {!isMobile && (
          <>
            {showBackButton && (
              <Button variant="outline" asChild>
                <Link to={backTo}>{backLabel}</Link>
              </Button>
            )}
            
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/stories">Mes histoires</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    const scrollToPlans = () => {
                      const element = document.getElementById('plans');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        console.log('Element with ID "plans" not found');
                      }
                    };
                    // Small delay to ensure DOM is ready
                    setTimeout(scrollToPlans, 50);
                  }}
                >
                  Tarifs
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">S'inscrire</Link>
                </Button>
              </>
            )}
          </>
        )}
        
        {/* Mobile dropdown menu */}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-border">
              {showBackButton && (
                <DropdownMenuItem asChild>
                  <Link to={backTo} className="w-full">
                    {backLabel}
                  </Link>
                </DropdownMenuItem>
              )}
              
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/stories" className="w-full">
                      Mes histoires
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="w-full">
                    Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => {
                      const scrollToPlans = () => {
                        const element = document.getElementById('plans');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          console.log('Element with ID "plans" not found');
                        }
                      };
                      // Small delay to ensure DOM is ready
                      setTimeout(scrollToPlans, 50);
                    }}
                    className="w-full cursor-pointer"
                  >
                    Tarifs
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="w-full">
                      Se connecter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="w-full">
                      S'inscrire
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navigation;