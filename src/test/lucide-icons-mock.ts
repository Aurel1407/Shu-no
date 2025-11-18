import { vi } from "vitest";

// Liste complète des icônes Lucide utilisées dans l'application
export const lucideIconsList = [
  "AlertCircle",
  "AlertTriangle",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Building",
  "Calendar",
  "Camera",
  "Check",
  "CheckCircle",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronUp",
  "Clock",
  "Copy",
  "CreditCard",
  "DollarSign",
  "Download",
  "Edit",
  "Edit2",
  "Edit3",
  "Euro",
  "Eye",
  "EyeOff",
  "Facebook",
  "Filter",
  "Github",
  "Globe",
  "Heart",
  "Home",
  "Image",
  "Info",
  "Instagram",
  "Linkedin",
  "Loader2",
  "Lock",
  "LogIn",
  "LogOut",
  "Mail",
  "MapPin",
  "Menu",
  "MessageCircle",
  "MessageSquare",
  "Moon",
  "MoreHorizontal",
  "Circle",
  "MoreVertical",
  "Phone",
  "Plus",
  "PlusCircle",
  "RefreshCw",
  "Save",
  "Search",
  "Settings",
  "Share",
  "Shield",
  "Star",
  "Sun",
  "Trash",
  "Trash2",
  "Twitter",
  "Upload",
  "User",
  "UserCheck",
  "UserPlus",
  "Users",
  "X",
  "XCircle",
  "Bath",
  "Bed",
  "Car",
  "Wifi",
  "Zap",
  "TrendingUp",
  "BarChart3",
  "CheckCircle2",
  "CalendarIcon",
  "Mountain",
  "Dot",
];

// Mock component générique pour toutes les icônes Lucide
export const createMockIcon = (iconName: string) => {
  return () => `${iconName}Icon`;
};

// Génération automatique des mocks pour toutes les icônes
export const createLucideMocks = () => {
  const mocks: Record<string, () => string> = {};

  lucideIconsList.forEach((iconName) => {
    mocks[iconName] = createMockIcon(iconName);
  });

  return mocks;
};

// Mock par défaut pour lucide-react
export const defaultLucideMock = createLucideMocks();
