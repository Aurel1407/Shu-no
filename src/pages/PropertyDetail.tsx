import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Bed, Bath, Car, ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyImageCarousel from "@/components/PropertyImageCarousel";
import { useProductDetailQuery } from "@/hooks/api/products";
import { PropertyDetailSkeleton } from "@/components/ui/loading";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);

  const { data: property, isPending, isError, error } = useProductDetailQuery(id);

  const isLoading = isPending;
  const errorMessage = isError
    ? (error?.message ?? "Erreur lors du chargement de la propriété")
    : null;

  // Gestion du titre de la page et du focus pour l'accessibilité
  useEffect(() => {
    if (property) {
      document.title = `${property.name} - Détails de la propriété - Shu-no`;
    } else {
      document.title = "Détails de la propriété - Shu-no";
    }

    // Mettre le focus sur le contenu principal au chargement
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [property]);

  // NOTE: Retiré les images par défaut — la carousel utilisera le tableau d'images fourni
  // (ou un placeholder si vide).

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main role="main" className="flex-1">
          <PropertyDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main
          className="container mx-auto px-4 py-16 text-center"
          role="main"
          aria-labelledby="error-title"
        >
          <h1 id="error-title" className="sr-only">
            Erreur de chargement
          </h1>
          <Alert
            variant="destructive"
            className="max-w-md mx-auto mb-6"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Link to="/">
            <Button aria-label="Retourner à la page d'accueil">Retour à l'accueil</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main
          className="container mx-auto px-4 py-16 text-center"
          role="main"
          aria-labelledby="not-found-title"
        >
          <h1 id="not-found-title" className="text-4xl font-playfair font-bold mb-4">
            Propriété non trouvée
          </h1>
          <p className="text-muted-foreground mb-8">
            La propriété que vous recherchez n'existe pas.
          </p>
          <Link to="/">
            <Button aria-label="Retourner à la page d'accueil">Retour à l'accueil</Button>
          </Link>
        </main>
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
          href="#property-details"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Aller aux détails de la propriété
        </a>
        <a
          href="#booking-section"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-64 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Aller à la réservation
        </a>
      </nav>

      {/* Hero Section avec navigation */}
      <section className="py-8" aria-labelledby="property-hero-title">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center text-foreground hover:text-bleu-clair mb-6 transition-colors"
            aria-label="Retour à la page d'accueil"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Retour à l'accueil
          </Link>

          {/* Titre de la propriété */}
          <div className="mb-8">
            <h1
              id="property-hero-title"
              className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-foreground"
            >
              {property.name}
            </h1>
            <ul className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground" aria-label="Informations principales de la propriété">
              <li className="flex items-center space-x-1">
                <MapPin className="w-5 h-5" aria-hidden="true" />
                <span aria-label={`Localisation: ${property.location}`}>{property.location}</span>
              </li>
              <li className="flex items-center space-x-1">
                <Users className="w-5 h-5" aria-hidden="true" />
                <span
                  aria-label={`Capacité maximale: ${property.maxGuests || "N/A"} personne${property.maxGuests && property.maxGuests > 1 ? "s" : ""}`}
                >
                  Jusqu'à {property.maxGuests || "N/A"} personne
                  {property.maxGuests && property.maxGuests > 1 ? "s" : ""}
                </span>
              </li>
              <li className="flex items-center space-x-1">
                <Calendar className="w-5 h-5" aria-hidden="true" />
                <span aria-label={`Prix: ${property.price} euros par nuit`}>
                  {property.price}€/nuit
                </span>
              </li>
            </ul>
          </div>

          {/* Carrousel d'images */}
          <div className="max-w-4xl mx-auto">
            <PropertyImageCarousel
              images={property.images || []}
              propertyName={property.name}
              className="mb-8"
            />
          </div>
        </div>
      </section>

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-labelledby="property-details-title"
        className="container mx-auto px-4 py-16"
      >
        {/* Détails de la propriété */}
        <section id="property-details" aria-labelledby="property-details-title">
          <h2 id="property-details-title" className="sr-only">
            Détails de la propriété
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || "Aucune description disponible pour cette propriété."}
                  </p>
                </CardContent>
              </Card>

              {/* Équipements */}
              {property.amenities && property.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Équipements et services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-wrap gap-3" aria-label="Liste des équipements disponibles">
                      {property.amenities.map((amenity, index) => (
                        <li key={index}>
                          <span
                            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-bleu-clair/20 to-bleu-moyen/20 text-bleu-profond border border-bleu-clair/30 rounded-lg hover:from-bleu-clair/30 hover:to-bleu-moyen/30 transition-all duration-200 shadow-sm"
                          >
                            {amenity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Caractéristiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-6" aria-label="Caractéristiques de la propriété">
                      <li className="text-center">
                        <Users className="w-8 h-8 text-bleu-moyen mx-auto mb-2" aria-hidden="true" />
                        <div
                          className="text-2xl font-bold"
                          aria-label={`Capacité: ${property.maxGuests || "N/A"} personne${property.maxGuests && property.maxGuests > 1 ? "s" : ""}`}
                        >
                          {property.maxGuests || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">Capacité</div>
                      </li>
                      {property.bedrooms && (
                        <li className="text-center">
                          <Bed className="w-8 h-8 text-bleu-moyen mx-auto mb-2" aria-hidden="true" />
                          <div className="text-2xl font-bold" aria-label={`Nombre de chambres: ${property.bedrooms}`}>
                            {property.bedrooms}
                          </div>
                          <div className="text-sm text-muted-foreground">Chambres</div>
                        </li>
                      )}
                      {property.bathrooms && (
                        <li className="text-center">
                          <Bath className="w-8 h-8 text-bleu-moyen mx-auto mb-2" aria-hidden="true" />
                          <div className="text-2xl font-bold" aria-label={`Nombre de salles de bain: ${property.bathrooms}`}>
                            {property.bathrooms}
                          </div>
                          <div className="text-sm text-muted-foreground">Salles de bain</div>
                        </li>
                      )}
                      <li className="text-center">
                        <Car className="w-8 h-8 text-bleu-moyen mx-auto mb-2" aria-hidden="true" />
                        <div className="text-2xl font-bold" aria-label="Parking disponible: 1 place">1</div>
                        <div className="text-sm text-muted-foreground">Parking</div>
                      </li>
                    </ul>
                </CardContent>
              </Card>
            </div>

            {/* Réservation */}
            <div className="space-y-6">
              <Card className="sticky top-4" id="booking-section" aria-labelledby="booking-title">
                <CardHeader>
                  <CardTitle id="booking-title" className="text-2xl">
                    {property.price}€ <span className="text-base font-normal">/ nuit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-bleu-profond hover:bg-bleu-moyen"
                    aria-label={`Réserver ${property.name} maintenant - ${property.price} euros par nuit`}
                    onClick={() =>
                      navigate("/reservation-summary", {
                        state: { property, from: `/property/${property.id}` },
                      })
                    }
                  >
                    Réserver maintenant
                  </Button>
                  <Link to="/booking" className="block">
                    <Button
                      variant="outline"
                      className="w-full"
                      aria-label="Voir toutes les propriétés disponibles"
                    >
                      Voir toutes nos propriétés
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
