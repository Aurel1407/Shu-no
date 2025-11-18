import "@testing-library/jest-dom";
import { vi } from "vitest";
import { buildRouterMocks } from "./utils/router-mock";

// Mock pour les modules qui utilisent des APIs du navigateur
Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock pour localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock pour ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = ResizeObserverMock;

// Mock pour IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // Simuler immédiatement l'intersection pour les tests
    setTimeout(() => {
      callback(
        [
          {
            isIntersecting: true,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            target: {} as Element,
            time: Date.now(),
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this as any
      );
    }, 0);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.IntersectionObserver = IntersectionObserverMock as any;

// Mock global pour lucide-react avec toutes les icônes
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  // Créer un mock générique pour toutes les icônes
  const createIconMock =
    (name: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ className, ...props }: any) =>
      `${name} Icon`;

  return {
    ...actual,
    // Liste complète des icônes utilisées dans l'app
    Home: createIconMock("Home"),
    User: createIconMock("User"),
    Users: createIconMock("Users"),
    ArrowLeft: createIconMock("ArrowLeft"),
    ArrowRight: createIconMock("ArrowRight"),
    Calendar: createIconMock("Calendar"),
    CalendarIcon: createIconMock("Calendar"),
    MapPin: createIconMock("MapPin"),
    Mail: createIconMock("Mail"),
    Phone: createIconMock("Phone"),
    Search: createIconMock("Search"),
    Filter: createIconMock("Filter"),
    Edit: createIconMock("Edit"),
    Trash2: createIconMock("Trash2"),
    Eye: createIconMock("Eye"),
    EyeOff: createIconMock("EyeOff"),
    Plus: createIconMock("Plus"),
    Save: createIconMock("Save"),
    X: createIconMock("X"),
    Check: createIconMock("Check"),
    CheckCircle: createIconMock("CheckCircle"),
    CheckCircle2: createIconMock("CheckCircle2"),
    AlertCircle: createIconMock("AlertCircle"),
    AlertTriangle: createIconMock("AlertTriangle"),
    Circle: createIconMock("Circle"),
    MessageSquare: createIconMock("MessageSquare"),
    RefreshCw: createIconMock("RefreshCw"),
    Loader2: createIconMock("Loader2"),
    Menu: createIconMock("Menu"),
    ChevronDown: createIconMock("ChevronDown"),
    ChevronLeft: createIconMock("ChevronLeft"),
    ChevronRight: createIconMock("ChevronRight"),
    MoreHorizontal: createIconMock("MoreHorizontal"),
    Bed: createIconMock("Bed"),
    Bath: createIconMock("Bath"),
    Wifi: createIconMock("Wifi"),
    Car: createIconMock("Car"),
    DollarSign: createIconMock("DollarSign"),
    TrendingUp: createIconMock("TrendingUp"),
    BarChart3: createIconMock("BarChart3"),
    Settings: createIconMock("Settings"),
    Clock: createIconMock("Clock"),
    XCircle: createIconMock("XCircle"),
    UserPlus: createIconMock("UserPlus"),
    LogIn: createIconMock("LogIn"),
    LogOut: createIconMock("LogOut"),
    Lock: createIconMock("Lock"),
    Moon: createIconMock("Moon"),
    Sun: createIconMock("Sun"),
    Facebook: createIconMock("Facebook"),
    Instagram: createIconMock("Instagram"),
    Dot: createIconMock("Dot"),
    Mountain: createIconMock("Mountain"),
    Camera: createIconMock("Camera"),
    Star: createIconMock("Star"),
    // Ajout d'icônes supplémentaires trouvées dans les erreurs
    Image: createIconMock("Image"),
    Upload: createIconMock("Upload"),
    Swimming: createIconMock("Swimming"),
    Utensils: createIconMock("Utensils"),
    Tv: createIconMock("Tv"),
    Wind: createIconMock("Wind"),
    Coffee: createIconMock("Coffee"),
    // Icônes manquantes détectées dans les erreurs récentes
    BookOpen: createIconMock("BookOpen"),
    Activity: createIconMock("Activity"),
    Percent: createIconMock("Percent"),
    PieChart: createIconMock("PieChart"),
    LineChart: createIconMock("LineChart"),
    ArrowUp: createIconMock("ArrowUp"),
    ArrowDown: createIconMock("ArrowDown"),
    TrendingDown: createIconMock("TrendingDown"),
    CalendarDays: createIconMock("CalendarDays"),
    Users2: createIconMock("Users2"),
    Building: createIconMock("Building"),
    Euro: createIconMock("Euro"),
  };
});

// Mock pour les routes React Router (partiel)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    ...buildRouterMocks(),
  };
});
