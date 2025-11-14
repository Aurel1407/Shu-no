import React from "react";
import "leaflet/dist/leaflet.css";

const getDefaultImageForType = (type: string): string => {
  const imageMap: { [key: string]: string } = {
      beach: "",
      town: "",
      nature: "",
      viewpoint: "",
  };
  return (
  imageMap[type] || ""
  );
};

interface Property {
  id: number;
  name: string;
  location: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  isActive?: boolean;
  image?: string;
}

interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "beach" | "town" | "nature" | "viewpoint";
  icon: string;
  image?: string;
}

interface MapComponentProps {
  properties: Property[];
  pointsOfInterest: PointOfInterest[];
}

const MapComponent: React.FC<MapComponentProps> = ({ properties, pointsOfInterest }) => {
  return (
    <div id="map" className="w-full h-full rounded-lg">
      Map Component
    </div>
  );
};

export default MapComponent;
