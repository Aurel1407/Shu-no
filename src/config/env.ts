// Configuration centralisée des variables d'environnement
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3002",

  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === "production",
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === "development",

  // Frontend Configuration
  FRONTEND_PORT: import.meta.env.VITE_FRONTEND_PORT || "8080",

  // Features Flags
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === "true",
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",

  // External Services (si nécessaire)
  EXTERNAL_API_KEY: import.meta.env.VITE_EXTERNAL_API_KEY || "",

  // Security
  CLIENT_SECRET: import.meta.env.VITE_CLIENT_SECRET || "",
};

// Validation des variables d'environnement critiques
export const validateEnvironment = () => {
  const requiredVars = ["VITE_API_BASE_URL"];

  const missingVars = requiredVars.filter((varName) => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.warn("⚠️ Variables d'environnement manquantes:", missingVars);
    console.warn("💡 Copiez .env.example vers .env et configurez les variables manquantes");
  }

  // Validation de l'URL de l'API
  if (!ENV_CONFIG.API_BASE_URL.startsWith("http")) {
    console.error(
      "❌ VITE_API_BASE_URL doit être une URL valide commençant par http:// ou https://"
    );
  }
};

// Fonction utilitaire pour obtenir une variable d'environnement avec valeur par défaut
export const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] || defaultValue;
};

// Fonction utilitaire pour obtenir une variable d'environnement booléenne
export const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
};

// Fonction utilitaire pour obtenir une variable d'environnement numérique
export const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};
