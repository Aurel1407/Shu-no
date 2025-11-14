import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Page non trouvée - Shu-no";
  }, []);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Liens de navigation rapide pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au contenu principal
      </a>

      <Header />

      {/* Contenu principal */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-label="Page d'erreur 404"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1
              className="text-6xl font-playfair font-bold text-bleu-profond mb-4"
              aria-label="Erreur 404"
            >
              404
            </h1>
            <p className="text-xl text-muted-foreground mb-8">Oops ! Page non trouvée</p>
            <Link to="/">
              <Button
                className="bg-bleu-profond hover:bg-bleu-moyen text-white"
                aria-label="Retourner à la page d'accueil"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default NotFound;
