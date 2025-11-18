import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";
import { usePageFocus } from "@/hooks/use-page-focus";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { StatsSkeleton, ChartSkeleton } from "@/components/ui/skeletons";

interface Property {
  id: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  checkIn: string;
  checkOut: string;
  totalPrice: string | number;
}

interface User {
  id: string;
}

interface Contact {
  id: string;
  status: string;
  isRead?: boolean;
}

interface Stats {
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalUsers: number;
  totalContacts: number;
  unreadContacts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
  });

  // Vérifier l'authentification au montage du composant
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  // Hooks personnalisés
  const mainContentRef = usePageFocus();
  usePageTitle("Tableau de Bord Admin");
  const { apiCall } = useAuthenticatedApi();

  const loadStatsOperation = useAsyncOperation(async () => {
    // Charger les propriétés
    const propertiesResponse = await apiCall(API_URLS.PRODUCTS_ADMIN);
    const properties = propertiesResponse.data || propertiesResponse; // Support des deux formats

    const activeProperties = Array.isArray(properties)
      ? properties.filter((p: Property) => p.isActive).length
      : 0;

    // Charger les réservations
    const bookingsResponse = await apiCall(API_URLS.ORDERS);
    const bookings = bookingsResponse.data || bookingsResponse;

    const pendingBookings = Array.isArray(bookings)
      ? bookings.filter((b: Booking) => b.status === "pending").length
      : 0;
    const confirmedBookings = Array.isArray(bookings)
      ? bookings.filter((b: Booking) => b.status === "confirmed").length
      : 0;
    const cancelledBookings = Array.isArray(bookings)
      ? bookings.filter((b: Booking) => b.status === "cancelled").length
      : 0;

    // Charger les utilisateurs
    const usersResponse = await apiCall(API_URLS.USERS);
    const users = usersResponse.data || usersResponse;

    // Calculer les revenus
    const totalRevenue = Array.isArray(bookings)
      ? bookings
          .filter((b: Booking) => b.status === "confirmed" || b.status === "pending")
          .reduce((sum: number, b: Booking) => sum + parseFloat(String(b.totalPrice || 0)), 0)
      : 0;

    // Calculer le taux d'occupation basé sur les réservations du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBookings = Array.isArray(bookings)
      ? bookings.filter((b: Booking) => {
          const checkInDate = new Date(b.checkIn);
          return (
            checkInDate.getMonth() === currentMonth &&
            checkInDate.getFullYear() === currentYear &&
            (b.status === "confirmed" || b.status === "pending")
          );
        })
      : [];

    const monthlyRevenue = monthlyBookings.reduce(
      (sum: number, b: Booking) => sum + parseFloat(String(b.totalPrice || 0)),
      0
    );

    // Calculer le taux d'occupation réel basé sur les nuits occupées
    let totalOccupiedNights = 0;
    let totalAvailableNights = 0;

    if (Array.isArray(properties) && properties.length > 0) {
      const activeProperties = properties.filter((p: Property) => p.isActive);
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      // Nuits disponibles = propriétés actives × jours dans le mois
      totalAvailableNights = activeProperties.length * daysInMonth;

      // Calculer les nuits occupées
      monthlyBookings.forEach((booking: Booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);

        // Calculer l'intersection entre la réservation et le mois
        const overlapStart = checkIn > monthStart ? checkIn : monthStart;
        const overlapEnd = checkOut < monthEnd ? checkOut : monthEnd;

        if (overlapStart < overlapEnd) {
          const nights = Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
          );
          totalOccupiedNights += nights;
        }
      });
    }

    const occupancyRate =
      totalAvailableNights > 0
        ? Math.min(Math.round((totalOccupiedNights / totalAvailableNights) * 100), 100)
        : 0;

    // Charger les contacts
    const contactsResponse = await apiCall(API_URLS.CONTACTS);
    const contacts = contactsResponse.data || contactsResponse;
    const unreadContacts = Array.isArray(contacts)
      ? contacts.filter((c: Contact) => !c.isRead).length
      : 0;

    setStats({
      totalProperties: Array.isArray(properties) ? properties.length : 0,
      activeProperties,
      totalBookings: Array.isArray(bookings) ? bookings.length : 0,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers: Array.isArray(users) ? users.length : 0,
      totalContacts: Array.isArray(contacts) ? contacts.length : 0,
      unreadContacts,
      totalRevenue,
      monthlyRevenue,
      occupancyRate,
    });
  });

  useEffect(() => {
    loadStatsOperation.execute().catch((error) => {
      // Si erreur d'authentification, rediriger vers la page de connexion
      if (
        error.message?.includes("Token d'authentification manquant") ||
        error.statusCode === 401
      ) {
        navigate("/admin/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Supprimé loadStatsOperation pour éviter la boucle infinie

  if (loadStatsOperation.loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground">Aperçu général de votre activité</p>
          </div>

          <StatsSkeleton count={4} className="mb-8" />

          <div className="grid md:grid-cols-2 gap-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
        href="#stats-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux statistiques
      </a>
      <a
        href="#actions-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux actions
      </a>

      <Header />
      <div
        id="main-content"
        className="container mx-auto px-4 py-8"
        role="main"
        aria-labelledby="dashboard-title"
        ref={mainContentRef}
        tabIndex={-1}
      >
        <div className="mb-8">
          <h1
            id="dashboard-title"
            className="text-3xl font-playfair font-bold text-bleu-profond mb-2"
          >
            Tableau de Bord Administrateur
          </h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>

        {loadStatsOperation.error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Impossible de charger les statistiques en temps réel. Affichage des données mises
              en cache.
            </p>
          </div>
        )}

        {/* Statistiques principales */}
        <div
          id="stats-section"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Link
            to="/admin/properties"
            aria-label={`Voir les détails des propriétés - ${stats.totalProperties} propriétés au total dont ${stats.activeProperties} actives`}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Propriétés</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">{stats.activeProperties} actives</p>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/admin/bookings"
            aria-label={`Voir les détails des réservations - ${stats.totalBookings} réservations au total dont ${stats.pendingBookings} en attente`}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingBookings} en attente</p>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/admin/contacts"
            aria-label={`Voir les messages de contact - ${stats.totalContacts} messages au total dont ${stats.unreadContacts} non lus`}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages de Contact</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContacts}</div>
                <p className="text-xs text-muted-foreground">{stats.unreadContacts} non lus</p>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/admin/revenue"
            aria-label={`Voir les détails des revenus - ${stats.totalRevenue.toFixed(0)}€ au total avec ${stats.monthlyRevenue.toFixed(0)}€ ce mois`}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}€</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.monthlyRevenue.toFixed(0)}€ ce mois
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/admin/occupancy"
            aria-label={`Voir les détails du taux d'occupation - ${stats.occupancyRate}% d'occupation actuel`}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Occupation</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <Progress value={stats.occupancyRate} className="mt-2" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Graphiques et détails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Statut des réservations */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des Réservations</CardTitle>
              <CardDescription>Répartition des réservations par statut</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">En attente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.pendingBookings}</span>
                  <Badge variant="secondary">
                    {((stats.pendingBookings / stats.totalBookings) * 100 || 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={(stats.pendingBookings / stats.totalBookings) * 100 || 0}
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Confirmées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.confirmedBookings}</span>
                  <Badge variant="default">
                    {((stats.confirmedBookings / stats.totalBookings) * 100 || 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={(stats.confirmedBookings / stats.totalBookings) * 100 || 0}
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Annulées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.cancelledBookings}</span>
                  <Badge variant="destructive">
                    {((stats.cancelledBookings / stats.totalBookings) * 100 || 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={(stats.cancelledBookings / stats.totalBookings) * 100 || 0}
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* Alertes et notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Alertes et Notifications</CardTitle>
              <CardDescription>Éléments nécessitant votre attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.pendingBookings > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.pendingBookings} réservation{stats.pendingBookings > 1 ? "s" : ""} en
                      attente
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Nécessite{stats.pendingBookings > 1 ? "nt" : ""} confirmation
                    </p>
                  </div>
                </div>
              )}

              {stats.activeProperties < stats.totalProperties && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {stats.totalProperties - stats.activeProperties} propriété
                      {stats.totalProperties - stats.activeProperties > 1 ? "s" : ""} inactive
                      {stats.totalProperties - stats.activeProperties > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      À vérifier et réactiver si nécessaire
                    </p>
                  </div>
                </div>
              )}

              {stats.occupancyRate < 50 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Taux d'occupation faible</p>
                    <p className="text-xs text-orange-700 mt-1">
                      {stats.occupancyRate}% - Considérez des promotions
                    </p>
                  </div>
                </div>
              )}

              {stats.pendingBookings === 0 &&
                stats.activeProperties === stats.totalProperties &&
                stats.occupancyRate >= 50 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Tout est en ordre !</p>
                      <p className="text-xs text-green-700 mt-1">
                        Aucune action requise pour le moment
                      </p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div id="actions-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Gestion des Annonces
              </CardTitle>
              <CardDescription>
                Ajoutez, modifiez ou supprimez vos annonces de propriétés
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Link to="/admin/properties">
                <Button
                  className="w-full btn-primary-enhanced"
                  aria-label="Accéder à la gestion des annonces de propriétés"
                >
                  Gérer les Annonces
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestion des Réservations
              </CardTitle>
              <CardDescription>Consultez et gérez toutes les réservations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
              <Link to="/admin/bookings">
                <Button
                  className="w-full btn-primary-enhanced"
                  aria-label="Accéder à la gestion des réservations"
                >
                  Gérer les Réservations
                </Button>
              </Link>
              {stats.pendingBookings > 0 && (
                <Link to="/admin/bookings?filter=pending">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced"
                    aria-label={`Traiter les ${stats.pendingBookings} réservations en attente`}
                  >
                    Traiter les Réservations ({stats.pendingBookings})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Périodes de Prix
              </CardTitle>
              <CardDescription>Définissez des prix saisonniers pour vos propriétés</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Link to="/admin/price-periods">
                <Button
                  className="w-full btn-primary-enhanced"
                  aria-label="Accéder à la gestion des périodes de prix"
                >
                  Gérer les Prix
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Section Utilisateurs et Paramètres */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Administration
              </CardTitle>
              <CardDescription>Outils d'administration supplémentaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 admin-section">
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full btn-outline-enhanced">
                    <Users className="h-4 w-4 mr-2" />
                    Gestion Utilisateurs
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full btn-outline-enhanced">
                    <Home className="h-4 w-4 mr-2" />
                    Retour au Site
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
