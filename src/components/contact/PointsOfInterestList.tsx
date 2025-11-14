import { Card, CardContent } from "@/components/ui/card";
import { PointOfInterest } from "./types";

interface PointsOfInterestListProps {
  pointsOfInterest: PointOfInterest[];
}

const PointsOfInterestList: React.FC<PointsOfInterestListProps> = ({ pointsOfInterest }) => {
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-playfair font-bold text-center mb-6 text-foreground">
        Points d'intérêt touristiques
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pointsOfInterest.map((poi) => (
          <Card
            key={poi.id}
            className="border-bleu-moyen/30 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg">{poi.name}</h4>
                <span className="text-2xl">{poi.icon}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{poi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PointsOfInterestList;
