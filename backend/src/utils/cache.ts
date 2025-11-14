import redisManager, { cacheKeys, cacheTTL } from '../config/redis';
import { logDebug } from '../config/logger';

/**
 * Service de cache utilisant Redis pour améliorer les performances
 */

export class CacheService {
  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisManager.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        logDebug('Cache hit', { key });
        return parsed;
      }
      logDebug('Cache miss', { key });
      return null;
    } catch (error) {
      logDebug('Cache get error', { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const success = await redisManager.set(key, serialized, ttl);
      if (success) {
        logDebug('Cache set', { key, ttl });
      }
      return success;
    } catch (error) {
      logDebug('Cache set error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Supprime une clé du cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const success = await redisManager.del(key);
      if (success) {
        logDebug('Cache delete', { key });
      }
      return success;
    } catch (error) {
      logDebug('Cache delete error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await redisManager.exists(key);
    } catch (error) {
      logDebug('Cache exists error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redisManager.keys(pattern);
      if (keys.length > 0) {
        let deletedCount = 0;
        for (const key of keys) {
          if (await redisManager.del(key)) {
            deletedCount++;
          }
        }
        logDebug('Cache delete pattern', { pattern, deletedCount });
        return deletedCount;
      }
      return 0;
    } catch (error) {
      logDebug('Cache delete pattern error', { pattern, error: (error as Error).message });
      return 0;
    }
  }

  /**
   * Invalide le cache des utilisateurs
   */
  async invalidateUserCache(userId?: number): Promise<void> {
    const patterns = ['users:*'];
    if (userId) {
      patterns.push(`user:${userId}`);
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalide le cache des produits
   */
  async invalidateProductCache(productId?: number): Promise<void> {
    const patterns = ['products:*'];
    if (productId) {
      patterns.push(`product:${productId}`);
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalide le cache des réservations
   */
  async invalidateOrderCache(orderId?: number): Promise<void> {
    const patterns = ['orders:*'];
    if (orderId) {
      patterns.push(`order:${orderId}`);
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalide le cache des contacts
   */
  async invalidateContactCache(contactId?: number): Promise<void> {
    const patterns = ['contacts:*'];
    if (contactId) {
      patterns.push(`contact:${contactId}`);
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalide tout le cache
   */
  async invalidateAllCache(): Promise<void> {
    try {
      const keys = await redisManager.keys('*');
      if (keys.length > 0) {
        for (const key of keys) {
          await redisManager.del(key);
        }
        logDebug('All cache invalidated', { deletedKeys: keys.length });
      }
    } catch (error) {
      logDebug('Invalidate all cache error', { error: (error as Error).message });
    }
  }

  /**
   * Récupère ou définit une valeur avec cache
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si pas en cache, récupérer et mettre en cache
    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Wrapper pour les méthodes de service avec cache
   */
  cachedMethod<T extends unknown[], R>(
    method: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string,
    ttl?: number
  ) {
    return async (...args: T): Promise<R> => {
      const cacheKey = keyGenerator(...args);
      return this.getOrSet(cacheKey, () => method(...args), ttl);
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

export default cacheService;

// Re-export cache keys and TTL from redis config
export { cacheKeys, cacheTTL } from '../config/redis';
