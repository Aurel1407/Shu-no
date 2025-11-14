import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center space-x-1.5 bg-card/60 backdrop-blur-sm rounded-full px-2 py-1.5 border border-border/50 shadow-sm">
      <Sun
        className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-muted-foreground" : "text-primary"}`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 scale-75"
        aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      />
      <Moon
        className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-primary" : "text-muted-foreground"}`}
      />
    </div>
  );
};

export default ThemeToggle;
