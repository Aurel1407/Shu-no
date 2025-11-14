import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dtos/UserDto';
import { ConflictError, AuthenticationError, NotFoundError, ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse, PaginationHelper } from '../utils/pagination';
import { cacheService, cacheKeys, cacheTTL } from '../utils/cache';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const cacheKey = cacheKeys.users(params.page, params.limit, params.search, params.sortBy, params.sortOrder);

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const { users, total } = await this.userRepository.findAllPaginated(params);
        return PaginationHelper.formatResponse(users, total, params);
      },
      cacheTTL.users
    );
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByIdAdmin(id: number): Promise<User | null> {
    return await this.userRepository.findByIdAdmin(id);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Un utilisateur avec cet email existe déjà', { email: userData.email });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Invalider le cache des utilisateurs
    await cacheService.invalidateUserCache();

    return user;
  }

  async login(loginData: LoginUserDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new AuthenticationError('Email ou mot de passe incorrect', { email: loginData.email });
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email ou mot de passe incorrect', { email: loginData.email });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new AuthenticationError('Compte utilisateur désactivé', { userId: user.id });
    }

    // Vérifier la configuration JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ValidationError('Configuration JWT manquante');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Utilisateur', { userId: id });
    }

    const updatedUser = await this.userRepository.update(id, userData);

    // Invalider le cache des utilisateurs et de cet utilisateur spécifique
    await cacheService.invalidateUserCache(id);

    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Utilisateur', { userId: id });
    }

    const result = await this.userRepository.delete(id);

    // Invalider le cache des utilisateurs et de cet utilisateur spécifique
    await cacheService.invalidateUserCache(id);

    return result;
  }
}
