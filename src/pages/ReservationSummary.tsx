import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link, NavigateFunction } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, MapPin, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiUrl } from "@/config/api";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CalendarWithPrices } from "@/components/ui/calendar-with-prices";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  maxGuests?: number;
  images?: string[];
}

interface ReservationState {
  property: Property;
  checkIn?: Date | null;
  checkOut?: Date | null;
  guests?: number;
  from?: string; // Page d'origine pour la navigation retour intelligente
}

interface ReservationData {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  notes: string;
}

const ReservationSummary: React.FC = () => {
  // Tous les hooks sont déclarés ici, en haut du composant
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReservationState;

  // Animation d'entrée de page
  useEffect(() => {
    setTimeout(() => setIsPageReady(true), 100);
  }, []);

  // Fonctions pour la sauvegarde localStorage (définies avant leur utilisation)
  const loadReservationData = (): Partial<ReservationData> | null => {
    if (!state?.property) return null;

    try {
      const storageKey = `reservation_${state.property.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Vérifier que les données ne sont pas trop anciennes (24h max)
        const timestamp = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          return {
            checkIn: data.checkIn ? new Date(data.checkIn) : null,
            checkOut: data.checkOut ? new Date(data.checkOut) : null,
            guests: data.guests,
            notes: data.notes,
          };
        } else {
          // Supprimer les données expirées
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.warn("Impossible de charger les données de réservation:", error);
    }
    return null;
  };

  const [reservationData, setReservationData] = useState<ReservationData>(() => {
    // Essayer de charger depuis localStorage, sinon utiliser les données du state
    const savedData = loadReservationData();
    return {
      checkIn: savedData?.checkIn || state?.checkIn || null,
      checkOut: savedData?.checkOut || state?.checkOut || null,
      guests: savedData?.guests || state?.guests || 1,
      notes: savedData?.notes || "",
    };
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string } | null>(null);
  const [bookedRanges, setBookedRanges] = useState<Array<{ start: Date; end: Date }>>([]);
  const [isPageReady, setIsPageReady] = useState(false);
  const [pricePeriods, setPricePeriods] = useState<
    Array<{ startDate: string; endDate: string; price: number }>
  >([]);

  const { apiCall, getAuthToken } = useAuthenticatedApi();

  const property = state?.property;

  // Fonctions localStorage avec useCallback pour éviter les re-renders
  const saveReservationData = useCallback(
    (data: ReservationData) => {
      if (!property?.id) return;

      try {
        const storageKey = `reservation_${property.id}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            ...data,
            checkIn: data.checkIn?.toISOString(),
            checkOut: data.checkOut?.toISOString(),
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.warn("Impossible de sauvegarder les données de réservation:", error);
      }
    },
    [property?.id]
  );

  const clearReservationData = useCallback(() => {
    if (!property?.id) return;

    try {
      const storageKey = `reservation_${property.id}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Impossible de supprimer les données de réservation:", error);
    }
  }, [property?.id]);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          const decoded = JSON.parse(jsonPayload);
          setCurrentUser({ id: decoded.id, email: decoded.email });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    };

    fetchCurrentUser();
  }, [getAuthToken]);

  // Charger les réservations existantes pour bloquer les dates
  useEffect(() => {
    if (!property?.id) return;

    const loadBookedRanges = async () => {
      try {
        const orders = await apiCall("/api/orders");
        const myOrders = (Array.isArray(orders) ? orders : []).filter(
          (o: { product?: { id?: number }; status?: string }) =>
            o.product?.id === property.id && o.status !== "cancelled"
        );
        const ranges = myOrders.map((o: { checkIn: string; checkOut: string }) => ({
          start: new Date(o.checkIn),
          end: new Date(o.checkOut),
        }));
        setBookedRanges(ranges);
      } catch (err) {
        console.error("Erreur chargement réservations pour blocage dates", err);
        setBookedRanges([]);
      }
    };

    const loadPricePeriods = async () => {
      try {
        const response = await apiCall(`/api/price-periods/product/${property.id}`);
        const periods = Array.isArray(response) ? response : [];
        setPricePeriods(periods);
      } catch (err) {
        console.error("Erreur chargement périodes de prix", err);
        setPricePeriods([]);
      }
    };

    loadBookedRanges();
    loadPricePeriods();
  }, [property?.id, apiCall]);

  // Calculer le prix total
  const calculateTotalPrice = useCallback(
    async (checkIn: Date, checkOut: Date) => {
      if (!property?.id) return;

      try {
        const nights = differenceInDays(checkOut, checkIn);
        if (nights <= 0) return;

        const response = await fetch(
          getApiUrl(
            `/api/price-periods/product/${property.id}/calculate?startDate=${checkIn.toISOString()}&endDate=${checkOut.toISOString()}`
          )
        );

        if (response.ok) {
          const data = await response.json();
          setCalculatedPrice(data.totalPrice);
        } else {
          setCalculatedPrice(property.price * nights);
        }
      } catch (error) {
        console.error("Erreur calcul prix:", error);
        setCalculatedPrice(property.price * differenceInDays(checkOut, checkIn));
      }
    },
    [property?.id, property?.price]
  );

  // Mettre à jour le prix quand les dates changent
  useEffect(() => {
    if (reservationData.checkIn && reservationData.checkOut) {
      calculateTotalPrice(reservationData.checkIn, reservationData.checkOut);
    } else {
      setCalculatedPrice(null);
    }
  }, [reservationData.checkIn, reservationData.checkOut, calculateTotalPrice]);

  // Sauvegarder automatiquement les données lors des changements
  useEffect(() => {
    if (property?.id && reservationData) {
      saveReservationData(reservationData);
    }
  }, [reservationData, property?.id, saveReservationData]);

  // Vérifier si nous avons les données nécessaires
  if (!state?.property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <Header />

        <main className="pt-20 px-4 pb-8">
          <div
            className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
              isPageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <AlertCircle
                  className="h-16 w-16 text-orange-500 mx-auto mb-4"
                  aria-hidden="true"
                />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Accès direct non autorisé
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Pour accéder à cette page, vous devez d'abord sélectionner une propriété à
                  réserver.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate("/booking")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Voir les propriétés
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                    Retour à l'accueil
                  </Button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                  Vous pouvez également parcourir nos gîtes disponibles depuis la page d'accueil.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const validateReservation = () => {
    if (!currentUser) {
      setSubmitMessage({
        type: "error",
        message: "Vous devez être connecté pour effectuer une réservation.",
      });
      return false;
    }

    if (!reservationData.checkIn || !reservationData.checkOut) {
      setSubmitMessage({
        type: "error",
        message: "Veuillez sélectionner les dates d'arrivée et de départ.",
      });
      return false;
    }

    if (reservationData.guests > (property.maxGuests || 10)) {
      setSubmitMessage({
        type: "error",
        message: `Le nombre de voyageurs ne peut pas dépasser ${property.maxGuests}.`,
      });
      return false;
    }

    const nights = differenceInDays(reservationData.checkOut, reservationData.checkIn);
    if (nights <= 0) {
      setSubmitMessage({
        type: "error",
        message: "La date de départ doit être postérieure à la date d'arrivée.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateReservation()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Vérifier la disponibilité et calculer le prix final
      const nights = differenceInDays(reservationData.checkOut!, reservationData.checkIn!);
      const finalPrice = calculatedPrice || property.price * nights;

      // Rediriger vers la page de paiement avec toutes les données
      navigate("/payment", {
        state: {
          property,
          checkIn: reservationData.checkIn,
          checkOut: reservationData.checkOut,
          guests: reservationData.guests,
          notes: reservationData.notes,
          totalPrice: finalPrice,
          from: state?.from,
        },
      });

      // Supprimer les données sauvegardées car on passe à l'étape suivante
      clearReservationData();
    } catch (error) {
      console.error("Erreur lors de la préparation du paiement:", error);
      setSubmitMessage({
        type: "error",
        message: "Erreur lors de la préparation du paiement. Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  const nights =
    reservationData.checkIn && reservationData.checkOut
      ? differenceInDays(reservationData.checkOut, reservationData.checkIn)
      : 0;

  // Fonction pour vérifier si une date est réservée
  const isDateBooked = (date: Date) => {
    return bookedRanges.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    });
  };

  // Fonction pour obtenir le prix d'une date spécifique
  const getPriceForDate = (date: Date): number => {
    const period = pricePeriods.find((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    });

    return period ? period.price : property.price;
  };

  // Navigation retour intelligente
  const handleSmartBack = () => {
    const from = state?.from;

    // Si on connaît la page d'origine, y retourner directement
    if (from) {
      navigate(from);
    } else if (property) {
      // Sinon, retourner vers la page de détail du produit
      navigate(`/property/${property.id}`);
    } else {
      // En dernier recours, retourner vers la page d'accueil
      navigate("/");
    }
  };

  // Extraction des ternaires imbriqués
  const isMaxGuestsExceeded = reservationData.guests > (property.maxGuests || 10);
  const isDatesSelected = !!reservationData.checkIn && !!reservationData.checkOut;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="pt-20 px-4 pb-8">
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            isPageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Breadcrumb navigation */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Accueil</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/booking">Réservation</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Récapitulatif</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* En-tête avec bouton retour */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSmartBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Finaliser votre réservation
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire de réservation */}
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-500 delay-100 ${
                isPageReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Détails de la réservation
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sélection des dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin">Date d'arrivée</Label>
                    <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !reservationData.checkIn && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reservationData.checkIn
                            ? format(reservationData.checkIn, "dd MMM yyyy", { locale: fr })
                            : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarWithPrices
                          mode="single"
                          selected={reservationData.checkIn}
                          onSelect={(date) => {
                            setReservationData((prev) => {
                              // Si la nouvelle date d'arrivée est après la date de départ actuelle, réinitialiser la date de départ
                              const newCheckOut =
                                prev.checkOut && date && isAfter(date, prev.checkOut)
                                  ? null
                                  : prev.checkOut;
                              return { ...prev, checkIn: date, checkOut: newCheckOut };
                            });
                            setIsCheckInOpen(false);

                            // Ouvrir automatiquement le calendrier de départ après avoir sélectionné l'arrivée
                            if (date && !reservationData.checkOut) {
                              setTimeout(() => setIsCheckOutOpen(true), 300);
                            }
                          }}
                          disabled={(date) => isBefore(date, new Date()) || isDateBooked(date)}
                          getPriceForDate={getPriceForDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkout">Date de départ</Label>
                    <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !reservationData.checkOut && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reservationData.checkOut
                            ? format(reservationData.checkOut, "dd MMM yyyy", { locale: fr })
                            : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarWithPrices
                          mode="single"
                          selected={reservationData.checkOut}
                          onSelect={(date) => {
                            setReservationData((prev) => ({ ...prev, checkOut: date }));
                            setIsCheckOutOpen(false);
                          }}
                          disabled={(date) =>
                            isBefore(date, new Date()) ||
                            !reservationData.checkIn ||
                            isBefore(date, reservationData.checkIn) ||
                            isDateBooked(date)
                          }
                          defaultMonth={reservationData.checkIn || new Date()}
                          getPriceForDate={getPriceForDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Nombre de voyageurs */}
                <div className="space-y-2">
                  <Label htmlFor="guests">Nombre de voyageurs</Label>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-600" aria-hidden="true" />
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={property.maxGuests || 10}
                      value={reservationData.guests}
                      onChange={(e) =>
                        setReservationData((prev) => ({
                          ...prev,
                          guests: Number.parseInt(e.target.value) || 1,
                        }))
                      }
                      aria-invalid={
                        submitMessage?.type === "error" &&
                        reservationData.guests > (property.maxGuests || 10)
                      }
                      aria-describedby={
                        submitMessage?.type === "error" ? "reservation-message" : undefined
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      (max {property.maxGuests || 10})
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes spéciales (optionnel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Demandes particulières, allergies, etc."
                    value={reservationData.notes}
                    onChange={(e) =>
                      setReservationData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                {/* Messages */}
                {submitMessage && (
                  <Alert
                    id="reservation-message"
                    role="alert"
                    aria-live={submitMessage.type === "error" ? "assertive" : "polite"}
                    className={
                      submitMessage.type === "error"
                        ? "border-red-200 bg-red-50"
                        : "border-green-200 bg-green-50"
                    }
                  >
                    {submitMessage.type === "error" ? (
                      <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    )}
                    <AlertDescription
                      className={submitMessage.type === "error" ? "text-red-800" : "text-green-800"}
                    >
                      {submitMessage.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Bouton de soumission */}
                <Button
                  type="submit"
                  className={`w-full transition-all duration-300 ${
                    isSubmitting ? "scale-95 opacity-80" : "scale-100 opacity-100 hover:scale-105"
                  }`}
                  disabled={isSubmitting || !currentUser}
                >
                  <span
                    className={`transition-opacity duration-200 ${isSubmitting ? "opacity-0" : "opacity-100"}`}
                  >
                    Procéder au paiement
                  </span>
                  {isSubmitting && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Redirection...</span>
                    </span>
                  )}
                </Button>

                {!currentUser && (
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                    <Link to="/login" className="text-blue-600 hover:underline">
                      Connectez-vous
                    </Link>{" "}
                    pour effectuer une réservation
                  </p>
                )}
              </form>
            </div>

            {/* Résumé de la propriété et du prix */}
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-500 delay-200 ${
                isPageReady ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Résumé</h2>

              {/* Informations sur la propriété */}
              <div className="space-y-4 mb-6">
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={`${property.name} - Vue principale du gîte`}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                )}

                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {property.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
                    {property.location}
                  </p>
                </div>
              </div>

              {/* Détails de la réservation */}
              {reservationData.checkIn && reservationData.checkOut && (
                <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Arrivée</span>
                    <span className="font-medium">
                      {format(reservationData.checkIn, "dd MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Départ</span>
                    <span className="font-medium">
                      {format(reservationData.checkOut, "dd MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Voyageurs</span>
                    <span className="font-medium">{reservationData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Durée</span>
                    <span className="font-medium">
                      {nights} nuit{nights > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Calcul du prix */}
              {calculatedPrice !== null && nights > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {calculatedPrice.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(calculatedPrice / nights).toFixed(2)} € × {nights} nuit{nights > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function validateReservation(
  reservationData: ReservationData,
  property: Property,
  currentUser: { id: number; email: string } | null,
  setSubmitMessage: (message: { type: "success" | "error"; message: string } | null) => void
): boolean {
  if (!currentUser) {
    setSubmitMessage({
      type: "error",
      message: "Vous devez être connecté pour effectuer une réservation.",
    });
    return false;
  }
  if (!reservationData.checkIn || !reservationData.checkOut) {
    setSubmitMessage({
      type: "error",
      message: "Veuillez sélectionner les dates d'arrivée et de départ.",
    });
    return false;
  }
  if (reservationData.guests > (property.maxGuests || 10)) {
    setSubmitMessage({
      type: "error",
      message: `Le nombre de voyageurs ne peut pas dépasser ${property.maxGuests}.`,
    });
    return false;
  }
  const nights = differenceInDays(reservationData.checkOut, reservationData.checkIn);
  if (nights <= 0) {
    setSubmitMessage({
      type: "error",
      message: "La date de départ doit être postérieure à la date d'arrivée.",
    });
    return false;
  }
  return true;
}

async function calculateTotalPrice(
  checkIn: Date,
  checkOut: Date,
  property: Property,
  setCalculatedPrice: (price: number | null) => void
) {
  try {
    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) return;
    const response = await fetch(
      getApiUrl(
        `/api/price-periods/product/${property.id}/calculate?startDate=${checkIn.toISOString()}&endDate=${checkOut.toISOString()}`
      )
    );
    if (response.ok) {
      const data = await response.json();
      setCalculatedPrice(data.totalPrice);
    } else {
      setCalculatedPrice(property.price * nights);
    }
  } catch (error) {
    // Fallback calculation en cas d'erreur
    const nights = differenceInDays(checkOut, checkIn);
    setCalculatedPrice(property.price * nights);
  }
}

function handleSmartBack(state: ReservationState, property: Property, navigate: NavigateFunction) {
  const from = state?.from;
  if (from) {
    navigate(from);
  } else if (property) {
    navigate(`/property/${property.id}`);
  } else {
    navigate("/");
  }
}

export default ReservationSummary;
