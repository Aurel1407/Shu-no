import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AuthController } from './AuthController';
import { UserService } from '../services/UserService';
import { RefreshTokenService } from '../services/RefreshTokenService';

jest.mock('../services/UserService');
jest.mock('../services/RefreshTokenService');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'new-jwt-token'),
}));

describe('AuthController', () => {
  let authController: AuthController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRefreshTokenService: jest.Mocked<RefreshTokenService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserService = new UserService() as jest.Mocked<UserService>;
    mockRefreshTokenService = new RefreshTokenService() as jest.Mocked<RefreshTokenService>;

  mockRefreshTokenService.generateRefreshToken.mockResolvedValue({ token: 'refresh-token' } as any);
  mockRefreshTokenService.limitUserTokens.mockResolvedValue();
  mockRefreshTokenService.validateRefreshToken.mockResolvedValue(null);
  mockRefreshTokenService.revokeRefreshToken.mockResolvedValue(true);
  mockRefreshTokenService.revokeAllUserTokens.mockResolvedValue();
  mockRefreshTokenService.rotateRefreshToken.mockResolvedValue(null);
  mockRefreshTokenService.getUserActiveTokens.mockResolvedValue([] as any);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      json: jsonMock as any,
      status: statusMock as any,
    } as Partial<Response>;

    mockNext = jest.fn();
    mockRequest = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-agent')
    } as Partial<Request>;

    authController = new AuthController(mockUserService, mockRefreshTokenService);
  });

  describe('login', () => {
    it('should authenticate user and return tokens', async () => {
      mockRequest.body = {
        email: 'user@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        role: 'user',
        password: 'hashed',
      } as any;

      mockUserService.login.mockResolvedValue({
        user: mockUser,
        token: 'access-token',
      });

  await (authController.login as any)(mockRequest as Request, mockResponse as Response, mockNext);
  await Promise.resolve();

      expect(mockUserService.login).toHaveBeenCalledWith(mockRequest.body);
      expect(mockRefreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        '127.0.0.1',
        'jest-agent'
      );
      expect(mockNext).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        message: 'Connexion réussie',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh the access token when refresh token is valid', async () => {
      mockRequest.body = {
        refreshToken: 'valid-refresh-token',
      };

      const mockUser = {
        id: 2,
        email: 'other@example.com',
        role: 'admin',
        password: 'hashed',
      } as any;

      mockRefreshTokenService.validateRefreshToken.mockResolvedValue({
        user: mockUser,
      } as any);

  await (authController.refreshAccessToken as any)(mockRequest as Request, mockResponse as Response, mockNext);
  await Promise.resolve();

      expect(mockRefreshTokenService.validateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          accessToken: 'new-jwt-token',
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
        },
        message: 'Access token renouvelé avec succès',
      });
    });

    it('should return 401 when refresh token invalid', async () => {
      mockRequest.body = {
        refreshToken: 'invalid-token',
      };

      mockRefreshTokenService.validateRefreshToken.mockResolvedValue(null);

  await (authController.refreshAccessToken as any)(mockRequest as Request, mockResponse as Response, mockNext);
  await Promise.resolve();

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token invalide ou expiré',
      });
    });
  });
});
