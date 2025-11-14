// Configuration centralisée des URLs d'API
import { ENV_CONFIG } from "./env";

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  ENDPOINTS: {
    AUTH: "/api/auth",
    PRODUCTS: "/api/products",
    USERS: "/api/users",
    ORDERS: "/api/orders",
    SETTINGS: "/api/settings",
    PRICE_PERIODS: "/api/price-periods",
    CONTACTS: "/api/contacts",
    HEALTH: "/api/health",
  },
};

// Fonction utilitaire pour obtenir l'URL complète de l'API
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction pour obtenir l'URL de base de l'API
export const getBaseApiUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// URLs pré-construites pour les endpoints les plus utilisés
export const API_URLS = {
  AUTH: getApiUrl(API_CONFIG.ENDPOINTS.AUTH),
  AUTH_LOGIN: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/login`),
  AUTH_REFRESH_TOKEN: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/refresh-token`),
  AUTH_LOGOUT: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/logout`),
  AUTH_ACTIVE_TOKENS: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/active-tokens`),
  AUTH_ROTATE_TOKEN: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/rotate-token`),
  AUTH_REVOKE_TOKEN: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/revoke-token`),
  AUTH_REVOKE_ALL_TOKENS: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/revoke-all-tokens`),
  PRODUCTS: getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS),
  PRODUCTS_ADMIN: getApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/admin`),
  USERS: getApiUrl(API_CONFIG.ENDPOINTS.USERS),
  USERS_LOGIN: getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH}/login`),
  USERS_PROFILE: getApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/profile`),
  ORDERS: getApiUrl(API_CONFIG.ENDPOINTS.ORDERS),
  ORDERS_MY_BOOKINGS: getApiUrl(`${API_CONFIG.ENDPOINTS.ORDERS}/my-bookings`),
  SETTINGS: getApiUrl(API_CONFIG.ENDPOINTS.SETTINGS),
  PRICE_PERIODS: getApiUrl(API_CONFIG.ENDPOINTS.PRICE_PERIODS),
  CONTACTS: getApiUrl(API_CONFIG.ENDPOINTS.CONTACTS),
  HEALTH: getApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
};
