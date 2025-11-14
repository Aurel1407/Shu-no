import cron from 'node-cron';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { logger } from '../config/logger';

export class ScheduledTasks {
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.refreshTokenService = new RefreshTokenService();
  }

  /**
   * Démarre toutes les tâches programmées
   */
  public startAll(): void {
    this.startTokenCleanup();
    logger.info('Tâches programmées démarrées');
  }

  /**
   * Nettoyage automatique des tokens expirés
   * Exécuté tous les jours à 02:00
   */
  private startTokenCleanup(): void {
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Début du nettoyage des refresh tokens expirés');
        await this.refreshTokenService.cleanupExpiredTokens();
        logger.info('Nettoyage des refresh tokens terminé avec succès');
      } catch (error) {
        logger.error('Erreur lors du nettoyage des refresh tokens:', error);
      }
    }, {
      timezone: "Europe/Paris"
    });

    logger.info('Tâche de nettoyage des tokens programmée (tous les jours à 02:00)');
  }

  /**
   * Arrête toutes les tâches programmées
   */
  public stopAll(): void {
    cron.getTasks().forEach(task => task.stop());
    logger.info('Toutes les tâches programmées ont été arrêtées');
  }
}
