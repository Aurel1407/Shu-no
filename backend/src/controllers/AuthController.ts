import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { UserService } from '../services/UserService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { LoginUserDto } from '../dtos/UserDto';
import { RefreshTokenDto, RevokeTokenDto } from '../dtos/RefreshTokenDto';
import jwt from 'jsonwebtoken';

export class AuthController {
  private readonly userService: UserService;
  private readonly refreshTokenService: RefreshTokenService;

  constructor(
    userService: UserService = new UserService(),
    refreshTokenService: RefreshTokenService = new RefreshTokenService()
  ) {
    this.userService = userService;
    this.refreshTokenService = refreshTokenService;
  }

  private sanitizeUser(user: any) {
    if (!user) {
      return user;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loginData: LoginUserDto = req.body;
    const result = await this.userService.login(loginData);

    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      result.user.id,
      ipAddress,
      userAgent
    );

    await this.refreshTokenService.limitUserTokens(result.user.id, 5);

    res.json({
      success: true,
      data: {
        user: this.sanitizeUser(result.user),
        accessToken: result.token,
        refreshToken: refreshToken.token,
      },
      message: 'Connexion réussie',
    });
  });

  refreshAccessToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenDto = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token requis',
      });
      return;
    }

    const validRefreshToken = await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!validRefreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré',
      });
      return;
    }

    const user = validRefreshToken.user;
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: this.sanitizeUser(user),
      },
      message: 'Access token renouvelé avec succès',
    });
  });

  revokeRefreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token }: RevokeTokenDto = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token requis',
      });
      return;
    }

    const success = await this.refreshTokenService.revokeRefreshToken(token);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Token non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Token révoqué avec succès',
    });
  });

  revokeAllRefreshTokens = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;

    await this.refreshTokenService.revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: 'Tous les tokens ont été révoqués avec succès',
    });
  });

  rotateRefreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenDto = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token requis',
      });
      return;
    }

    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(
      refreshToken,
      ipAddress,
      userAgent
    );

    if (!newRefreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        refreshToken: newRefreshToken.token,
      },
      message: 'Refresh token renouvelé avec succès',
    });
  });

  getActiveTokens = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;

    const activeTokens = await this.refreshTokenService.getUserActiveTokens(userId);

    const tokenInfos = activeTokens.map(token => ({
      id: token.id,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      ipAddress: token.ipAddress,
      userAgent: token.userAgent,
      tokenPreview: token.token.substring(0, 8) + '...',
    }));

    res.json({
      success: true,
      data: tokenInfos,
      count: tokenInfos.length,
      message: 'Tokens actifs récupérés avec succès',
    });
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenDto = req.body;

    if (refreshToken) {
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  });
}
