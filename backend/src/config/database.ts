import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Order } from '../entities/Order';
import { PricePeriod } from '../entities/PricePeriod';
import { Contact } from '../entities/Contact';
import { RefreshToken } from '../entities/RefreshToken';
import { logger } from './logger';

// Validation des variables d'environnement
const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  
  // Configuration sécurisée pour la production
  synchronize: isDevelopment || isTest, // Synchronisation en développement et test
  logging: isDevelopment ? 'all' : ['error', 'warn'], // Logs limités en production
  
  // Entités
  entities: [User, Product, Order, PricePeriod, Contact, RefreshToken],
  
  // Migrations pour la production
  migrations: ['dist/migrations/*.js'],
  migrationsRun: isProduction, // Auto-run migrations en production
  
  // Subscribers
  subscribers: [],
  
  // Configuration de pool de connexions pour la production
  extra: {
    // Pool de connexions optimisé
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    
    // Timeout de connexion
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    
    // SSL en production
    ...(isProduction && {
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    })
  },
  
  // Configuration de cache pour les requêtes
  cache: isProduction ? {
    type: 'database',
    tableName: 'typeorm_cache',
    duration: 30000 // 30 secondes
  } : false
});

// Logger pour les événements de la base de données
AppDataSource.setOptions({
  logger: {
    logQuery: (query: string, parameters?: any[]) => {
      if (isDevelopment) {
        logger.debug('Database Query', { query, parameters });
      }
    },
    logQueryError: (error: string, query: string, parameters?: any[]) => {
      logger.error('Database Query Error', { error, query, parameters });
    },
    logQuerySlow: (time: number, query: string, parameters?: any[]) => {
      logger.warn('Slow Database Query', { time, query, parameters });
    },
    logSchemaBuild: (message: string) => {
      logger.info('Database Schema', { message });
    },
    logMigration: (message: string) => {
      logger.info('Database Migration', { message });
    },
    log: (level: 'log' | 'info' | 'warn', message: any) => {
      switch (level) {
        case 'warn':
          logger.warn('Database Warning', { message });
          break;
        case 'info':
        case 'log':
          logger.info('Database Info', { message });
          break;
      }
    }
  }
});
