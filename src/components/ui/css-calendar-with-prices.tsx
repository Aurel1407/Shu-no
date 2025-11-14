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
  basePrice: number;
  className?: string;
}

export const CSSCalendarWithPrices: React.FC<CalendarWithPricesProps> = ({
  basePrice,
  className = "",
  ...calendarProps
}) => {
  const customStyle = `
    /* Styles pour afficher les prix dans le calendrier */
    .calendar-with-prices-css [role="gridcell"]:not([aria-disabled="true"]) button::after {
      content: "${basePrice}€";
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #2563eb;
      line-height: 1;
      margin-top: 2px;
    }
    
    .calendar-with-prices-css [role="gridcell"] button {
      height: 48px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
    }
    
    .calendar-with-prices-css [role="gridcell"][aria-disabled="true"] button::after {
      color: #9ca3af;
    }
    
    .calendar-with-prices-css [role="gridcell"] button[aria-selected="true"]::after {
      color: white;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyle }} />
      <div className={`calendar-with-prices-css ${className}`}>
        <Calendar {...calendarProps} />
      </div>
    </>
  );
};
