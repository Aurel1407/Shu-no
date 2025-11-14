import { AppDataSource } from '../config/database';
import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';
import crypto from 'crypto';
import { Repository } from 'typeorm';

export class RefreshTokenService {
  private refreshTokenRepository: Repository<RefreshToken>;
  private userRepository: Repository<User>;

  constructor() {
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Génère un nouveau refresh token pour un utilisateur
   */
  async generateRefreshToken(
    userId: number, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<RefreshToken> {
    // Génère un token sécurisé
    const token = crypto.randomBytes(64).toString('hex');
    
    // Définit la date d'expiration (30 jours par défaut)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Valide un refresh token
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * Révoque un refresh token
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      return false;
    }

    refreshToken.revoke();
    await this.refreshTokenRepository.save(refreshToken);
    return true;
  }

  /**
   * Révoque tous les refresh tokens d'un utilisateur
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ 
        isRevoked: true, 
        revokedAt: new Date() 
      })
      .where('userId = :userId AND isRevoked = false', { userId })
      .execute();
  }

  /**
   * Supprime les refresh tokens expirés
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('expiresAt < :now OR isRevoked = true', { 
        now: new Date() 
      })
      .execute();
  }

  /**
   * Récupère tous les refresh tokens actifs d'un utilisateur
   */
  async getUserActiveTokens(userId: number): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({
      where: { 
        userId, 
        isRevoked: false 
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Compte le nombre de tokens actifs pour un utilisateur
   */
  async countUserActiveTokens(userId: number): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: { 
        userId, 
        isRevoked: false 
      },
    });
  }

  /**
   * Limite le nombre de tokens actifs par utilisateur
   */
  async limitUserTokens(userId: number, maxTokens: number = 5): Promise<void> {
    const activeTokens = await this.getUserActiveTokens(userId);
    
    if (activeTokens.length >= maxTokens) {
      // Révoque les plus anciens tokens
      const tokensToRevoke = activeTokens.slice(maxTokens - 1);
      
      for (const token of tokensToRevoke) {
        token.revoke();
        await this.refreshTokenRepository.save(token);
      }
    }
  }

  /**
   * Rotation des refresh tokens (révoque l'ancien et crée un nouveau)
   */
  async rotateRefreshToken(
    oldToken: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<RefreshToken | null> {
    const oldRefreshToken = await this.validateRefreshToken(oldToken);
    
    if (!oldRefreshToken) {
      return null;
    }

    // Révoque l'ancien token
    await this.revokeRefreshToken(oldToken);
    
    // Génère un nouveau token
    return await this.generateRefreshToken(
      oldRefreshToken.userId, 
      ipAddress, 
      userAgent
    );
  }
}
