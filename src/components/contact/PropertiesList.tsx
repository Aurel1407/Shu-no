import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Property } from "./types";

interface PropertiesListProps {
  properties: Property[];
}

const PropertiesList: React.FC<PropertiesListProps> = ({ properties }) => {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-playfair font-bold text-center mb-6 text-foreground">
        Nos hébergements
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {properties.map((property) => (
          <Card
            key={property.id}
            className="border-bleu-moyen/30 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg">{property.name}</h4>
                <Home className="w-5 h-5 text-bleu-profond" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {property.address ? `${property.address}, ` : ""}
                {property.city || property.location}
              </p>
              <p className="text-sm font-medium text-bleu-profond">
                À partir de {property.price}€/nuit
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertiesList;
