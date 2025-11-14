import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { validateDto } from '../middleware/dtoValidation';
import { LoginUserDto } from '../dtos/UserDto';
import { RefreshTokenDto, RevokeTokenDto } from '../dtos/RefreshTokenDto';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login (Public)
router.post(
  '/login',
  validateDto(LoginUserDto),
  authController.login
);

// POST /api/auth/refresh-token (Public)
router.post(
  '/refresh-token',
  validateDto(RefreshTokenDto),
  authController.refreshAccessToken
);

// POST /api/auth/revoke-token (Public)
router.post(
  '/revoke-token',
  validateDto(RevokeTokenDto),
  authController.revokeRefreshToken
);

// POST /api/auth/revoke-all-tokens (Authenticated users)
router.post(
  '/revoke-all-tokens',
  authenticateToken,
  authController.revokeAllRefreshTokens
);

// POST /api/auth/rotate-token (Public)
router.post(
  '/rotate-token',
  validateDto(RefreshTokenDto),
  authController.rotateRefreshToken
);

// GET /api/auth/active-tokens (Authenticated users)
router.get(
  '/active-tokens',
  authenticateToken,
  authController.getActiveTokens
);

// POST /api/auth/logout (Public)
router.post(
  '/logout',
  validateDto(RefreshTokenDto),
  authController.logout
);

// GET /api/auth/csrf-token
router.get('/csrf-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token CSRF récupéré',
    data: {
      csrfToken: (req as any).csrfToken
    }
  });
});

export default router;
