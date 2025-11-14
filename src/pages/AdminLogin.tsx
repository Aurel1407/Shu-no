import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";
import { useRoutePreloader } from "@/hooks/use-route-preloader";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { preloadAdminRoutes } = useRoutePreloader();

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URLS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const data = await response.json();

      // La réponse peut avoir la structure { success: true, data: { accessToken, user } }
      const responseData = data.data || data;
      const token = responseData.accessToken || responseData.token;
      const user = responseData.user;

      // Vérifier que l'utilisateur a le rôle admin
      if (user?.role !== "admin") {
        throw new Error("Accès refusé : compte non administrateur");
      }

      // Stocker le vrai token JWT
      localStorage.setItem("adminToken", token);

      // Précharger les routes admin pour une meilleure expérience utilisateur
      preloadAdminRoutes();

      navigate("/admin");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la connexion";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Connexion Admin - Shu-no";
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
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au formulaire de connexion
      </a>

      <Header />
      <div
        id="main-content"
        className="container mx-auto px-4 py-8"
        role="main"
        aria-labelledby="login-title"
        ref={mainContentRef}
        tabIndex={-1}
      >
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle id="login-title" className="flex items-center justify-center gap-2">
                <Lock className="h-6 w-6" />
                Connexion Administrateur
              </CardTitle>
              <CardDescription>Accédez au panneau d'administration</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="login-form"
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
                aria-labelledby="login-title"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@shu-no.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      aria-label="Adresse email administrateur"
                      aria-describedby="email-help"
                      autoComplete="email"
                      required
                    />
                    <span id="email-help" className="sr-only">
                      Entrez votre adresse email administrateur pour accéder au panneau
                      d'administration
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      aria-label="Mot de passe administrateur"
                      aria-describedby="password-help"
                      autoComplete="current-password"
                      required
                    />
                    <span id="password-help" className="sr-only">
                      Entrez votre mot de passe administrateur pour accéder au panneau
                      d'administration
                    </span>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" role="alert" aria-live="assertive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-bleu-profond hover:bg-bleu-moyen"
                  disabled={loading}
                  aria-label={
                    loading ? "Connexion en cours..." : "Se connecter au panneau d'administration"
                  }
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              <div
                className="mt-6 p-4 bg-muted rounded-lg"
                role="region"
                aria-labelledby="test-info-title"
              >
                <p id="test-info-title" className="text-sm text-muted-foreground mb-2">
                  <strong>Informations de test :</strong>
                </p>
                <p className="text-sm">
                  Email: admin@shu-no.com
                  <br />
                  Mot de passe: Admin123!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;
