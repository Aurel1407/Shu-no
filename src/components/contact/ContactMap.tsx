import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Camera, Mountain, MapPin } from "lucide-react";
import { Property, PointOfInterest } from "./types";

const MapComponent = React.lazy(() => import("@/components/MapComponent"));

interface ContactMapProps {
  properties: Property[];
  pointsOfInterest: PointOfInterest[];
  error?: string;
}

const ContactMap: React.FC<ContactMapProps> = ({ properties, pointsOfInterest, error }) => {
  return (
    <div className="mt-8">
      {/* Légende de la carte */}
      <div className="mb-6 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-3 text-center">Légende de la carte</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-bleu-profond" />
            <span>🏠 Nos hébergements ({properties.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-600" />
            <span>
              🏖️ Plages & Nature (
              {pointsOfInterest.filter((p) => p.type === "beach" || p.type === "nature").length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-blue-600" />
            <span>
              🏔️ Points de vue ({pointsOfInterest.filter((p) => p.type === "viewpoint").length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>
              🏰 Villes & Ports ({pointsOfInterest.filter((p) => p.type === "town").length})
            </span>
          </div>
        </div>
      </div>

      <h2 id="map-title" className="sr-only">
        Carte interactive de la Côte de Goëlo
      </h2>

      <Card
        id="map-section"
        className="max-w-6xl mx-auto border-bleu-moyen/30 shadow-xl"
        role="region"
        aria-labelledby="map-title"
      >
        <CardContent className="p-0">
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <Suspense
              fallback={
                <div className="w-full h-64 flex items-center justify-center">
                  Chargement de la carte…
                </div>
              }
            >
              <MapComponent properties={properties} pointsOfInterest={pointsOfInterest} />
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-6xl mx-auto">
          <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ContactMap;
