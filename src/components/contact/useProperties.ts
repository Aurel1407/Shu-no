import { useState, useEffect } from "react";
import { Property } from "./types";
import { API_URLS } from "@/config/api";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URLS.PRODUCTS);

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();

        // Traiter les propriétés actives
        const activeProperties = data.data || data;
        if (Array.isArray(activeProperties)) {
          const processedProperties = activeProperties
            .filter((property: Property) => property.isActive)
            .map((property: Property) => {
              // Ajouter des coordonnées par défaut pour Pléhédel si elles sont manquantes
              let lat = property.latitude;
              let lng = property.longitude;

              if (!lat || !lng || lat === null || lng === null) {
                // Coordonnées approximatives de Pléhédel
                lat = 48.7167;
                lng = -3.1167;
              }

              return {
                ...property,
                latitude: Number(lat),
                longitude: Number(lng),
              };
            });

          setProperties(processedProperties);
        } else {
          setProperties([]);
        }
        setError(null);
      } catch (err) {
        setError("Impossible de charger les propriétés sur la carte");
        // Données de fallback
        setProperties([
          {
            id: 1,
            name: "Propriété Test",
            location: "Bretagne",
            address: "Adresse de test",
            city: "Ville Test",
            latitude: 48.8167,
            longitude: -3.2833,
            price: 120,
            isActive: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  return { properties, error, loading };
};
