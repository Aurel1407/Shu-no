import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";

const UserRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Références pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    // Validation mot de passe - Cohérent avec backend
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URLS.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setSuccess(true);

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Inscription - Shu-no";
  }, []);

  // Gestion du focus sur le champ prénom au chargement
  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);

  if (success) {
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
            <Card role="status" aria-live="polite">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-green-600">
                  <UserPlus className="h-6 w-6" aria-hidden="true" />
                  Inscription réussie !
                </CardTitle>
                <CardDescription>
                  Votre compte a été créé avec succès. Vous allez être redirigé vers la page de
                  connexion.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <Card role="region" aria-labelledby="register-title">
            <CardHeader className="text-center">
              <CardTitle
                id="register-title"
                className="flex items-center justify-center gap-2 text-2xl"
              >
                <UserPlus className="h-6 w-6" aria-hidden="true" />
                Inscription
              </CardTitle>
              <CardDescription>Créez votre compte pour accéder à vos réservations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <Alert
                    id="register-error"
                    variant="destructive"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <fieldset className="grid grid-cols-2 gap-4">
                  <legend className="sr-only">Informations personnelles</legend>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      ref={firstNameInputRef}
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "register-error firstname-help" : "firstname-help"}
                      autoComplete="given-name"
                    />
                    <div id="firstname-help" className="sr-only">
                      Entrez votre prénom
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "register-error lastname-help" : "lastname-help"}
                      autoComplete="family-name"
                    />
                    <div id="lastname-help" className="sr-only">
                      Entrez votre nom de famille
                    </div>
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "register-error email-help" : "email-help"}
                    autoComplete="email"
                  />
                  <div id="email-help" className="sr-only">
                    Entrez votre adresse email pour créer votre compte
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe (8+ caractères, majuscule, minuscule, chiffre, @$!%*?&)"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      aria-invalid={!!error}
                      aria-describedby={error ? "register-error password-help" : "password-help"}
                      autoComplete="new-password"
                    />
                    <div id="password-help" className="sr-only">
                      Créez un mot de passe sécurisé : 8+ caractères avec majuscule, minuscule,
                      chiffre et caractère spécial
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      aria-invalid={!!error}
                      aria-describedby={
                        error ? "register-error confirm-password-help" : "confirm-password-help"
                      }
                      autoComplete="new-password"
                    />
                    <div id="confirm-password-help" className="sr-only">
                      Confirmez votre mot de passe en le saisissant à nouveau
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={
                        showConfirmPassword
                          ? "Masquer la confirmation du mot de passe"
                          : "Afficher la confirmation du mot de passe"
                      }
                    >
                      {showConfirmPassword ? (
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
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
                {loading && (
                  <div id="loading-status" className="sr-only" aria-live="polite">
                    Inscription en cours, veuillez patienter
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link
                    to="/login"
                    className="text-bleu-profond hover:underline"
                    aria-label="Accéder à la page de connexion"
                  >
                    Se connecter
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

export default UserRegister;
