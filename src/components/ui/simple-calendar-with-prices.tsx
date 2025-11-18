import React, { useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { Locale } from "date-fns";

interface SimpleCalendarWithPricesProps {
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

export const SimpleCalendarWithPrices: React.FC<SimpleCalendarWithPricesProps> = ({
  basePrice,
  className = "",
  ...calendarProps
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addPrices = () => {
      console.log("🚀 SimpleCalendarWithPrices: Démarrage ajout des prix");

      if (!calendarRef.current) {
        console.log("❌ Référence calendar non trouvée");
        return;
      }

      console.log(
        "🔍 Structure DOM du calendrier:",
        calendarRef.current.innerHTML.substring(0, 500)
      );

      // Essayer différents sélecteurs
      let dayButtons = calendarRef.current.querySelectorAll('button[role="gridcell"]');
      console.log(`📅 Sélecteur 1 - button[role="gridcell"]: ${dayButtons.length} éléments`);

      if (dayButtons.length === 0) {
        dayButtons = calendarRef.current.querySelectorAll('[role="gridcell"] button');
        console.log(`📅 Sélecteur 2 - [role="gridcell"] button: ${dayButtons.length} éléments`);
      }

      if (dayButtons.length === 0) {
        dayButtons = calendarRef.current.querySelectorAll("button");
        console.log(`📅 Sélecteur 3 - button: ${dayButtons.length} éléments`);
      }

      if (dayButtons.length === 0) {
        console.log("❌ Aucun bouton trouvé dans le calendrier");
        return;
      }

      dayButtons.forEach((button: Element, index) => {
        const btn = button as HTMLButtonElement;
        const dayText = btn.textContent?.trim();
        console.log(`🔍 Bouton ${index}: "${dayText}"`);

        if (dayText && !isNaN(parseInt(dayText)) && !btn.querySelector(".simple-price")) {
          console.log(`💰 Ajout prix ${basePrice}€ pour le jour ${dayText}`);

          // Ajouter le prix directement dans le bouton
          const priceSpan = document.createElement("div");
          priceSpan.className = "simple-price text-xs font-bold text-blue-600 mt-1";
          priceSpan.textContent = `${basePrice}€`;

          // Restructurer le bouton
          btn.style.display = "flex";
          btn.style.flexDirection = "column";
          btn.style.alignItems = "center";
          btn.style.justifyContent = "center";
          btn.style.height = "50px";
          btn.style.lineHeight = "1";

          btn.appendChild(priceSpan);
          console.log(`✅ Prix ajouté avec succès pour le jour ${dayText}`);
        }
      });
    };

    // Essayer plusieurs fois avec des délais différents
    const timer1 = setTimeout(addPrices, 100);
    const timer2 = setTimeout(addPrices, 300);
    const timer3 = setTimeout(addPrices, 600);
    const timer4 = setTimeout(addPrices, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [basePrice]);

  return (
    <div ref={calendarRef} className={`simple-calendar-with-prices ${className}`}>
      <Calendar {...calendarProps} />
    </div>
  );
};
