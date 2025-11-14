import { createClient, RedisClientType } from 'redis';
import { logInfo, logWarn } from './logger';

/**
 * Configuration Redis pour le cache et les sessions
 * Redis est complètement optionnel et ne génère aucune erreur quand désactivé
 */

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private isEnabled: boolean = false;

  constructor() {
    // Redis n'est activé que si explicitement demandé
    this.isEnabled = process.env.REDIS_ENABLED === 'true';
    
    if (this.isEnabled) {
      this.initializeRedisClient();
    } else {
      logInfo('Redis cache disabled - set REDIS_ENABLED=true to enable');
    }
  }

  private initializeRedisClient(): void {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false, // Pas de reconnexion automatique
        },
      });

      this.setupEventHandlers();
    } catch (error) {
      logWarn('Failed to initialize Redis client', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      this.isEnabled = false;
      this.client = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      logWarn('Redis connection error - disabling cache', { error: err.message });
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logInfo('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logInfo('Redis ready');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      logInfo('Redis disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return; // Sortie silencieuse si Redis désactivé
    }

    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
    } catch (error) {
      logWarn('Redis connection failed - continuing without cache', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.disconnect();
    } catch (error) {
      logWarn('Redis disconnection error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      this.isConnected = false;
    }
  }

  // Opérations de cache - retournent des valeurs par défaut si Redis indisponible
  async get(key: string): Promise<string | null> {
    if (!this.isEnabled || !this.client || !this.isConnected) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      return null; // Échec silencieux
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.isEnabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      return false; // Échec silencieux
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      return false; // Échec silencieux
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      return false; // Échec silencieux
    }
  }

  async flushAll(): Promise<boolean> {
    if (!this.isEnabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      return false; // Échec silencieux
    }
  }

  // Méthodes utilitaires JSON
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return null; // Échec silencieux pour JSON invalide
    }
  }

  async setJSON<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      return false; // Échec silencieux
    }
  }

  // Méthodes d'état
  isRedisConnected(): boolean {
    return this.isEnabled && this.isConnected;
  }

  isRedisEnabled(): boolean {
    return this.isEnabled;
  }

  getClient(): RedisClientType | null {
    return this.isEnabled ? this.client : null;
  }
}

// Export singleton
const redisManager = new RedisManager();
export default redisManager;
