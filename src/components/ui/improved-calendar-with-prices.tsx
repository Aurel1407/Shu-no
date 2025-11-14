import React, { useEffect } from "react";
import { DayPicker } from "react-day-picker";
import type { Locale } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarWithPricesProps {
  mode: "single";
  selected?: Date | null;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
  initialFocus?: boolean;
  locale?: Locale;
  getPriceForDate: (date: Date) => number;
  className?: string;
}

export const ImprovedCalendarWithPrices: React.FC<CalendarWithPricesProps> = ({
  className,
  getPriceForDate,
  ...props
}) => {
  // Ajouter les prix après le rendu du calendrier
  useEffect(() => {
    const addPrices = () => {
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        const buttons = document.querySelectorAll('[role="gridcell"] button[name="day"]');

        buttons.forEach((button) => {
          const htmlButton = button as HTMLButtonElement;

          // Éviter de dupliquer les prix
          if (htmlButton.querySelector(".price-display")) {
            return;
          }

          // Méthode 1: récupérer depuis data-day
          let date: Date | null = null;
          const dataDay = htmlButton.getAttribute("data-day");

          if (dataDay) {
            date = new Date(dataDay);
          }

          // Méthode 2: récupérer depuis datetime (react-day-picker utilise souvent cet attribut)
          if (!date || isNaN(date.getTime())) {
            const dateTime = htmlButton.getAttribute("datetime");
            if (dateTime) {
              date = new Date(dateTime);
            }
          }

          // Méthode 3: analyser le parent cell pour récupérer la date
          if (!date || isNaN(date.getTime())) {
            const cell = htmlButton.closest('[role="gridcell"]');
            const cellDate = cell?.getAttribute("data-day") || cell?.getAttribute("datetime");
            if (cellDate) {
              date = new Date(cellDate);
            }
          }

          // Méthode 4: Fallback - utiliser le mois affiché et le jour du bouton
          if (!date || isNaN(date.getTime())) {
            const dayText = htmlButton.textContent?.trim();
            if (dayText && /^\d+$/.test(dayText)) {
              const dayNumber = parseInt(dayText);

              // Trouver le mois affiché
              const monthCaption = htmlButton
                .closest(".rdp-month")
                ?.querySelector(".rdp-caption_label");
              const monthText = monthCaption?.textContent;

              if (monthText) {
                // Parser "octobre 2025" par exemple
                const monthMatch = monthText.match(/(\w+)\s+(\d{4})/);
                if (monthMatch) {
                  const monthName = monthMatch[1];
                  const year = parseInt(monthMatch[2]);

                  // Convertir le nom du mois en index (approximatif pour le français)
                  const monthIndex =
                    {
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
                    }[monthName.toLowerCase()] ?? new Date().getMonth();

                  date = new Date(year, monthIndex, dayNumber);
                }
              }
            }
          }

          if (date && !isNaN(date.getTime())) {
            try {
              const price = getPriceForDate(date);

              // Modifier le style du bouton pour l'affichage en colonne
              htmlButton.style.display = "flex";
              htmlButton.style.flexDirection = "column";
              htmlButton.style.alignItems = "center";
              htmlButton.style.justifyContent = "center";
              htmlButton.style.height = "48px";
              htmlButton.style.padding = "4px";

              // Ajouter le prix
              const priceSpan = document.createElement("span");
              priceSpan.textContent = `${price}€`;
              priceSpan.className = "price-display text-xs font-bold text-blue-600";
              priceSpan.style.lineHeight = "1";
              priceSpan.style.marginTop = "2px";

              htmlButton.appendChild(priceSpan);
            } catch (error) {
              console.error("Erreur lors de l'ajout du prix:", error, "Date:", date);
            }
          } else {
            console.log("Date non valide pour le bouton:", htmlButton.textContent, "Attributs:", {
              dataDay: htmlButton.getAttribute("data-day"),
              datetime: htmlButton.getAttribute("datetime"),
              cellDataDay: htmlButton.closest('[role="gridcell"]')?.getAttribute("data-day"),
            });
          }
        });
      }, 100);
    };

    addPrices();

    // Observer les changements de mois
    const observer = new MutationObserver(addPrices);
    const calendarContainer = document.querySelector(".rdp-months");

    if (calendarContainer) {
      observer.observe(calendarContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [getPriceForDate, props.selected, props.defaultMonth]);

  return (
    <DayPicker
      showOutsideDays={true}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 rdp-months",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "single" &&
            "[&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
};
