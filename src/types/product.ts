export interface Product {
  id: number;
  name: string;
  location: string;
  price: number;
  isActive: boolean;
  description?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}
