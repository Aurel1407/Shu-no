import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer id="main-footer" className="bg-muted text-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-bleu-clair to-bleu-profond rounded-full flex items-center justify-center">
                <span className="text-white font-playfair font-bold">SN</span>
              </div>
              <h3 className="text-xl font-playfair font-bold">Shu no</h3>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Découvrez la beauté exceptionnelle de la Côte de Goëlo à travers nos gîtes et
              chambres d'hôtes de charme. Des moments inoubliables vous attendent.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/shu-no"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visiter notre page Facebook"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-bleu-profond transition-colors"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com/shu-no"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visiter notre compte Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-bleu-profond transition-colors"
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-playfair font-semibold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  Réserver
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-bleu-profond dark:text-bleu-clair" aria-hidden="true" />
                <span className="text-muted-foreground">09 75 58 11 86</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-bleu-profond dark:text-bleu-clair" aria-hidden="true" />
                <span className="text-muted-foreground">contact@shu-no.fr</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-bleu-profond dark:text-bleu-clair mt-1" aria-hidden="true" />
                <span className="text-muted-foreground">
                  01 Kerhamon
                  <br />
                  22290 Pléhédel
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2025 Shu no. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link
              to="/mentions-legales"
              className="text-muted-foreground hover:text-accent-foreground text-sm transition-colors"
            >
              Mentions Légales
            </Link>
            <Link
              to="/cgu"
              className="text-muted-foreground hover:text-accent-foreground text-sm transition-colors"
            >
              CGU
            </Link>
            <Link
              to="/confidentialite"
              className="text-muted-foreground hover:text-accent-foreground text-sm transition-colors"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
