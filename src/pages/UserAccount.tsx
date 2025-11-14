import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, CheckCircle, User, LogOut, X, CheckCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

interface Booking {
  id: number;
  product: {
    id: number;
    name: string;
    location: string;
    price: number;
    images?: string[];
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const UserAccount = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Références pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Fonction pour récupérer le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem("userToken");
  };

  // Fonction pour faire des appels API avec authentification
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  // Charger les données utilisateur et réservations
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer le profil utilisateur
      const userResponse = await apiCall(API_URLS.USERS_PROFILE);
      const userData = userResponse.data || userResponse; // Support des deux formats

      setUser(userData);

      // Mettre à jour les données utilisateur dans le localStorage
      localStorage.setItem("userData", JSON.stringify(userData));

      // Vérifier si l'utilisateur est admin
      setIsAdmin(userData?.role === "admin");

      // Récupérer les réservations de l'utilisateur
      const bookingsResponse = await apiCall(API_URLS.ORDERS_MY_BOOKINGS);
      const bookingsData = bookingsResponse.data || bookingsResponse;

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");

    // Déclencher un événement personnalisé pour mettre à jour le Header
    globalThis.dispatchEvent(
      new StorageEvent("storage", {
        key: "userToken",
        newValue: null,
        oldValue: localStorage.getItem("userToken"),
      })
    );

    navigate("/");
  };

  useEffect(() => {
    // Variable pour le token final à utiliser
    let finalToken = null;
    let userData = null;
    let source = "";

    if (location.state?.fromLogin && location.state?.token) {
      finalToken = location.state.token;
      userData = location.state.user;
      source = "navigation state";

      // Sauvegarder dans localStorage pour les futures visites
      localStorage.setItem("userToken", finalToken);
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      finalToken = getAuthToken();
      userData = localStorage.getItem("userData");
      source = "localStorage";
    }

    if (!finalToken) {
      navigate("/login");
      return;
    }

    loadUserData();
  }, [location.state]);

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = user ? `Mon Compte - ${user.email}` : "Mon Compte - Shu-no";
  }, [user]);

  // Séparer les réservations passées et futures
  const now = new Date();
  const upcomingBookings = bookings.filter(
    (booking) =>
      new Date(booking.checkIn) > now &&
      (booking.status === "confirmed" || booking.status === "pending")
  );
  const pastBookings = bookings.filter(
    (booking) => new Date(booking.checkOut) < now || booking.status === "completed"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge
            variant="default"
            className="bg-green-500"
            aria-label={`Statut de la réservation: Confirmée`}
          >
            <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
            Confirmée
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" aria-label={`Statut de la réservation: En attente`}>
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            En attente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" aria-label={`Statut de la réservation: Annulée`}>
            <X className="mr-1 h-3 w-3" aria-hidden="true" />
            Annulée
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-700"
            aria-label={`Statut de la réservation: Terminée`}
          >
            <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />
            Terminée
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" aria-label={`Statut de la réservation: ${status}`}>
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <output className="text-center" aria-live="polite" aria-label="Chargement en cours">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg">Chargement de votre compte...</span>
            </div>
          </output>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16" role="main">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-2" role="alert" aria-labelledby="login-title">
              <CardHeader className="text-center pb-4">
                <CardTitle id="login-title" className="text-2xl font-bold text-primary">
                  Connexion requise
                </CardTitle>
                <CardDescription className="text-lg" id="login-description">
                  Accès à votre compte personnel
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div
                  className="text-muted-foreground text-lg leading-relaxed"
                  aria-describedby="login-description"
                >
                  Vous devez être connecté pour accéder à cette page.
                </div>
                <div className="pt-4">
                  <Button asChild size="lg" className="w-full">
                    <Link to="/login" aria-label="Aller à la page de connexion">
                      Se connecter
                    </Link>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline"
                    aria-label="Créer un nouveau compte utilisateur"
                  >
                    Créer un compte
                  </Link>
                </div>
              </CardContent>
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
        className="container mx-auto px-4 py-8"
        role="main"
        id="main-content"
        tabIndex={-1}
        ref={mainContentRef}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-bleu-profond mb-2">Mon Compte</h1>
            <p className="text-muted-foreground">
              Gérez vos réservations et informations personnelles
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center space-x-2"
            aria-label="Se déconnecter de votre compte"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Déconnexion</span>
          </Button>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6"
            role="alert"
            aria-live="assertive"
            aria-label="Message d'erreur"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informations utilisateur */}
        <section aria-labelledby="user-info-title">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle id="user-info-title" className="flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                Informations personnelles
              </CardTitle>
              <CardDescription>Vos informations de compte et statistiques</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nom complet</dt>
                  <dd className="text-lg font-medium mt-1">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Non spécifié"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-lg font-medium mt-1">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Membre depuis</dt>
                  <dd className="text-lg font-medium mt-1">{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total réservations</dt>
                  <dd className="text-lg font-medium mt-1">{bookings.length}</dd>
                </div>
              </dl>

              {/* Bouton d'accès admin si l'utilisateur est admin */}
              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-bleu-profond">
                        Accès Administrateur
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Vous avez les droits d'administration. Accédez au panneau de gestion.
                      </p>
                    </div>
                    <Link to="/admin/login" aria-label="Accéder au panneau d'administration">
                      <Button className="bg-bleu-profond hover:bg-bleu-moyen text-white">
                        Panneau Admin
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Réservations */}
        <section aria-labelledby="bookings-title">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2" aria-label="Types de réservations">
              <TabsTrigger
                value="upcoming"
                className="flex items-center gap-2"
                aria-label={`Réservations à venir (${upcomingBookings.length})`}
              >
                <Clock className="h-4 w-4" aria-hidden="true" />À venir ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="flex items-center gap-2"
                aria-label={`Réservations passées (${pastBookings.length})`}
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Passées ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle id="bookings-title">Réservations à venir</CardTitle>
                  <CardDescription>Vos prochaines locations</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <output className="text-center py-8" aria-live="polite">
                      <Calendar
                        className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground mb-4">Aucune réservation à venir</p>
                      <Link to="/" aria-label="Découvrir les propriétés disponibles">
                        <Button>Découvrir nos propriétés</Button>
                      </Link>
                    </output>
                  ) : (
                    <ul className="space-y-4" aria-label="Liste des réservations à venir">
                      {upcomingBookings.map((booking) => (
                        <li key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.product?.name || "Propriété non disponible"}
                              </h3>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-4 w-4" aria-hidden="true" />
                                {booking.product?.location || "Localisation non disponible"}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm text-muted-foreground">Check-in</p>
                                <p className="font-medium">{formatDate(booking.checkIn)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm text-muted-foreground">Check-out</p>
                                <p className="font-medium">{formatDate(booking.checkOut)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <div>
                                <p className="text-sm text-muted-foreground">Voyageurs</p>
                                <p className="font-medium">
                                  {booking.guests} personne{booking.guests > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {calculateNights(booking.checkIn, booking.checkOut)} nuit
                              {calculateNights(booking.checkIn, booking.checkOut) > 1 ? "s" : ""}
                            </div>
                            <div
                              className="flex items-center gap-1 text-lg font-bold"
                              aria-label={`Prix total: ${booking.totalPrice} euros`}
                            >
                              {booking.totalPrice}€
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations passées</CardTitle>
                  <CardDescription>Historique de vos locations</CardDescription>
                </CardHeader>
                <CardContent>
                  {pastBookings.length === 0 ? (
                    <output className="text-center py-8" aria-live="polite">
                      <CheckCircle
                        className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground">Aucune réservation passée</p>
                    </output>
                  ) : (
                    <ul className="space-y-4" aria-label="Liste des réservations passées">
                      {pastBookings.map((booking) => (
                        <li key={booking.id} className="border rounded-lg p-4 opacity-75">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.product?.name || "Propriété non disponible"}
                              </h3>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-4 w-4" aria-hidden="true" />
                                {booking.product?.location || "Localisation non disponible"}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm text-muted-foreground">Séjour</p>
                                <p className="font-medium">
                                  {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <div>
                                <p className="text-sm text-muted-foreground">Voyageurs</p>
                                <p className="font-medium">
                                  {booking.guests} personne{booking.guests > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm text-muted-foreground">Réservé le</p>
                                <p className="font-medium">{formatDate(booking.createdAt)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {calculateNights(booking.checkIn, booking.checkOut)} nuit
                              {calculateNights(booking.checkIn, booking.checkOut) > 1 ? "s" : ""}
                            </div>
                            <div
                              className="flex items-center gap-1 text-lg font-bold"
                              aria-label={`Prix total: ${booking.totalPrice} euros`}
                            >
                              {booking.totalPrice}€
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserAccount;
