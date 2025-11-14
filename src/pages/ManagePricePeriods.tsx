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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
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
import { Plus, Edit, Trash2, Calendar, AlertCircle, RefreshCw, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TableSkeleton } from "@/components/ui/skeletons";

interface PricePeriod {
  id: number;
  productId: number;
  startDate: string;
  endDate: string;
  price: number;
  name?: string;
  product?: {
    id: number;
    name: string;
    location: string;
  };
}

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
}

const ManagePricePeriods = () => {
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PricePeriod | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    startDate: "",
    endDate: "",
    price: "",
    name: "",
  });

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Hook pour les appels API authentifiés
  const { apiCall } = useAuthenticatedApi();

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les périodes de prix
      const periodsData = await apiCall("/api/price-periods");
      setPricePeriods(periodsData.data || periodsData);

      // Charger les propriétés
      const propertiesResult = await apiCall("/api/products");
      // L'API retourne { success: true, data: [...], count: number }
      const propertiesData = propertiesResult.data || propertiesResult;
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements du formulaire
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Ouvrir le dialogue pour créer
  const openCreateDialog = () => {
    setEditingPeriod(null);
    setFormData({
      productId: "",
      startDate: "",
      endDate: "",
      price: "",
      name: "",
    });
    setIsDialogOpen(true);
  };

  // Ouvrir le dialogue pour modifier
  const openEditDialog = (period: PricePeriod) => {
    setEditingPeriod(period);
    setFormData({
      productId: period.productId.toString(),
      startDate: period.startDate.split("T")[0], // Format YYYY-MM-DD
      endDate: period.endDate.split("T")[0],
      price: period.price.toString(),
      name: period.name || "",
    });
    setIsDialogOpen(true);
  };

  // Sauvegarder la période de prix
  const savePricePeriod = async () => {
    try {
      const data = {
        productId: Number.parseInt(formData.productId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        price: Number.parseFloat(formData.price),
        name: formData.name || undefined,
      };

      if (editingPeriod) {
        // Modifier
        await apiCall(`/api/price-periods/${editingPeriod.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        // Créer
        await apiCall("/api/price-periods", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      setIsDialogOpen(false);
      loadData(); // Recharger les données
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    }
  };

  // Supprimer une période de prix
  const deletePricePeriod = async (id: number) => {
    try {
      await apiCall(`/api/price-periods/${id}`, {
        method: "DELETE",
      });

      loadData(); // Recharger les données
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  // Gestion du focus
  useEffect(() => {
    if (!loading && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-labelledby="page-title"
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              id="page-title"
              className="text-3xl font-playfair font-bold text-slate-800 dark:text-slate-200 mb-2"
            >
              Gestion des périodes de prix
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Définissez des prix différents selon les périodes pour chaque propriété
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={openCreateDialog}
                  aria-label="Ajouter une nouvelle période de prix"
                  size="lg"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle période
                </Button>
              </DialogTrigger>
              {/* DialogContent doit être en dehors du layout des boutons */}
              {isDialogOpen && (
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPeriod ? "Modifier la période de prix" : "Nouvelle période de prix"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPeriod
                        ? "Modifiez les informations de la période de prix"
                        : "Créez une nouvelle période de prix pour une propriété"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="productId" className="text-right">
                        Propriété
                      </Label>
                      <Select
                        value={formData.productId}
                        onValueChange={(value) => handleInputChange("productId", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionnez une propriété" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name} - {property.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ex: Haute saison été"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        Date début
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">
                        Date fin
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Prix (€)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={savePricePeriod}>
                      {editingPeriod ? "Modifier" : "Créer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
            <Button
              onClick={loadData}
              variant="outline"
              size="lg"
              aria-label="Actualiser les données"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Link to="/admin">
              <Button variant="secondary" size="lg" className="flex items-center" aria-label="Tableau de bord">
                Tableau de bord
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Périodes de prix
            </CardTitle>
            <CardDescription>
              Liste de toutes les périodes de prix définies pour les propriétés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={6} />
            ) : pricePeriods.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                  Aucune période de prix définie
                </p>
                <Button onClick={openCreateDialog} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la première période
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriété</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricePeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                          <div>
                            <div className="font-medium">{period.product?.name}</div>
                            <div className="text-sm text-slate-600">{period.product?.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Du {formatDate(period.startDate)}</div>
                          <div>Au {formatDate(period.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {period.name ? (
                          <Badge variant="secondary">{period.name}</Badge>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{period.price}€</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(period)}
                            aria-label={`Modifier la période ${period.name || "sans nom"}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Supprimer la période ${period.name || "sans nom"}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette période de prix ? Cette
                                  action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePricePeriod(period.id)}>
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
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ManagePricePeriods;
