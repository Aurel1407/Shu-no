import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Plus, Edit, Trash2, Eye, Home, AlertCircle, RefreshCw, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  description?: string;
  maxGuests?: number;
}

const ManageProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Hook pour les appels API authentifiés
  const { apiCall } = useAuthenticatedApi();

  // Charger les propriétés depuis l'API
  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall("/api/products/admin");
      setProperties(response.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des propriétés:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des propriétés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Gestion des propriétés - Shu-no";
  }, []);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  // Supprimer définitivement une propriété
  const handleDelete = async (id: number) => {
    try {
      await apiCall(`/api/products/${id}`, {
        method: "DELETE",
      });
      // Recharger la liste après suppression
      await loadProperties();
      // Afficher un message de succès temporaire
      setError(null);
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMessage.textContent = "Annonce supprimée définitivement avec succès";
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      let errorMessage = "Erreur lors de la suppression";
      if (err instanceof Error) {
        if (err.message.includes("400")) {
          errorMessage = "Impossible de supprimer l'annonce car elle a des réservations associées";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    }
  };

  // Restaurer une propriété supprimée
  const handleRestore = async (id: number) => {
    try {
      await apiCall(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: true }),
      });
      // Recharger la liste après restauration
      await loadProperties();
      // Afficher un message de succès temporaire
      setError(null);
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMessage.textContent = "Annonce restaurée avec succès";
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la restauration:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la restauration");
    }
  };

  // Activer/Désactiver une propriété
  const toggleActive = async (id: number) => {
    try {
      const property = properties.find((p) => p.id === id);
      if (!property) return;

      await apiCall(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          isActive: !property.isActive,
        }),
      });

      // Recharger la liste après modification
      await loadProperties();
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
              Gestion des Propriétés
            </h1>
            <p className="text-muted-foreground">Gérez vos propriétés et gîtes</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Propriétés</CardTitle>
              <CardDescription>Liste de toutes les propriétés</CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={6} />
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
        href="#properties-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au tableau des propriétés
      </a>

      <Header />

      {/* Contenu principal */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-label="Page de gestion des propriétés"
      >
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Administration', href: '/admin' },
              { label: 'Propriétés', current: true }
            ]}
            className="mb-6"
          />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-bleu-profond mb-2">
                Gestion des Annonces
              </h1>
              <p className="text-muted-foreground">Gérez vos propriétés et annonces</p>
            </div>
            <div className="flex gap-3 items-center">
              <Link to="/admin/properties/new">
                <Button className="btn-primary-enhanced flex items-center" size="lg">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Nouvelle Annonce
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={loadProperties}
                disabled={loading}
                aria-label="Actualiser la liste des propriétés"
                size="lg"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Actualiser
              </Button>
              <Link to="/admin">
                <Button
                  variant="outline"
                  aria-label="Retourner au tableau de bord administrateur"
                  size="lg"
                  className="flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                  Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Liste des Annonces</CardTitle>
              <CardDescription>
                {properties.filter((p) => p.isActive).length} annonce
                {properties.filter((p) => p.isActive).length > 1 ? "s" : ""} active
                {properties.filter((p) => p.isActive).length > 1 ? "s" : ""}
                {properties.some((p) => !p.isActive) && (
                  <>
                    {" "}
                    • {properties.filter((p) => !p.isActive).length} supprimée
                    {properties.filter((p) => !p.isActive).length > 1 ? "s" : ""}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                id="properties-table"
                role="region"
                aria-labelledby="table-title"
                aria-describedby="table-description"
              >
                <h3 id="table-title" className="sr-only">
                  Tableau des propriétés
                </h3>
                <p id="table-description" className="sr-only">
                  Liste des propriétés avec informations détaillées et actions disponibles
                </p>
                <Table aria-describedby="table-description">
                  <TableCaption>Liste complète des propriétés disponibles sur la plateforme</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        ID
                      </TableHead>
                      <TableHead>
                        Nom
                        </TableHead>
                      <TableHead>
                        Localisation
                      </TableHead>
                      <TableHead>
                        Prix/nuit
                      </TableHead>
                      <TableHead>
                        Capacité
                      </TableHead>
                      <TableHead>
                        Statut
                      </TableHead>
                      <TableHead>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow
                        key={property.id}
                        className={!property.isActive ? "opacity-60 bg-muted/50" : ""}
                      >
                        <TableCell>{property.id}</TableCell>
                        <TableCell className="font-medium">{property.name}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>{property.price}€</TableCell>
                        <TableCell>{property.maxGuests || "N/A"} pers.</TableCell>
                        <TableCell>
                          <Badge variant={property.isActive ? "default" : "destructive"}>
                            {property.isActive ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                                Active
                              </>
                            ) : (
                              <>
                                <X className="mr-1 h-3 w-3" aria-hidden="true" />
                                Supprimée
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link to={`/property/${property.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!property.isActive}
                                aria-label={`Voir les détails de ${property.name}`}
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </Link>
                            <Link to={`/admin/properties/${property.id}/edit`}>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!property.isActive}
                                aria-label={`Modifier ${property.name}`}
                              >
                                <Edit className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </Link>
                            {property.isActive ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleActive(property.id)}
                                  disabled={loading}
                                  aria-label={`Désactiver ${property.name}`}
                                >
                                  Désactiver
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      aria-label={`Supprimer définitivement ${property.name}`}
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer définitivement l'annonce
                                        "{property.name}" ? Cette action est irréversible et
                                        l'annonce sera supprimée de la base de données.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(property.id)}>
                                        Supprimer définitivement
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(property.id)}
                                disabled={loading}
                                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                aria-label={`Restaurer ${property.name}`}
                              >
                                Restaurer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ManageProperties;
