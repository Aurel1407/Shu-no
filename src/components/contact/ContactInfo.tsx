import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-bleu-clair/20 to-bleu-profond/10 border-bleu-moyen/30 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <Phone className="w-8 h-8 text-bleu-moyen mb-4" aria-hidden="true" />
          <h3 className="font-semibold mb-2 text-card-foreground dark:text-white">Téléphone</h3>
          <p className="text-muted-foreground dark:text-gray-300">
            Fixe:{" "}
            <a
              href="tel:0975581186"
              className="hover:text-bleu-moyen transition-colors"
              aria-label="Appeler le numéro fixe 09 75 58 11 86"
            >
              09 75 58 11 86
            </a>
          </p>
          <p className="text-muted-foreground dark:text-gray-300">
            Hervé:{" "}
            <a
              href="tel:0626532877"
              className="hover:text-bleu-moyen transition-colors"
              aria-label="Appeler Hérve au 06 26 53 28 77"
            >
              06 26 53 28 77
            </a>
          </p>
          <p className="text-muted-foreground dark:text-gray-300">
            Isabelle:{" "}
            <a
              href="tel:0626359373"
              className="hover:text-bleu-moyen transition-colors"
              aria-label="Appeler Isabelle au 06 26 35 93 73"
            >
              06 26 35 93 73
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-bleu-clair/20 to-bleu-profond/10 border-bleu-moyen/30 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <Mail className="w-8 h-8 text-bleu-moyen mb-4" aria-hidden="true" />
          <h3 className="font-semibold mb-2 text-card-foreground dark:text-white">Email</h3>
          <p className="text-muted-foreground dark:text-gray-300">
            <a
              href="mailto:contact@shu-no.fr"
              className="hover:text-bleu-moyen transition-colors"
              aria-label="Envoyer un email à contact@shu-no.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              contact@shu-no.fr
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-bleu-clair/20 to-bleu-profond/10 border-bleu-moyen/30 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <MapPin className="w-8 h-8 text-bleu-moyen mb-4" aria-hidden="true" />
          <h3 className="font-semibold mb-2 text-card-foreground dark:text-white">Adresse</h3>
          <p className="text-muted-foreground dark:text-gray-300">
            01 Kerhamon
            <br />
            22290 Pléhédel
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=01+Kerhamon+22290+Pléhédel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-bleu-moyen hover:text-bleu-profond transition-colors"
            aria-label="Voir l'adresse 01 Kerhamon, 22290 Pléhédel sur Google Maps"
          >
            <MapPin className="w-4 h-4" />
            Voir sur la carte
          </a>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-bleu-clair/20 to-bleu-profond/10 border-bleu-moyen/30 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <Clock className="w-8 h-8 text-bleu-moyen mb-4" />
          <h3 className="font-semibold mb-2 text-card-foreground dark:text-white">
            Horaires d'arrivée et de départ
          </h3>
          <p className="text-muted-foreground dark:text-gray-300">Arrivée: De 15:00 à 21:00</p>
          <p className="text-muted-foreground dark:text-gray-300">Départ: De 05:00 à 11:00</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
