import { vi } from "vitest";
import type { Location } from "react-router-dom";

type RouterMockConfig = {
  navigate?: ReturnType<typeof vi.fn>;
  location?: Partial<Location> & { pathname: string };
  params?: Record<string, string | undefined>;
  searchParams?: URLSearchParams;
  setSearchParams?: ReturnType<typeof vi.fn>;
};

type RouterMockState = Required<RouterMockConfig>;

const createDefaultLocation = (): Location => ({
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "default",
});

const state: RouterMockState = {
  navigate: vi.fn(),
  location: createDefaultLocation(),
  params: {},
  searchParams: new URLSearchParams(),
  setSearchParams: vi.fn(),
};

export const buildRouterMocks = () => ({
  useNavigate: () => state.navigate,
  useLocation: () => state.location,
  useParams: () => state.params,
  useSearchParams: () => [state.searchParams, state.setSearchParams] as const,
});

export const configureRouterMock = (config: RouterMockConfig = {}) => {
  if (config.navigate) {
    state.navigate = config.navigate;
  }

  if (config.location) {
    state.location = {
      ...createDefaultLocation(),
      ...config.location,
    };
  }

  if (config.params) {
    state.params = config.params;
  }

  if (config.searchParams) {
    state.searchParams = config.searchParams;
  }

  if (config.setSearchParams) {
    state.setSearchParams = config.setSearchParams;
  }
};

export const resetRouterMock = () => {
  state.navigate = vi.fn();
  state.location = createDefaultLocation();
  state.params = {};
  state.searchParams = new URLSearchParams();
  state.setSearchParams = vi.fn();
};
