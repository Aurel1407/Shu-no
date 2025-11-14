import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Users,
  MapPin,
  CreditCard,
  ArrowLeft,
  Shield,
  CheckCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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

interface PaymentState {
  property: Property;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  notes: string;
  totalPrice: number;
  from?: string;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentState;

  const [isPageReady, setIsPageReady] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"stripe" | "paypal" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { apiCall, getAuthToken } = useAuthenticatedApi();

  // Animation d'entrée de page
  useEffect(() => {
    setTimeout(() => setIsPageReady(true), 100);
  }, []);

  // Vérifier si nous avons les données nécessaires
  if (!state?.property || !state?.checkIn || !state?.checkOut) {
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
                <CreditCard className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Données de réservation manquantes
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Pour accéder au paiement, vous devez d'abord finaliser votre réservation.
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
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const { property, checkIn, checkOut, guests, notes, totalPrice } = state;
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));

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

  const handlePayment = async (method: "stripe" | "paypal") => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    setSelectedPaymentMethod(method);

    try {
      // Créer la réservation en attente de paiement
      const orderData = {
        userId: currentUser.id,
        productId: property.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests,
        notes,
        status: "pending_payment",
        totalPrice,
        paymentMethod: method,
      };

      const response = await apiCall("/api/orders/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (method === "stripe") {
        // Redirection vers Stripe Checkout ou intégration Stripe Elements
        console.log("Redirection vers Stripe:", response);
        // Ici vous intégrerez Stripe
        // window.location.href = response.stripeUrl;

        // Pour le moment, simulons un paiement réussi
        setTimeout(() => {
          navigate("/payment-success", {
            state: {
              orderId: response.orderId,
              property,
              checkIn,
              checkOut,
              guests,
              totalPrice,
            },
          });
        }, 2000);
      } else if (method === "paypal") {
        // Redirection vers PayPal
        console.log("Redirection vers PayPal:", response);
        // Ici vous intégrerez PayPal
        // window.location.href = response.paypalUrl;

        // Pour le moment, simulons un paiement réussi
        setTimeout(() => {
          navigate("/payment-success", {
            state: {
              orderId: response.orderId,
              property,
              checkIn,
              checkOut,
              guests,
              totalPrice,
            },
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erreur lors du paiement:", error);
      setIsProcessing(false);
      setSelectedPaymentMethod(null);
      // Afficher un message d'erreur
    }
  };

  const handleBack = () => {
    navigate("/reservation-summary", {
      state: {
        property,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        from: state.from,
      },
    });
  };

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
                  <BreadcrumbLink asChild>
                    <Link to="/reservation-summary">Récapitulatif</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Paiement</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* En-tête avec bouton retour */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Finaliser le paiement
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Résumé de la commande */}
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-500 delay-100 ${
                isPageReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Résumé de votre réservation
              </h2>

              {/* Informations sur la propriété */}
              <div className="space-y-4 mb-6">
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={`${property.name} – gîte situé à ${property.location}`}
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
              <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Arrivée</span>
                  <span className="font-medium">
                    {format(new Date(checkIn), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Départ</span>
                  <span className="font-medium">
                    {format(new Date(checkOut), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Voyageurs</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Durée</span>
                  <span className="font-medium">
                    {nights} nuit{nights > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Prix total */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total à payer</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {(totalPrice / nights).toFixed(2)} € × {nights} nuit{nights > 1 ? "s" : ""}
                </p>
              </div>

              {/* Sécurité */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Paiement sécurisé</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Vos informations de paiement sont protégées par un cryptage SSL.
                </p>
              </div>
            </div>

            {/* Méthodes de paiement */}
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-500 delay-200 ${
                isPageReady ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Choisissez votre méthode de paiement
              </h2>

              <div className="space-y-4">
                {/* Stripe */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPaymentMethod === "stripe" ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <Button
                      onClick={() => handlePayment("stripe")}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessing && selectedPaymentMethod === "stripe" ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Redirection vers Stripe...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payer avec Stripe
                        </div>
                      )}
                    </Button>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                      Cartes bancaires, Apple Pay, Google Pay
                    </p>
                  </CardContent>
                </Card>

                {/* PayPal */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPaymentMethod === "paypal" ? "ring-2 ring-yellow-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <Button
                      onClick={() => handlePayment("paypal")}
                      disabled={isProcessing}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {isProcessing && selectedPaymentMethod === "paypal" ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Redirection vers PayPal...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payer avec PayPal
                        </div>
                      )}
                    </Button>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                      Compte PayPal ou carte via PayPal
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Informations légales */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  En confirmant votre paiement, vous acceptez nos{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    conditions générales
                  </Link>{" "}
                  et notre{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
