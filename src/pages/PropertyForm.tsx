import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, authenticatedApiCall } from "@/lib/api-utils";
import { ArrowLeft, Save, X, Plus, Trash2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingStatePage } from "@/components/LoadingState";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Property {
  id?: number;
  name: string;
  description: string;
  price: number;
  location: string;
  // Nouveaux champs d'adresse
  address?: string;
  city?: string;
  postalCode?: string;
  region?: string;
  maxGuests: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Property>({
    name: "",
    description: "",
    price: 0,
    location: "",
    address: "",
    city: "",
    postalCode: "",
    region: "",
    maxGuests: 1,
    amenities: [],
    images: [],
    isActive: true,
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Fonction pour récupérer le token d'authentification
  const getAuthToken = () => {
    // Essayer différentes clés possibles
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  };

  // Gestion du titre de la page
  useEffect(() => {
    document.title = isEditing
      ? `Modifier ${formData.name || "Propriété"} - Administration Shu-no`
      : "Créer une nouvelle propriété - Administration Shu-no";
  }, [isEditing, formData.name]);

  // Gestion du focus initial pour l'accessibilité (une seule fois au chargement)
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []); // Dépendances vides = ne se déclenche qu'au montage

  const loadProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      const response = await apiCall(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extraire les données de la propriété de la réponse
      const propertyData = response.success ? response.data : response;

      // Exclure explicitement latitude/longitude (on ne collecte plus ces champs côté admin)
      const { latitude: _lat, longitude: _lng, ...rest } = propertyData;

      // S'assurer que amenities et images sont des tableaux
      const normalizedData = {
        ...rest,
        amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
        images: Array.isArray(propertyData.images) ? propertyData.images : [],
      };

      setFormData(normalizedData);
    } catch (err) {
      console.error("Erreur lors du chargement de la propriété:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de la propriété");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Charger les données de la propriété si on est en mode édition
  useEffect(() => {
    if (id && isEditing) {
      loadProperty();
    }
  }, [id, isEditing, loadProperty]);

  // Gestionnaire de changement pour les champs simples
  const handleInputChange = (
    field: keyof Property,
    value: string | number | string[] | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Ajouter un équipement
  const addAmenity = () => {
    const amenities = formData.amenities || [];
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  // Supprimer un équipement
  const removeAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((a) => a !== amenity),
    }));
  };

  // Ajouter une image
  const addImage = () => {
    const images = formData.images || [];
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...images, newImage.trim()],
      }));
      setNewImage("");
    }
  };

  // Upload direct vers Cloudinary (unsigned preset)
  const uploadFileToCloudinary = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration manquante (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)"
      );
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);

    setUploading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Erreur upload Cloudinary");
      return data.secure_url as string;
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une image
  const removeImage = (image: string) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((i) => i !== image),
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      const url = isEditing ? `/api/products/${id}` : "/api/products";

      const method = isEditing ? "PUT" : "POST";

      // Utiliser authenticatedApiCall qui gère automatiquement CSRF et l'autorisation
      await authenticatedApiCall(
        url,
        {
          method,
          body: JSON.stringify(formData),
        },
        token
      );

      // Rediriger vers la liste des propriétés
      navigate("/admin/properties");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingStatePage message="Chargement de la propriété..." size="lg" />
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
          href="#property-form"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Aller au formulaire
        </a>
      </nav>

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-labelledby="form-title"
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Administration", href: "/admin" },
              { label: "Propriétés", href: "/admin/properties" },
              { label: isEditing ? "Modifier" : "Nouvelle annonce", current: true },
            ]}
            className="mb-4"
          />
          <Link to="/admin/properties">
            <Button
              variant="outline"
              className="mb-4"
              aria-label="Retourner à la liste des propriétés"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Retour à la liste
            </Button>
          </Link>
          <h1 id="form-title" className="text-3xl font-playfair font-bold text-bleu-profond mb-2">
            {isEditing ? "Modifier l'annonce" : "Créer une nouvelle annonce"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Modifiez les informations de votre annonce"
              : "Ajoutez une nouvelle propriété à votre catalogue"}
          </p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <Alert
            id="property-form-error"
            variant="destructive"
            className="mb-6"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations principales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations principales</CardTitle>
                <CardDescription>Les informations de base de votre annonce</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la propriété *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Gîte Mer & Nature"
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "property-form-error name-help" : "name-help"}
                    aria-required="true"
                    autoComplete="off"
                  />
                  <div id="name-help" className="sr-only">
                    Entrez le nom de votre propriété tel qu'il apparaîtra dans les annonces
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Ex: Paimpol"
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "property-form-error location-help" : "location-help"}
                    aria-required="true"
                    autoComplete="address-level2"
                  />
                  <div id="location-help" className="sr-only">
                    Indiquez la ville ou le village où se trouve votre propriété
                  </div>
                </div>

                {/* Adresse détaillée */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Adresse détaillée (pour la carte)
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Ex: 15 Rue du Port"
                      aria-describedby="address-help"
                      autoComplete="street-address"
                    />
                    <div id="address-help" className="sr-only">
                      Adresse complète de la propriété pour un positionnement précis sur la carte
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Ex: Paimpol"
                        aria-describedby="city-help"
                        autoComplete="address-level2"
                      />
                      <div id="city-help" className="sr-only">
                        Ville où se trouve la propriété
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode || ""}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder="Ex: 22730"
                        aria-describedby="postalCode-help"
                        autoComplete="postal-code"
                      />
                      <div id="postalCode-help" className="sr-only">
                        Code postal de la ville où se trouve la propriété
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Région/Département</Label>
                    <Input
                      id="region"
                      value={formData.region || ""}
                      onChange={(e) => handleInputChange("region", e.target.value)}
                      placeholder="Ex: Côtes-d'Armor"
                      aria-describedby="region-help"
                      autoComplete="address-level1"
                    />
                    <div id="region-help" className="sr-only">
                      Région ou département où se trouve la propriété
                    </div>
                  </div>

                  {/* latitude/longitude retirés du formulaire admin */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix par nuit (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", Number.parseFloat(e.target.value) || 0)
                      }
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "property-form-error" : undefined}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Capacité (personnes) *</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min="1"
                      value={formData.maxGuests}
                      onChange={(e) =>
                        handleInputChange("maxGuests", Number.parseInt(e.target.value) || 1)
                      }
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "property-form-error" : undefined}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Décrivez votre propriété..."
                    rows={4}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "property-form-error" : undefined}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Annonce active</Label>
                </div>
              </CardContent>
            </Card>

            {/* Équipements */}
            <Card>
              <CardHeader>
                <CardTitle>Équipements</CardTitle>
                <CardDescription>Les équipements disponibles dans votre propriété</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Ex: WiFi, Parking, Piscine..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                    aria-label="Ajouter un équipement"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    onClick={addAmenity}
                    variant="outline"
                    aria-label="Ajouter l'équipement"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formData.amenities || []).map((amenity, index) => (
                    <Badge
                      key={`${amenity}-${index}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-destructive"
                        aria-label={`Supprimer l'équipement ${amenity}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>Ajoutez des URLs d'images pour votre propriété</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Uploader une image (ou coller une URL)</Label>

                  {/* File input / drag & drop simple */}
                  <div
                    className="flex items-center space-x-2"
                    role="button"
                    tabIndex={0}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer?.files?.[0];
                      if (file) {
                        try {
                          const url = await uploadFileToCloudinary(file);
                          setFormData((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), url],
                          }));
                        } catch (err) {
                          console.error(err);
                          setError(err instanceof Error ? err.message : "Erreur upload");
                        }
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadFileToCloudinary(file);
                          setFormData((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), url],
                          }));
                        } catch (err) {
                          console.error(err);
                          setError(err instanceof Error ? err.message : "Erreur upload");
                        }
                      }}
                      aria-label="Uploader une image"
                      className="block"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          placeholder="URL de l'image..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImage();
                            }
                          }}
                          aria-label="Ajouter une image"
                          autoComplete="url"
                        />
                        <Button
                          type="button"
                          onClick={addImage}
                          variant="outline"
                          aria-label="Ajouter l'image"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      {uploading && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Téléversement en cours…
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(formData.images || []).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative group">
                      <img
                        src={image}
                        alt={`${index + 1}/${formData.images?.length || 0} – ${formData.name || "nouvelle propriété"}`}
                        className="w-full h-32 object-cover rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Supprimer l'image"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 mt-8">
            <Link to="/admin/properties">
              <Button
                type="button"
                variant="outline"
                aria-label="Annuler et retourner à la liste des propriétés"
              >
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-bleu-profond hover:bg-bleu-moyen"
              aria-label={
                saving
                  ? "Sauvegarde en cours"
                  : isEditing
                    ? "Modifier la propriété"
                    : "Créer la nouvelle propriété"
              }
            >
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              {saving ? "Sauvegarde..." : isEditing ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

// Wrapper avec ErrorBoundary
const PropertyFormWithErrorBoundary = () => (
  <ErrorBoundary>
    <PropertyForm />
  </ErrorBoundary>
);

export default PropertyFormWithErrorBoundary;
