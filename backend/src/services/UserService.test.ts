import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { ConflictError } from '../utils/errors';
import { User } from '../entities/User';

// Mock du UserRepository
jest.mock('../repositories/UserRepository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();

    // Obtenir l'instance mockée
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;

    // Créer le service avec le repository mocké
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser: User = {
        id: 1,
        ...userData,
        password: 'hashedPassword',
        isActive: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Mock bcrypt.hash
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await userService.createUser(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcryptHashSpy).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashedPassword',
      });
      expect(result).toEqual(mockUser);

      bcryptHashSpy.mockRestore();
    });

    it('should throw ConflictError if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const existingUser: User = {
        id: 1,
        email: userData.email,
        password: 'hashedpass',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
      };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'user1@example.com',
          password: 'pass1',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshTokens: [],
        },
        {
          id: 2,
          email: 'user2@example.com',
          password: 'pass2',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshTokens: [],
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser: User = {
        id: 1,
        email: 'user@example.com',
        password: 'pass',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });
});
