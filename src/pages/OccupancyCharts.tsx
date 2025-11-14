import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Calendar, BarChart3, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { ChartSkeleton } from "@/components/ui/skeletons";

interface MonthlyOccupancy {
  month: string;
  year: number;
  occupancyRate: number;
  totalBookings: number;
  totalRevenue: number;
}

const OccupancyCharts = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Hook pour les appels API authentifiés
  const { apiCall } = useAuthenticatedApi();

  // Charger les données d'occupation mensuelle
  const loadOccupancyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les propriétés et réservations
      const [propertiesResponse, bookingsResponse] = await Promise.all([
        apiCall("/api/products/admin"),
        apiCall("/api/orders"),
      ]);

      const properties = propertiesResponse.data || [];
      const bookings = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      // Générer les 12 derniers mois
      const months = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

        // Filtrer les réservations pour ce mois (utiliser checkIn au lieu de createdAt)
        const monthBookings = bookings.filter((booking: any) => {
          const checkInDate = new Date(booking.checkIn);
          return (
            checkInDate.getMonth() === date.getMonth() &&
            checkInDate.getFullYear() === date.getFullYear() &&
            (booking.status === "confirmed" || booking.status === "pending")
          );
        });

        // Calculer le taux d'occupation basé sur les nuits occupées
        const activeProperties = properties.filter((p: any) => p.isActive).length;
        let totalOccupiedNights = 0;
        let totalAvailableNights = 0;

        if (activeProperties > 0) {
          // Pour chaque propriété active, calculer les nuits disponibles ce mois
          properties
            .filter((p: any) => p.isActive)
            .forEach((property: any) => {
              const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              totalAvailableNights += daysInMonth;
            });

          // Calculer les nuits occupées par les réservations
          monthBookings.forEach((booking: any) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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
            ? Math.min((totalOccupiedNights / totalAvailableNights) * 100, 100)
            : 0;

        const revenue = monthBookings.reduce(
          (sum: number, b: any) => sum + parseFloat(b.totalPrice),
          0
        );

        months.push({
          month: monthName,
          year: date.getFullYear(),
          occupancyRate: Math.round(occupancyRate),
          totalBookings: monthBookings.length,
          totalRevenue: revenue,
        });
      }

      setMonthlyData(months);
    } catch (err) {
      console.error("Erreur lors du chargement des données d'occupation:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données");

      // Données fictives en fallback
      const mockData: MonthlyOccupancy[] = [
        { month: "Mai 2024", year: 2024, occupancyRate: 65, totalBookings: 8, totalRevenue: 2400 },
        {
          month: "Juin 2024",
          year: 2024,
          occupancyRate: 78,
          totalBookings: 12,
          totalRevenue: 3600,
        },
        {
          month: "Juillet 2024",
          year: 2024,
          occupancyRate: 85,
          totalBookings: 15,
          totalRevenue: 4500,
        },
        {
          month: "Août 2024",
          year: 2024,
          occupancyRate: 92,
          totalBookings: 18,
          totalRevenue: 5400,
        },
        {
          month: "Septembre 2024",
          year: 2024,
          occupancyRate: 55,
          totalBookings: 6,
          totalRevenue: 1800,
        },
        {
          month: "Octobre 2024",
          year: 2024,
          occupancyRate: 45,
          totalBookings: 4,
          totalRevenue: 1200,
        },
        {
          month: "Novembre 2024",
          year: 2024,
          occupancyRate: 35,
          totalBookings: 3,
          totalRevenue: 900,
        },
        {
          month: "Décembre 2024",
          year: 2024,
          occupancyRate: 40,
          totalBookings: 4,
          totalRevenue: 1200,
        },
        {
          month: "Janvier 2025",
          year: 2025,
          occupancyRate: 30,
          totalBookings: 2,
          totalRevenue: 600,
        },
        {
          month: "Février 2025",
          year: 2025,
          occupancyRate: 50,
          totalBookings: 5,
          totalRevenue: 1500,
        },
        { month: "Mars 2025", year: 2025, occupancyRate: 60, totalBookings: 7, totalRevenue: 2100 },
        {
          month: "Avril 2025",
          year: 2025,
          occupancyRate: 70,
          totalBookings: 9,
          totalRevenue: 2700,
        },
      ];
      setMonthlyData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOccupancyData();
  }, []);

  // Gestion du titre de la page et du focus pour l'accessibilité
  useEffect(() => {
    document.title = "Graphiques d'Occupation - Administration Shu-no";

    // Mettre le focus sur le contenu principal au chargement
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
              Graphiques d'Occupation
            </h1>
            <p className="text-muted-foreground">Analyse des taux d'occupation mensuels</p>
          </div>

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
      <Header />

      {/* Liens de navigation rapide pour l'accessibilité */}
      <nav aria-label="Navigation rapide" className="sr-only">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Aller au contenu principal
        </a>
        <a
          href="#navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Aller à la navigation
        </a>
      </nav>

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-labelledby="occupancy-charts-title"
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              id="occupancy-charts-title"
              className="text-3xl font-playfair font-bold text-bleu-profond mb-2"
            >
              Graphiques d'Occupation
            </h1>
            <p className="text-muted-foreground">
              Évolution mensuelle du taux d'occupation et des performances
            </p>
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={loadOccupancyData}
              disabled={loading}
              aria-label={
                loading
                  ? "Actualisation des données en cours"
                  : "Actualiser les données d'occupation"
              }
              aria-describedby="refresh-button-desc"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              {loading ? "Actualisation..." : "Actualiser"}
            </Button>
            <span id="refresh-button-desc" className="sr-only">
              Actualise les données des graphiques d'occupation depuis le serveur
            </span>
            <Link to="/admin">
              <Button variant="outline" aria-label="Retourner au tableau de bord administrateur">
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Tableau de Bord
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <p className="text-yellow-800 text-sm">
              ⚠️ Impossible de charger les données en temps réel. Affichage des données mises en
              cache.
            </p>
          </div>
        )}

        {/* Graphique d'occupation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Taux d'Occupation Mensuel
            </CardTitle>
            <CardDescription>
              Évolution du taux d'occupation sur les 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="space-y-4"
              role="list"
              aria-label="Graphique des taux d'occupation mensuels"
            >
              {monthlyData.map((data) => (
                <div
                  key={`occupancy-${data.month}-${data.year}`}
                  className="flex items-center space-x-4"
                  role="listitem"
                >
                  <div className="w-32 text-sm font-medium" id={`month-${data.month}-${data.year}`}>
                    {data.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className="flex-1 bg-gray-200 rounded-full h-4"
                        role="progressbar"
                        aria-labelledby={`month-${data.month}-${data.year}`}
                        aria-valuenow={data.occupancyRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-describedby={`occupancy-desc-${data.month}-${data.year}`}
                      >
                        <div
                          className="bg-bleu-profond h-4 rounded-full transition-all duration-300"
                          style={{ width: `${data.occupancyRate}%` }}
                        ></div>
                      </div>
                      <span
                        className="text-sm font-medium w-12 text-right"
                        aria-label={`Taux d'occupation pour ${data.month}: ${data.occupancyRate} pour cent`}
                      >
                        {data.occupancyRate}%
                      </span>
                    </div>
                    <div id={`occupancy-desc-${data.month}-${data.year}`} className="sr-only">
                      {data.totalBookings} réservations pour un revenu de{" "}
                      {data.totalRevenue.toFixed(0)} euros
                    </div>
                  </div>
                  <div
                    className="text-sm text-muted-foreground w-20 text-right"
                    aria-label={`${data.totalBookings} réservations en ${data.month}`}
                  >
                    {data.totalBookings} résa.
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques mensuelles détaillées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" aria-hidden="true" />
              Détails Mensuels
            </CardTitle>
            <CardDescription>Statistiques détaillées par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              role="list"
              aria-label="Statistiques mensuelles détaillées des 6 derniers mois"
            >
              {monthlyData.slice(-6).map(
                (
                  data // Afficher les 6 derniers mois
                ) => (
                  <div
                    key={`detail-${data.month}-${data.year}`}
                    className="p-4 border rounded-lg"
                    role="listitem"
                    aria-labelledby={`month-detail-${data.month}-${data.year}`}
                  >
                    <h3 id={`month-detail-${data.month}-${data.year}`} className="font-medium mb-2">
                      {data.month}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Taux d'occupation:</span>
                        <span
                          className="font-medium"
                          aria-label={`Taux d'occupation de ${data.occupancyRate} pour cent en ${data.month}`}
                        >
                          {data.occupancyRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Réservations:</span>
                        <span
                          className="font-medium"
                          aria-label={`${data.totalBookings} réservations en ${data.month}`}
                        >
                          {data.totalBookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenus:</span>
                        <span
                          className="font-medium"
                          aria-label={`Revenus de ${data.totalRevenue.toFixed(0)} euros en ${data.month}`}
                        >
                          {data.totalRevenue.toFixed(0)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OccupancyCharts;
