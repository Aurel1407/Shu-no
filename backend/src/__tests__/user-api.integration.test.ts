import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { UserController } from '../controllers/UserController';
import { AuthController } from '../controllers/AuthController';

describe('User API Integration Tests', () => {
  let mockUserService: any;
  let mockRefreshTokenService: any;
  let userController: UserController;
  let authController: AuthController;

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();

    // Mock du service
    mockUserService = {
      getAllUsers: jest.fn(),
      getUsersPaginated: jest.fn(),
      getUserById: jest.fn(),
      getUserByIdAdmin: jest.fn(),
      createUser: jest.fn(),
      login: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    mockRefreshTokenService = {
      generateRefreshToken: jest.fn(async () => ({ token: 'refresh-token' })),
      limitUserTokens: jest.fn(),
      validateRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      rotateRefreshToken: jest.fn(),
      getUserActiveTokens: jest.fn(async () => []),
    };

    // Créer les contrôleurs avec les services mockés injectés
    userController = new UserController(mockUserService);
    authController = new AuthController(mockUserService, mockRefreshTokenService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('UserController Integration', () => {
    it('should call login on service with correct credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockAuthResponse = { user: { id: 1, email: 'test@example.com', role: 'user', password: 'hashed' }, token: 'jwt-token' };
      mockUserService.login.mockResolvedValue(mockAuthResponse);

      const mockReq = {
        body: loginData,
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('jest-integration-test'),
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

  await (authController.login as any)(mockReq as any, mockRes as any, mockNext);
  await Promise.resolve();

      expect(mockUserService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockAuthResponse.user.id,
            email: mockAuthResponse.user.email,
            role: mockAuthResponse.user.role,
          },
          accessToken: mockAuthResponse.token,
          refreshToken: 'refresh-token',
        },
        message: 'Connexion réussie',
      });
    });

    it('should call registerUser on service with correct data', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      const mockUser = { id: 1, ...registerData };
      mockUserService.createUser.mockResolvedValue(mockUser);

      const mockReq = { body: registerData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

  await (userController.createUser as any)(mockReq as any, mockRes as any, mockNext);

      expect(mockUserService.createUser).toHaveBeenCalledWith(registerData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, email: 'newuser@example.com', firstName: 'John', lastName: 'Doe' },
        message: 'Utilisateur créé avec succès',
      });
    });

    it('should call getUserById on service with correct id', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const mockReq = { params: { id: '1' } };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

  await (userController.getUserById as any)(mockReq as any, mockRes as any, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should call updateUser on service with correct id and data', async () => {
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      const mockUpdatedUser = { id: 1, email: 'test@example.com', ...updateData };
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      const mockReq = { 
        params: { id: '1' }, 
        body: updateData,
        user: { id: 1, role: 'admin' } // Mock user for auth check
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

  await (userController.updateUser as any)(mockReq as any, mockRes as any, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedUser,
        message: 'Utilisateur mis à jour avec succès',
      });
    });

    it('should call deleteUser on service with correct id', async () => {
      mockUserService.deleteUser.mockResolvedValue(true);

      const mockReq = { 
        params: { id: '1' },
        user: { id: 2, role: 'admin' } // Different user to avoid self-deletion check
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

  await (userController.deleteUser as any)(mockReq as any, mockRes as any, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    });

    it('should call getAllUsers on service for admin', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' }
      ];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

  await (userController.getAllUsers as any)(mockReq as any, mockRes as any, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        count: 2,
      });
    });
  });
});
