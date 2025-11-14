import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MapPin, Users, Bed, Bath, Wifi, Car, Phone, Mail, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRoutePreloader } from "@/hooks/use-route-preloader";
import { PropertyListSkeleton } from "@/components/ui/skeletons";
import { useProductsQuery } from "@/hooks/api/products";
import { Product } from "@/types/product";
import { getCloudinaryCardImage } from "@/lib/cloudinary-utils";

const Index = () => {
  const navigate = useNavigate();

  // Référence pour la gestion du focus
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { preloadPropertyRoutes } = useRoutePreloader();

  const {
    data: featuredProperties = [],
    isPending,
    isError,
    error,
  } = useProductsQuery<Product[]>({
    queryKey: ["products"],
    select: (products) => products.filter((property) => property.isActive),
  });

  const isLoading = isPending;
  const errorMessage = isError
    ? (error?.message ?? "Erreur lors du chargement des propriétés")
    : null;

  // Gestion du titre de la page pour l'accessibilité
  useEffect(() => {
    document.title = "Shu-no - Gîtes et Chambres d'hôtes en Bretagne";

    // Précharger les routes de propriétés pour une navigation plus fluide
    preloadPropertyRoutes();
  }, [preloadPropertyRoutes]);

  // Gestion du focus après le chargement
  useEffect(() => {
    if (!isLoading && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [isLoading]);

  // NOTE: Retiré les images par défaut. Seule la première image fournie par la propriété
  // sera affichée ; sinon un placeholder visuel est utilisé.

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main role="main">
        {/* Hero Section */}
        <section
          id="main-content"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bleu-clair/30 via-background to-bleu-profond/20"
          aria-labelledby="hero-title"
          tabIndex={-1}
          ref={mainContentRef}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h1
                id="hero-title"
                className="text-5xl md:text-6xl font-playfair font-bold mb-6 text-foreground"
              >
                Shu no
              </h1>
              <p className="text-xl md:text-2xl font-light mb-4 text-foreground">
                Gîtes et Chambres d'hôtes
              </p>
              <p className="text-lg mb-8 text-muted-foreground max-w-3xl mx-auto">
                Découvrez la beauté exceptionnelle de la Côte de Goëlo à travers nos locations
                saisonnières de charme
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#properties" aria-label="Voir nos gîtes disponibles">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-bleu-profond to-bleu-moyen hover:from-bleu-profond/90 hover:to-bleu-moyen/90 text-white px-8 py-3"
                  >
                    Voir nos gîtes
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

        {/* Section de présentation */}
        <section
          className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
          aria-labelledby="welcome-title"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                id="welcome-title"
                className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4"
              >
                Bienvenue dans notre havre de paix breton
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Entre nature et sérénité, découvrez nos gîtes au cœur de la Côte de Goëlo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
                <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
                  Nos Gîtes
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Au cœur d'un village typique, notre maison d'architecte des années 80 abrite deux
                  gîtes indépendants, aménagés avec soin pour vous offrir confort, intimité et
                  dépaysement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Chacun dispose de son entrée privée et de ses espaces extérieurs dédiés, afin que
                  vous profitiez pleinement de votre séjour.
                </p>
              </div>

              <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
                <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
                  Notre Domaine
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Plongez dans une ambiance marine apaisante, bercée par le charme d'un parc arboré
                  et fleuri de 4 000 m², où trône une piscine flambant neuve.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3" aria-hidden="true"></span>
                    <span>Parking sécurisé fermé par portail électrique</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3" aria-hidden="true"></span>
                    <span>Local à vélos avec racks et housses</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg border border-border mb-8">
              <h3 className="text-2xl font-playfair font-semibold text-foreground mb-6 text-center">
                Rencontrez Isabelle et Hervé
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
                Isabelle, Hervé et leurs compagnons à quatre et deux pattes (deux petits chiens et
                un perroquet !), originaires de Haute-Savoie, ont choisi la Bretagne pour une
                nouvelle vie, plus proche de la nature et des grands espaces.
              </p>
              <p className="text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto mt-4">
                Aujourd'hui, c'est avec chaleur et authenticité qu'ils vous accueillent pour un
                séjour ressourçant, à deux pas des merveilles de la Côte de Goëlo.
              </p>
            </div>

            <div className="bg-gradient-to-r from-bleu-clair/10 to-bleu-profond/10 p-8 rounded-xl border border-bleu-moyen/20">
              <h3 className="text-2xl font-playfair font-semibold text-foreground mb-6 text-center">
                À proximité : paysages à couper le souffle
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-bleu-profond mr-3 mt-1">•</span>
                    <span className="text-muted-foreground">
                      La Baie de Saint-Brieuc et ses réserves naturelles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bleu-profond mr-3 mt-1">•</span>
                    <span className="text-muted-foreground">
                      Paimpol, port aux accents d'Islande
                    </span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-bleu-profond mr-3 mt-1">•</span>
                    <span className="text-muted-foreground">
                      Les Caps de Paimpol et l'île de Bréhat
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bleu-profond mr-3 mt-1">•</span>
                    <span className="text-muted-foreground">
                      Lézardrieux et le Sillon de Talbert
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-bleu-profond text-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-playfair font-bold mb-4">
                  Plus qu'un hébergement, une parenthèse bretonne
                </h3>
                <p className="text-blue-100 leading-relaxed mb-6 max-w-2xl mx-auto">
                  Ici, on prend le temps de ralentir, de respirer l'air iodé, de savourer les petits
                  bonheurs simples...
                </p>
                <p className="text-xl font-semibold text-blue-200">
                  L'arrière-littoral de la Côte de Goëlo n'attend que vous !
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Propriétés en vedette */}
        <section
          id="properties"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
          aria-labelledby="properties-title"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                id="properties-title"
                className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-foreground"
              >
                Nos Gîtes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Découvrez nos hébergements sur la Côte de Goëlo
              </p>
            </div>

            {/* Affichage des erreurs */}
            {errorMessage && (
              <Alert
                variant="destructive"
                className="mb-6 max-w-4xl mx-auto"
                role="alert"
                aria-live="assertive"
              >
                <AlertDescription>
                  Impossible de charger les propriétés en temps réel. Les données affichées peuvent
                  ne pas être à jour.
                </AlertDescription>
              </Alert>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="mb-8" aria-live="polite" aria-label="Chargement des gîtes en cours">
                <PropertyListSkeleton count={4} />
              </div>
            )}

            <div
              className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto"
              role="list"
              aria-label="Liste des gîtes disponibles"
            >
              {featuredProperties.map((property) => (
                <article
                  key={property.id}
                  className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full max-w-sm"
                  role="listitem"
                >
                  <div className="relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={getCloudinaryCardImage(property.images[0])}
                        alt={`Photo du gîte ${property.name} situé à ${property.location}`}
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
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
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
                        {property.bedrooms && (
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4" aria-hidden="true" />
                            <span
                              aria-label={`${property.bedrooms} chambre${property.bedrooms > 1 ? "s" : ""}`}
                            >
                              {property.bedrooms}
                            </span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center space-x-1">
                            <Bath className="w-4 h-4" aria-hidden="true" />
                            <span
                              aria-label={`${property.bathrooms} salle${property.bathrooms > 1 ? "s" : ""} de bain`}
                            >
                              {property.bathrooms}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-4 border-t border-border">
                      <div className="min-w-0 flex-1 mb-3 sm:mb-0">
                        <div className="text-sm text-muted-foreground">À partir de</div>
                        <div
                          className="text-2xl font-bold text-bleu-profond break-words"
                          aria-label={`Prix: ${property.price} euros par nuit`}
                        >
                          {property.price}€/nuit
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-3">
                        <Link
                          to={`/property/${property.id}`}
                          aria-label={`Découvrir le gîte ${property.name}`}
                        >
                          <button className="px-3 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent transition-colors whitespace-nowrap">
                            Découvrir
                          </button>
                        </Link>
                        <button
                          className="px-3 py-2 bg-bleu-profond text-white rounded-lg hover:bg-bleu-moyen transition-colors whitespace-nowrap"
                          aria-label={`Réserver le gîte ${property.name}`}
                          onClick={() =>
                            navigate("/reservation-summary", { state: { property, from: "/" } })
                          }
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Message "liste vide" EN DEHORS du role="list" */}
            {!isLoading && featuredProperties.length === 0 && (
              <output className="text-center py-8 block max-w-6xl mx-auto" aria-live="polite">
                <p className="text-lg text-muted-foreground">
                  Aucun gîte disponible pour le moment.
                </p>
              </output>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-gradient-to-br from-bleu-clair/30 via-background to-bleu-profond/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-foreground">
                Nos Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tout pour rendre votre séjour inoubliable
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              role="list"
              aria-label="Services inclus"
            >
              {[
                {
                  icon: Wifi,
                  title: "WiFi Gratuit",
                  description: "Internet haut débit dans tous nos hébergements",
                },
                { icon: Car, title: "Parking Privé", description: "Stationnement sécurisé inclus" },
                {
                  icon: MapPin,
                  title: "Emplacement Idéal",
                  description: "Proche des sites touristiques",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="text-center bg-card p-6 rounded-xl shadow-lg border border-border"
                  role="listitem"
                >
                  <service.icon
                    className="w-12 h-12 text-bleu-profond mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section
          className="py-16 bg-gradient-to-br from-bleu-clair/30 via-background to-bleu-profond/20"
          aria-labelledby="cta-title"
        >
          <div className="container mx-auto px-4 text-center">
            <h2
              id="cta-title"
              className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-foreground"
            >
              Prêt pour votre escapade ?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Réservez dès maintenant votre séjour sur la Côte de Goëlo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/booking">
                <button className="px-8 py-3 bg-bleu-profond text-white rounded-lg hover:bg-bleu-moyen transition-colors font-medium">
                  Réserver maintenant
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-8 py-3 border-2 border-bleu-profond text-bleu-profond rounded-lg hover:bg-bleu-profond hover:text-white transition-colors font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                  Nous contacter
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Index;
