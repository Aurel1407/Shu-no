import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users, MapPin, Download, Mail } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PaymentSuccessState {
  orderId: string;
  property: {
    id: number;
    name: string;
    location: string;
    images?: string[];
  };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentSuccessState;
  const [isPageReady, setIsPageReady] = useState(false);

  // Animation d'entrée de page
  useEffect(() => {
    setTimeout(() => setIsPageReady(true), 100);
  }, []);

  // Redirection si pas de données
  useEffect(() => {
    if (!state?.orderId) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderId) {
    return null;
  }

  const { orderId, property, checkIn, checkOut, guests, totalPrice } = state;
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="pt-20 px-4 pb-8">
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isPageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Message de succès */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Paiement réussi !
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Votre réservation a été confirmée avec succès.
            </p>
          </div>

          {/* Détails de la réservation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Confirmation de réservation
              </h2>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Commande #{orderId}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations propriété */}
              <div>
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={`${property.name} – gîte réservé à ${property.location}`}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    loading="lazy"
                  />
                )}
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {property.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
                  {property.location}
                </p>
              </div>

              {/* Détails séjour */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Arrivée</span>
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {format(new Date(checkIn), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Départ</span>
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {format(new Date(checkOut), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Voyageurs</span>
                  <span className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {guests}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Durée</span>
                  <span className="font-medium">
                    {nights} nuit{nights > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    Total payé
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Prochaines étapes
            </h3>
            <ul className="space-y-3 list-none">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Email de confirmation envoyé
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Vous recevrez un email avec tous les détails de votre réservation.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Réservation confirmée
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Votre hébergement est maintenant réservé pour les dates sélectionnées.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/user-bookings")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voir mes réservations
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
            <Button
              variant="outline"
              onClick={() => globalThis.print()}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Imprimer
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
