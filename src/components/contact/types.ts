// Types partagés pour les composants Contact
export interface Property {
  id: number;
  name: string;
  location: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  isActive?: boolean;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "beach" | "town" | "nature" | "viewpoint";
  icon: string;
  image?: string;
}
