import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";
import { useRoutePreloader } from "@/hooks/use-route-preloader";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { preloadUserRoutes } = useRoutePreloader();

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URLS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      // Stocker le token et les données utilisateur
      // La réponse peut avoir la structure { success: true, data: { accessToken, user } }
      const responseData = data.data || data; // Support des deux structures
      const token = responseData.accessToken || responseData.token; // Support des deux formats
      const user = responseData.user;

      localStorage.setItem("userToken", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // Précharger les routes utilisateur pour une meilleure expérience
      preloadUserRoutes();

      // Petite attente pour s'assurer que le localStorage est mis à jour
      setTimeout(() => {
        // Navigation avec state pour passer le token en cas de problème localStorage
        navigate("/account", {
          state: {
            token: token,
            user: user,
            fromLogin: true,
          },
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Connexion - Shu-no";
  }, []);

  // Gestion du focus sur le champ email au chargement
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Aller au contenu principal
      </a>

      <Header />
      <main
        className="container mx-auto px-4 py-16"
        role="main"
        id="main-content"
        tabIndex={-1}
        ref={mainContentRef}
      >
        <div className="max-w-md mx-auto">
          <Card role="region" aria-labelledby="login-title">
            <CardHeader className="text-center">
              <CardTitle
                id="login-title"
                className="flex items-center justify-center gap-2 text-2xl"
              >
                <LogIn className="h-6 w-6" aria-hidden="true" />
                Connexion
              </CardTitle>
              <CardDescription>
                Connectez-vous à votre compte pour gérer vos réservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <Alert id="login-error" variant="destructive" role="alert" aria-live="assertive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error email-help" : "email-help"}
                    autoComplete="email"
                  />
                  <div id="email-help" className="sr-only">
                    Entrez votre adresse email pour vous connecter
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "login-error password-help" : "password-help"}
                      autoComplete="current-password"
                    />
                    <div id="password-help" className="sr-only">
                      Entrez votre mot de passe
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  aria-describedby={loading ? "loading-status" : undefined}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
                {loading && (
                  <div id="loading-status" className="sr-only" aria-live="polite">
                    Connexion en cours, veuillez patienter
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link
                    to="/register"
                    className="text-bleu-profond hover:underline"
                    aria-label="Créer un nouveau compte utilisateur"
                  >
                    S'inscrire
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserLogin;
