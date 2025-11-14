import { vi, beforeEach, afterEach } from "vitest";
import { defaultLucideMock } from "./lucide-icons-mock";
import { resetRouterMock } from "./utils/router-mock";

// Configuration globale des mocks pour tous les tests
beforeEach(() => {
  // Mock pour lucide-react avec toutes les icônes
  vi.mock("lucide-react", () => defaultLucideMock);

  // Mock pour les hooks d'authentification
  vi.mock("../hooks/use-authenticated-api", () => ({
    useAuthenticatedApi: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    })),
  }));

  // Mock pour les composants de carte
  vi.mock("../components/MapComponent", () => ({
    default: vi.fn(() => ({
      type: "div",
      props: { "data-testid": "map-component" },
      children: "Map Component",
    })),
  }));

  // Mock pour window.matchMedia (utilisé par use-mobile)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
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
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  // Mock pour sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });

  // Mock pour console methods
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});

  resetRouterMock();
});

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
