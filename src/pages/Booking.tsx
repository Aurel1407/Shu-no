import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getApiUrl } from "@/config/api";
import { useProductsQuery } from "@/hooks/api/products";
import { Product } from "@/types/product";
import { PropertyGridSkeleton } from "@/components/ui/loading";
import { getCloudinaryCardImage } from "@/lib/cloudinary-utils";

type ProductWithPricing = Product & {
  calculatedPrice?: number;
  calculatedTotal?: number;
};

const Booking = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [properties, setProperties] = useState<ProductWithPricing[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);
  const {
    data: activeProducts = [],
    isPending,
    isError,
    error,
  } = useProductsQuery<Product[]>({
    queryKey: ["products"],
    select: (products) => products.filter((property) => property.isActive),
  });

  const filteredProducts = useMemo(() => {
    if (!activeProducts?.length) {
      return [] as ProductWithPricing[];
    }

    return activeProducts.filter((property) => !property.maxGuests || property.maxGuests >= guests);
  }, [activeProducts, guests]);

  // La recherche se déclenche automatiquement lors de la sélection des dates ou du nombre de voyageurs

  // Fonction pour calculer le prix dynamique selon les périodes
  const calculateDynamicPrices = useCallback(
    async (propertiesList: ProductWithPricing[]) => {
      if (!checkIn || !checkOut) {
        // Si pas de dates sélectionnées, utiliser le prix de base
        return propertiesList.map((property) => ({
          ...property,
          calculatedPrice: property.price,
          calculatedTotal: undefined,
        }));
      }

      const nights = Math.max(
        1,
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      );

      const updatedProperties = await Promise.all(
        propertiesList.map(async (property) => {
          try {
            const response = await fetch(
              getApiUrl(
                `/api/price-periods/product/${property.id}/calculate?startDate=${checkIn.toISOString()}&endDate=${checkOut.toISOString()}`
              )
            );

            if (response.ok) {
              const data = await response.json();
              const pricePerNight = data.totalPrice > 0 ? data.totalPrice / nights : property.price;
              const total = Math.round(pricePerNight * nights * 100) / 100;
              return {
                ...property,
                calculatedPrice: Math.round(pricePerNight * 100) / 100, // prix par nuit
                calculatedTotal: total, // prix total du séjour
              };
            }

            // En cas d'erreur, utiliser le prix de base pour calculer le total
            const total = Math.round(property.price * nights * 100) / 100;
            return {
              ...property,
              calculatedPrice: property.price,
              calculatedTotal: total,
            };
          } catch {
            const total = Math.round(property.price * nights * 100) / 100;
            return {
              ...property,
              calculatedPrice: property.price,
              calculatedTotal: total,
            };
          }
        })
      );

      return updatedProperties;
    },
    [checkIn, checkOut]
  );

  // Recalculer les propriétés et les prix en fonction des filtres et des dates
  useEffect(() => {
    let isMounted = true;

    const syncProperties = async () => {
      if (!filteredProducts.length) {
        if (isMounted) {
          setProperties([]);
          setIsPricingLoading(false);
        }
        return;
      }

      setIsPricingLoading(true);

      try {
        const updatedProperties = await calculateDynamicPrices(filteredProducts);
        if (isMounted) {
          setProperties(updatedProperties);
        }
      } finally {
        if (isMounted) {
          setIsPricingLoading(false);
        }
      }
    };

    syncProperties();

    return () => {
      isMounted = false;
    };
  }, [filteredProducts, calculateDynamicPrices]);

  // NOTE: Retiré les images par défaut — le placeholder sera affiché lorsqu'il n'y a
  // pas d'images fournies pour une propriété.

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Réservation - Shu-no";
  }, []);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  const errorMessage = isError
    ? (error?.message ?? "Erreur lors du chargement des propriétés")
    : null;
  const isLoading = isPending || isPricingLoading;
  const nightsCount =
    checkIn && checkOut
      ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

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
        href="#search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller à la recherche
      </a>
      <a
        href="#properties"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux propriétés
      </a>

      <Header />

      {/* Contenu principal */}
      <main role="main" aria-label="Page de réservation d'hébergements">
        {/* Hero Section */}
        <section
          id="main-content"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bleu-clair/30 via-background to-bleu-profond/20"
          ref={mainContentRef}
          tabIndex={-1}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-foreground">
                Réservez votre séjour
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Découvrez nos hébergements disponibles et réservez votre parenthèse bretonne
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#search">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-bleu-profond to-bleu-moyen hover:from-bleu-profond/90 hover:to-bleu-moyen/90 text-white px-8 py-3"
                  >
                    Commencer ma recherche
                  </Button>
                </a>
                <Link to="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border hover:bg-accent px-8 py-3"
                  >
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire de recherche */}
        <section
          id="search"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
          aria-labelledby="search-title"
          aria-describedby="search-description"
        >
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2
                  id="search-title"
                  className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-foreground"
                >
                  Rechercher un hébergement
                </h2>
                <p
                  id="search-description"
                  className="text-lg text-muted-foreground max-w-3xl mx-auto"
                >
                  Sélectionnez vos dates de séjour et le nombre de voyageurs
                </p>
              </div>

              <form
                className="bg-card p-8 rounded-xl shadow-lg border border-border"
                role="search"
                aria-label="Formulaire de recherche d'hébergement"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Nombre de voyageurs */}
                  <div className="space-y-2">
                    <Label htmlFor="guests-count" className="text-foreground font-medium">
                      Voyageurs
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-bleu-profond" aria-hidden="true" />
                      <Input
                        id="guests-count"
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="flex-1 bg-background border-border"
                        aria-label="Nombre de voyageurs"
                        aria-describedby="guests-help"
                      />
                    </div>
                    <p id="guests-help" className="sr-only">
                      Indiquez le nombre de personnes pour votre séjour (1 à 10 maximum).
                    </p>
                  </div>

                  {/* Date d'arrivée */}
                  <div className="space-y-2">
                    <Label htmlFor="checkin-date" className="text-foreground font-medium">
                      Date d'arrivée
                    </Label>
                    <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="checkin-date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background border-border hover:bg-accent"
                          aria-label={`Date d'arrivée sélectionnée: ${checkIn ? format(checkIn, "PPP", { locale: fr }) : "Aucune date sélectionnée"}`}
                          aria-describedby="checkin-help"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          {checkIn ? format(checkIn, "PPP", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date);
                            setIsCheckInOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p id="checkin-help" className="sr-only">
                      Sélectionnez votre date d'arrivée. Les dates passées ne sont pas disponibles.
                    </p>
                  </div>

                  {/* Date de départ */}
                  <div className="space-y-2">
                    <Label htmlFor="checkout-date" className="text-foreground font-medium">
                      Date de départ
                    </Label>
                    <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="checkout-date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background border-border hover:bg-accent"
                          aria-label={`Date de départ sélectionnée: ${checkOut ? format(checkOut, "PPP", { locale: fr }) : "Aucune date sélectionnée"}`}
                          aria-describedby="checkout-help"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          {checkOut ? format(checkOut, "PPP", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={(date) => {
                            setCheckOut(date);
                            setIsCheckOutOpen(false);
                          }}
                          disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                          defaultMonth={checkIn || undefined}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p id="checkout-help" className="sr-only">
                      Sélectionnez votre date de départ. La date doit être postérieure à la date
                      d'arrivée.
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  La liste s'actualise automatiquement lorsque vous sélectionnez vos dates ou le
                  nombre de voyageurs.
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Propriétés disponibles */}
        <section
          id="properties"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
          aria-labelledby="properties-title"
        >
          <div className="max-w-6xl mx-auto">
            <h2
              id="properties-title"
              className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12 text-foreground"
            >
              Nos hébergements disponibles
            </h2>

            {/* Affichage des erreurs */}
            {errorMessage && (
              <div
                className="mb-6 max-w-4xl mx-auto p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-destructive text-center">
                  Impossible de charger les propriétés en temps réel. Les données affichées peuvent
                  ne pas être à jour.
                </p>
              </div>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="mb-8" aria-live="polite">
                <PropertyGridSkeleton count={6} />
              </div>
            )}

            <ul
              className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto list-none"
              aria-label="Liste des hébergements disponibles"
            >
              {properties.map((property) => (
                <li
                  key={property.id}
                  className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full max-w-sm"
                >
                  <div className="relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={getCloudinaryCardImage(property.images[0])}
                        alt={`${property.name} – hébergement à ${property.location}`}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted/10 flex items-center justify-center text-muted-foreground">
                        <span>Pas d'image disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
                      {property.name}
                    </h3>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span>{property.location}</span>
                    </div>

                    {property.description && (
                      <p className="text-foreground/80 text-sm leading-relaxed mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" aria-hidden="true" />
                          <span aria-label={`${property.maxGuests || "N/A"} voyageurs maximum`}>
                            {property.maxGuests || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-4 border-t border-border">
                      <div className="min-w-0 flex-1 mb-3 sm:mb-0">
                        {property.calculatedTotal ? (
                          <div
                            className="text-2xl font-bold text-bleu-profond break-words"
                            aria-label={`Prix total du séjour: ${property.calculatedTotal} euros`}
                          >
                            {property.calculatedTotal}€ pour {nightsCount ?? 1} nuit
                            {(nightsCount ?? 1) > 1 ? "s" : ""}
                          </div>
                        ) : (
                          <div
                            className="text-2xl font-bold text-bleu-profond break-words"
                            aria-label={`Prix: ${property.calculatedPrice || property.price} euros par nuit`}
                          >
                            {property.calculatedPrice || property.price}€/nuit
                          </div>
                        )}
                        {checkIn &&
                          checkOut &&
                          property.calculatedPrice !== undefined &&
                          property.calculatedPrice !== property.price && (
                            <div className="text-sm text-muted-foreground mt-1">(prix période)</div>
                          )}
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-3">
                        <Link to={`/property/${property.id}`}>
                          <button
                            className="px-3 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors whitespace-nowrap"
                            aria-label={`Découvrir les détails de ${property.name}`}
                          >
                            Découvrir
                          </button>
                        </Link>
                        <button
                          className="px-3 py-2 bg-bleu-profond text-white rounded-lg hover:bg-bleu-moyen transition-colors whitespace-nowrap"
                          aria-label={`Réserver ${property.name} à ${property.location}`}
                          onClick={() => {
                            const state = {
                              property,
                              checkIn: checkIn ?? null,
                              checkOut: checkOut ?? null,
                              guests,
                              from: "/booking",
                            };
                            navigate("/reservation-summary", { state });
                          }}
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {!isLoading && properties.length === 0 && (
                <li className="col-span-full text-center py-8">
                  <output aria-live="polite">
                    <p className="text-lg text-muted-foreground">
                      Aucun hébergement disponible pour le moment.
                    </p>
                  </output>
                </li>
              )}
            </ul>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Booking;
