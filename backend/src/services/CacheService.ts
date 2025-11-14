/**
 * Service de cache en mémoire avec TTL (Time To Live)
 * Alternative légère à Redis pour les petits projets
 * 
 * Utilisation :
 * - Cache des propriétés (TTL: 5 minutes)
 * - Cache des prix par période (TTL: 1 heure)
 * - Cache des disponibilités (TTL: 1 minute)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private readonly cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes en millisecondes

  /**
   * Récupérer une valeur du cache
   * @param key Clé du cache
   * @returns La valeur ou null si expirée/inexistante
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée est expirée
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Définir une valeur dans le cache
   * @param key Clé du cache
   * @param data Données à stocker
   * @param ttl Durée de vie en millisecondes (optionnel)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Supprimer une clé du cache
   * @param key Clé à supprimer
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Supprimer plusieurs clés correspondant à un pattern
   * @param pattern Pattern de clé (ex: 'products:*')
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    let activeEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Nettoyer les entrées expirées (garbage collection)
   * À exécuter périodiquement
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Wrapper pour exécuter une fonction avec cache
   * @param key Clé du cache
   * @param fn Fonction à exécuter si cache manquant
   * @param ttl Durée de vie du cache
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Exécuter la fonction et mettre en cache
    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Singleton instance
export const cacheService = new CacheService();

/**
 * TTL constants (Time To Live)
 */
export const CacheTTL = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache keys patterns
 */
export const CacheKeys = {
  // Products
  PRODUCTS_ALL: 'products:all',
  PRODUCTS_ACTIVE: 'products:active',
  PRODUCT_BY_ID: (id: number) => `products:${id}`,
  PRODUCT_BY_LOCATION: (location: string) => `products:location:${location}`,
  
  // Price Periods
  PRICE_PERIODS_ALL: 'price-periods:all',
  PRICE_PERIOD_BY_ID: (id: number) => `price-periods:${id}`,
  PRICE_PERIODS_BY_PROPERTY: (propertyId: number) => `price-periods:property:${propertyId}`,
  
  // Bookings
  BOOKINGS_ALL: 'bookings:all',
  BOOKING_BY_ID: (id: number) => `bookings:${id}`,
  BOOKINGS_BY_USER: (userId: number) => `bookings:user:${userId}`,
  BOOKINGS_BY_PROPERTY: (propertyId: number) => `bookings:property:${propertyId}`,
  
  // Users
  USERS_ALL: 'users:all',
  USER_BY_ID: (id: number) => `users:${id}`,
  USER_BY_EMAIL: (email: string) => `users:email:${email}`,
  
  // Stats
  STATS_REVENUE: 'stats:revenue',
  STATS_OCCUPANCY: 'stats:occupancy',
} as const;

/**
 * Middleware pour nettoyer le cache périodiquement
 * À appeler dans un cron job ou au démarrage
 */
export function startCacheCleanup(intervalMs: number = 10 * 60 * 1000) {
  // Nettoyer toutes les 10 minutes par défaut
  setInterval(() => {
    const cleaned = cacheService.cleanup();
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired entries`);
    }
  }, intervalMs);
}

/**
 * Decorator pour mettre en cache une méthode
 * @param keyPrefix Préfixe de la clé de cache
 * @param ttl Durée de vie du cache
 */
export function Cacheable(keyPrefix: string, ttl: number = CacheTTL.FIVE_MINUTES) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Générer une clé unique basée sur les arguments
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;

      // Essayer de récupérer du cache
      const cached = cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Exécuter la méthode originale
      const result = await originalMethod.apply(this, args);

      // Mettre en cache
      cacheService.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

export default cacheService;
