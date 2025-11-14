import React, { useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";

interface WorkingCalendarWithPricesProps {
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

export const WorkingCalendarWithPrices: React.FC<WorkingCalendarWithPricesProps> = ({
  getPriceForDate,
  className = "",
  ...calendarProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addPricesToButtons = () => {
      if (!containerRef.current) return;

      // Chercher tous les boutons de jour qui n'ont pas encore de prix
      const dayButtons = containerRef.current.querySelectorAll("button:not([data-price-added])");

      dayButtons.forEach((button) => {
        const htmlButton = button as HTMLButtonElement;
        const text = htmlButton.textContent?.trim();
        const dayNumber = text ? parseInt(text) : NaN;

        // Vérifier que c'est bien un bouton de jour (nombre entre 1-31)
        if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
          // Trouver le mois affiché
          const monthCaption = containerRef.current?.querySelector(
            '[class*="caption"] [class*="label"], .rdp-caption_label'
          );
          let currentMonth = new Date();

          if (monthCaption?.textContent) {
            const captionText = monthCaption.textContent;
            const monthMatch = /(\w+)\s+(\d{4})/.exec(captionText);

            if (monthMatch) {
              const monthName = monthMatch[1].toLowerCase();
              const year = parseInt(monthMatch[2]);

              const monthNames = {
                janvier: 0,
                février: 1,
                mars: 2,
                avril: 3,
                mai: 4,
                juin: 5,
                juillet: 6,
                août: 7,
                septembre: 8,
                octobre: 9,
                novembre: 10,
                décembre: 11,
              };

              const monthIndex = monthNames[monthName as keyof typeof monthNames];
              if (monthIndex !== undefined) {
                currentMonth = new Date(year, monthIndex, dayNumber);
              }
            }
          }

          try {
            // Calculer le prix pour cette date
            const price = getPriceForDate(currentMonth);

            // Marquer comme traité
            htmlButton.dataset.priceAdded = "true";

            // Restructurer le contenu du bouton
            htmlButton.style.display = "flex";
            htmlButton.style.flexDirection = "column";
            htmlButton.style.alignItems = "center";
            htmlButton.style.justifyContent = "center";
            htmlButton.style.height = "48px";
            htmlButton.style.padding = "4px";
            htmlButton.style.gap = "2px";

            // Créer le contenu structuré
            const dayDiv = document.createElement("div");
            dayDiv.textContent = dayNumber.toString();
            dayDiv.style.fontSize = "14px";

            const priceDiv = document.createElement("div");
            priceDiv.textContent = `${price}€`;
            priceDiv.style.fontSize = "10px";
            priceDiv.style.fontWeight = "bold";
            priceDiv.style.color = "#2563eb";
            priceDiv.style.lineHeight = "1";

            // Remplacer le contenu
            htmlButton.innerHTML = "";
            htmlButton.appendChild(dayDiv);
            htmlButton.appendChild(priceDiv);
          } catch (error) {
            console.error("Erreur lors du calcul du prix:", error);
          }
        }
      });
    };

    // Ajouter les prix avec plusieurs tentatives
    const timeouts = [50, 150, 300, 500].map((delay) => setTimeout(addPricesToButtons, delay));

    // Observer pour les changements (navigation de mois)
    const observer = new MutationObserver(() => {
      setTimeout(addPricesToButtons, 100);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [getPriceForDate]);

  return (
    <div ref={containerRef} className={`working-calendar-with-prices ${className}`}>
      <Calendar {...calendarProps} />
    </div>
  );
};
