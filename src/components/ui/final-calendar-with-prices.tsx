import React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { Locale } from "date-fns";

interface CalendarWithPricesProps {
  mode: "single";
  selected?: Date | null;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
  initialFocus?: boolean;
  locale?: Locale;
  basePrice: number;
  className?: string;
}

export const FinalCalendarWithPrices: React.FC<CalendarWithPricesProps> = ({
  basePrice,
  className = "",
  ...calendarProps
}) => {
  // CSS personnalisé injecté directement
  const customCSS = `
    <style>
      /* Modification directe des boutons de calendrier pour afficher les prix */
      .final-calendar-with-prices .rdp-day {
        height: 52px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
      }
      
      .final-calendar-with-prices .rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)::after {
        content: "${basePrice}€" !important;
        display: block !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        color: #2563eb !important;
        line-height: 1 !important;
        margin-top: 2px !important;
      }
      
      .final-calendar-with-prices .rdp-day_disabled::after {
        color: #9ca3af !important;
      }
      
      .final-calendar-with-prices .rdp-day_selected::after {
        color: white !important;
      }

      /* Alternative avec des attributs data */
      .final-calendar-with-prices [role="gridcell"] button {
        height: 52px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
      }
      
      .final-calendar-with-prices [role="gridcell"]:not([aria-disabled="true"]) button::after {
        content: "${basePrice}€" !important;
        display: block !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        color: #2563eb !important;
        line-height: 1 !important;
        margin-top: 2px !important;
      }
    </style>
  `;

  return (
    <div className={`final-calendar-with-prices ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: customCSS }} />
      <Calendar {...calendarProps} />
    </div>
  );
};
