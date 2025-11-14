import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authenticatedApiCall } from "@/lib/api-utils";

interface SettingsData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: "Shu-no",
    siteDescription: "Location de vacances en Côte de Goëlo",
    contactEmail: "contact@shu-no.fr",
    contactPhone: "09 75 58 11 86",
    maintenanceMode: false,
    allowRegistrations: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Charger les paramètres
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      // Charger les paramètres depuis l'API
      const data = await authenticatedApiCall("/api/settings");
      setSettings(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des paramètres:", err);
      setError(err.message || "Erreur lors du chargement des paramètres");
      // Conserver les valeurs par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await authenticatedApiCall("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      setSuccess("Paramètres sauvegardés avec succès !");
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err.message || "Erreur lors de la sauvegarde des paramètres");
    } finally {
      setSaving(false);
    }
  };

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Paramètres Admin - Shu-no";
  }, []);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, []);

  const handleInputChange = (field: keyof SettingsData, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
        href="#general-settings"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux paramètres généraux
      </a>
      <a
        href="#contact-settings"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux paramètres de contact
      </a>
      <a
        href="#system-settings"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux paramètres système
      </a>

      <Header />
      <div
        id="main-content"
        className="container mx-auto px-4 py-8"
        role="main"
        aria-labelledby="settings-title"
        ref={mainContentRef}
        tabIndex={-1}
      >
        <div className="mb-8">
          <h1
            id="settings-title"
            className="text-3xl font-playfair font-bold text-bleu-profond mb-2"
          >
            Paramètres Administrateur
          </h1>
          <p className="text-muted-foreground">Gérez les paramètres généraux du site</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6" role="status" aria-live="polite">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paramètres généraux */}
          <Card id="general-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres Généraux
              </CardTitle>
              <CardDescription>Informations de base du site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                  placeholder="Nom du site"
                  aria-describedby="siteName-help"
                />
                <span id="siteName-help" className="sr-only">
                  Nom affiché du site dans l'en-tête et les métadonnées
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description du site</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                  placeholder="Description du site"
                  rows={3}
                  aria-describedby="siteDescription-help"
                />
                <span id="siteDescription-help" className="sr-only">
                  Description utilisée dans les métadonnées et les moteurs de recherche
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de contact */}
          <Card id="contact-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de Contact
              </CardTitle>
              <CardDescription>Informations de contact affichées sur le site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contact</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="contact@exemple.com"
                  aria-describedby="contactEmail-help"
                  autoComplete="email"
                />
                <span id="contactEmail-help" className="sr-only">
                  Adresse email utilisée pour les demandes de contact
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Téléphone de contact</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="01 23 45 67 89"
                  aria-describedby="contactPhone-help"
                  autoComplete="tel"
                />
                <span id="contactPhone-help" className="sr-only">
                  Numéro de téléphone affiché sur la page de contact
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres système */}
          <Card id="system-settings" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres Système
              </CardTitle>
              <CardDescription>Configuration générale du système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Désactiver temporairement l'accès au site public
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                  aria-describedby="maintenanceMode-help"
                />
                <span id="maintenanceMode-help" className="sr-only">
                  Active ou désactive le mode maintenance du site
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistrations">Inscriptions autorisées</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux nouveaux utilisateurs de s'inscrire
                  </p>
                </div>
                <Switch
                  id="allowRegistrations"
                  checked={settings.allowRegistrations}
                  onCheckedChange={(checked) => handleInputChange("allowRegistrations", checked)}
                  aria-describedby="allowRegistrations-help"
                />
                <span id="allowRegistrations-help" className="sr-only">
                  Contrôle si les nouveaux utilisateurs peuvent s'inscrire sur le site
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={saveSettings}
            disabled={saving || loading}
            className="bg-bleu-profond hover:bg-bleu-moyen"
            aria-label={saving ? "Sauvegarde en cours..." : "Sauvegarder les paramètres"}
          >
            <Save className="w-4 h-4 mr-2" aria-hidden="true" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>

          <Button
            onClick={loadSettings}
            disabled={loading || saving}
            variant="outline"
            aria-label="Recharger les paramètres depuis le serveur"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            {loading ? "Chargement..." : "Recharger"}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSettings;
