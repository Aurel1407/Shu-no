import React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarWithPricesProps {
  mode: "single";
  selected?: Date | null;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
  initialFocus?: boolean;
  locale?: any;
  getPriceForDate: (date: Date) => number;
  className?: string;
}

export const CalendarWithPrices: React.FC<CalendarWithPricesProps> = ({
  getPriceForDate,
  className = "",
  ...calendarProps
}) => {
  // Générer les modifiers pour chaque prix possible
  const generatePriceModifiers = () => {
    const modifiers: Record<string, (date: Date) => boolean> = {};
    const uniquePrices = new Set<number>();

    // Calculer les prix pour une période pour détecter tous les prix possibles
    const today = new Date();
    const endDate = new Date(today.getFullYear() + 1, 11, 31); // Fin de l'année suivante

    // Parcourir toutes les dates pour trouver les prix uniques
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 7)) {
      // Échantillonner chaque semaine
      try {
        const price = getPriceForDate(new Date(d));
        uniquePrices.add(price);
      } catch (error) {
        console.warn("Erreur lors du calcul du prix pour la date", d, error);
      }
    }

    // Créer un modifier pour chaque prix unique
    uniquePrices.forEach((price) => {
      modifiers[`price-${price}`] = (date: Date) => {
        try {
          return getPriceForDate(date) === price;
        } catch {
          return false;
        }
      };
    });

    return { modifiers, uniquePrices };
  };

  const { modifiers, uniquePrices } = generatePriceModifiers();

  // Créer les classes CSS pour chaque prix
  const modifiersClassNames: Record<string, string> = {};
  uniquePrices.forEach((price) => {
    modifiersClassNames[`price-${price}`] = `price-modifier price-${price}`;
  });

  // Générer les styles CSS dynamiquement
  const generateStyles = () => {
    const styles = Array.from(uniquePrices)
      .map(
        (price) => `
      .price-${price} {
        position: relative !important;
        height: 50px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding-top: 6px !important;
        padding-bottom: 4px !important;
      }
      
      .price-${price}::after {
        content: '${price}€' !important;
        position: absolute !important;
        bottom: 2px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        font-size: 10px !important;
        font-weight: bold !important;
        color: #2563eb !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }
    `
      )
      .join("\n");

    return styles;
  };

  return (
    <div className={`calendar-with-prices ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: generateStyles() }} />
      <Calendar
        {...calendarProps}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="calendar-with-price-display"
      />
    </div>
  );
};
