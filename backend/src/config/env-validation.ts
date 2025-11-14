/**
 * Validation des variables d'environnement critiques
 * Ce fichier s'assure que toutes les variables nécessaires sont présentes au démarrage
 */

import { logInfo, logWarn } from './logger';

interface RequiredEnvVars {
  JWT_SECRET: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  NODE_ENV: string;
  PORT: string;
}

interface OptionalEnvVars {
  FRONTEND_URL?: string;
  MAX_FILE_SIZE?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  LOG_LEVEL?: string;
}

/**
 * Valide que toutes les variables d'environnement requises sont présentes
 * Lance une erreur explicite si une variable manque
 */
export function validateEnvironmentVariables(): RequiredEnvVars & OptionalEnvVars {
  const missing: string[] = [];
  
  // Variables obligatoires
  const required: (keyof RequiredEnvVars)[] = [
    'JWT_SECRET',
    'DB_HOST', 
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD', 
    'DB_NAME',
    'NODE_ENV',
    'PORT'
  ];

  // Vérification des variables obligatoires
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables d'environnement manquantes: ${missing.join(', ')}\n` +
      `📋 Copiez .env.example vers .env et remplissez les valeurs requises.\n` +
      `🔧 Variables requises: ${required.join(', ')}`
    );
  }

  // Validations spécifiques
  validateJWTSecret();
  validateDatabaseConfig();
  validatePortConfig();

  // Retourner la configuration validée
  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: process.env.DB_PORT!,
    DB_USERNAME: process.env.DB_USERNAME!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    NODE_ENV: process.env.NODE_ENV!,
    PORT: process.env.PORT!,
    FRONTEND_URL: process.env.FRONTEND_URL,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    LOG_LEVEL: process.env.LOG_LEVEL
  };
}

/**
 * Valide que le JWT_SECRET est suffisamment sécurisé
 */
function validateJWTSecret(): void {
  const jwtSecret = process.env.JWT_SECRET!;
  
  if (jwtSecret.length < 32) {
    throw new Error(
      `❌ JWT_SECRET trop court (${jwtSecret.length} caractères).\n` +
      `🔒 Minimum requis: 32 caractères pour la sécurité.\n` +
      `💡 Générez une clé sécurisée: openssl rand -base64 32`
    );
  }

  // Vérifier que ce n'est pas la valeur par défaut
  const defaultSecrets = [
    'your_super_secret_jwt_key_change_this_in_production',
    'your_very_long_and_secure_jwt_secret_key_here_change_in_production',
    'secret',
    'jwt_secret'
  ];

  if (defaultSecrets.includes(jwtSecret)) {
    throw new Error(
      `❌ JWT_SECRET utilise une valeur par défaut non sécurisée.\n` +
      `🔒 Générez une clé unique: openssl rand -base64 32\n` +
      `⚠️  JAMAIS en production avec une valeur par défaut !`
    );
  }
}

/**
 * Valide la configuration de la base de données
 */
function validateDatabaseConfig(): void {
  const dbPort = parseInt(process.env.DB_PORT!);
  
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error(
      `❌ DB_PORT invalide: ${process.env.DB_PORT}\n` +
      `📊 Doit être un nombre entre 1 et 65535.`
    );
  }

  // Vérification basique des credentials
  if (process.env.DB_PASSWORD === 'your_password_here') {
    logWarn(
      'DB_PASSWORD semble être une valeur par défaut. ' +
      'Assurez-vous d\'utiliser un mot de passe sécurisé en production.'
    );
  }
}

/**
 * Valide la configuration du port du serveur
 */
function validatePortConfig(): void {
  const port = parseInt(process.env.PORT!);
  
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `❌ PORT invalide: ${process.env.PORT}\n` +
      `📊 Doit être un nombre entre 1 et 65535.`
    );
  }
}

/**
 * Affiche un résumé de la configuration validée (sans les secrets)
 */
export function logEnvironmentSummary(): void {
  logInfo('🚀 Configuration environnement validée', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    FRONTEND_URL: process.env.FRONTEND_URL || 'non défini',
    JWT_SECRET_LENGTH: `${process.env.JWT_SECRET?.length} caractères`
  });
}
