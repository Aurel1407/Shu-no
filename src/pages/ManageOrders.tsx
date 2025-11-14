import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Calendar,
  Users,
  User,
  MapPin,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  DollarSign,
  CheckCircle,
  X,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TableSkeleton } from "@/components/ui/skeletons";

interface Order {
  id: number;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  product: {
    id: number;
    name: string;
    location: string;
    price: number;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Hook pour les appels API authentifiés
  const { apiCall } = useAuthenticatedApi();

  // Charger les réservations depuis l'API
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall("/api/orders");
      setOrders(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Gestion des commandes - Shu-no";
  }, []);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  // Changer le statut d'une réservation
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiCall(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      // Recharger la liste après modification
      await loadOrders();
      // Afficher un message de succès temporaire
      setError(null);
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMessage.textContent = "Statut modifié avec succès";
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la modification du statut");
    }
  };

  // Supprimer une réservation
  const handleDelete = async (orderId: number) => {
    try {
      await apiCall(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      // Recharger la liste après suppression
      await loadOrders();
      // Afficher un message de succès temporaire
      setError(null);
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMessage.textContent = "Réservation supprimée avec succès";
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
            Confirmée
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            En attente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" aria-hidden="true" />
            Annulée
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />
            Terminée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
              Gestion des Commandes
            </h1>
            <p className="text-muted-foreground">Gérez les commandes de vos gîtes</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Réservations</CardTitle>
              <CardDescription>Liste de toutes les réservations</CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={8} />
            </CardContent>
          </Card>
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
        href="#filters"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux filtres
      </a>
      <a
        href="#orders-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au tableau des commandes
      </a>

      <Header />

      {/* Contenu principal */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-label="Page de gestion des commandes"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-bleu-profond mb-2">
                Gestion des Commandes
              </h1>
              <p className="text-muted-foreground">Gérez les réservations et les commandes</p>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                onClick={loadOrders}
                disabled={loading}
                aria-label="Actualiser la liste des commandes"
                size="lg"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Actualiser
              </Button>
              <Link to="/admin">
                <Button variant="outline" size="lg" className="flex items-center" aria-label="Retourner au tableau de bord administrateur">
                  <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                  Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filtre */}
          <div id="filters" className="mb-6" role="region" aria-labelledby="filters-title">
            <h2 id="filters-title" className="sr-only">
              Filtres de recherche
            </h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" aria-label="Filtrer les commandes par statut">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les réservations</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des Réservations</CardTitle>
              <CardDescription>
                {filteredOrders.length} réservation{filteredOrders.length > 1 ? "s" : ""} trouvée
                {filteredOrders.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8" role="status" aria-live="polite">
                  <Calendar
                    className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground mb-4">Aucune réservation trouvée</p>
                </div>
              ) : (
                <div
                  id="orders-table"
                  role="region"
                  aria-labelledby="table-title"
                  aria-describedby="table-description"
                >
                  <h3 id="table-title" className="sr-only">
                    Tableau des commandes
                  </h3>
                  <p id="table-description" className="sr-only">
                    Liste des commandes avec informations détaillées et actions disponibles
                  </p>
                  <Table role="table" aria-label="Commandes">
                    <TableHeader>
                      <TableRow role="row">
                        <TableHead role="columnheader" aria-sort="none">
                          ID
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Client
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Propriété
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Dates
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Prix
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Statut
                        </TableHead>
                        <TableHead role="columnheader" aria-sort="none">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {order.user?.firstName && order.user?.lastName
                                    ? `${order.user.firstName} ${order.user.lastName}`
                                    : "Client"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.user?.email || "Email non disponible"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {order.product?.name || "Produit non disponible"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.product?.location || "Localisation non disponible"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDate(order.checkIn)} - {formatDate(order.checkOut)}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {calculateNights(order.checkIn, order.checkOut)} nuit
                                {calculateNights(order.checkIn, order.checkOut) > 1 ? "s" : ""}
                              </div>
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{order.guests} pers.</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{order.totalPrice}€</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger
                                className="w-32"
                                aria-label={`Changer le statut de la commande ${order.id}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="confirmed">Confirmée</SelectItem>
                                <SelectItem value="completed">Terminée</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    aria-label={`Supprimer la commande ${order.id} de ${order.user?.firstName || ""} ${order.user?.lastName || order.user?.email || "client"}`}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cette réservation ? Cette
                                      action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(order.id)}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ManageOrders;
