import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SkipLinks from "./SkipLinks";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Vérifier si l'utilisateur est connecté au chargement du composant
  useEffect(() => {
    const checkUserData = () => {
      const token = localStorage.getItem("userToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          // Nettoyer les données corrompues
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Vérifier les données au montage
    checkUserData();

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData" || e.key === "userToken") {
        checkUserData();
      }
    };

    globalThis.addEventListener("storage", handleStorageChange);

    return () => {
      globalThis.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fonction pour obtenir le texte d'affichage
  const getDisplayText = () => {
    if (user?.firstName) {
      return `Bonjour ${user.firstName}`;
    }
    return "Mon Compte";
  };

  return (
    <>
      <SkipLinks />
      <header className="bg-background shadow-lg sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-bleu-clair to-bleu-profond rounded-full flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-xl">SN</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-playfair font-bold text-foreground">Shu no</h1>
                <p className="text-sm text-muted-foreground">Gîtes et Chambres d'hôtes</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav id="main-nav" className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground hover:text-bleu-profond transition-colors">
                Accueil
              </Link>
              <Link
                to="/booking"
                className="text-foreground hover:text-bleu-profond transition-colors"
              >
                Réserver
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-bleu-profond transition-colors"
              >
                Contact
              </Link>
              <ThemeToggle />
              <Link
                to="/account"
                className="bg-bleu-profond hover:bg-bleu-moyen text-white flex items-center space-x-2 min-h-[44px] min-w-[44px] px-4 py-2 rounded-md transition-colors font-medium"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>{getDisplayText()}</span>
              </Link>
            </nav>

            {/* Menu Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                className="text-foreground hover:bg-accent"
              >
                {isMenuOpen ? (
                  <X size={24} aria-hidden="true" />
                ) : (
                  <Menu size={24} aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          {/* Menu Mobile Ouvert */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-foreground hover:text-bleu-profond transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/booking"
                  className="text-foreground hover:text-bleu-profond transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Réserver
                </Link>
                <Link
                  to="/contact"
                  className="text-foreground hover:text-bleu-profond transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/account"
                  className="bg-bleu-profond hover:bg-bleu-moyen text-white w-full flex items-center justify-center space-x-2 min-h-[44px] px-4 py-3 rounded-md transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>{getDisplayText()}</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
