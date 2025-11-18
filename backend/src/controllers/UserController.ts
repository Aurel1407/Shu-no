import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, UpdateUserDto } from '../dtos/UserDto';
import { asyncHandler } from '../middleware/errorHandler';

interface UserWithPassword {
  password?: string;
  [key: string]: unknown;
}

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class UserController {
  private readonly userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  // Utilitaire pour supprimer le mot de passe des réponses
  private removePassword(user: UserWithPassword): Omit<UserWithPassword, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private removePasswordFromArray(users: UserWithPassword[]): Omit<UserWithPassword, 'password'>[] {
    return users.map(user => this.removePassword(user));
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.getAllUsers();
    res.json({
      success: true,
      data: this.removePasswordFromArray(users as unknown as UserWithPassword[]),
      count: users.length
    });
  });

  getUsersPaginated = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Pagination logic here - simplified for now
    const users = await this.userService.getAllUsers();
    res.json({
      success: true,
      data: this.removePasswordFromArray(users),
      count: users.length
    });
  });

  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const user = await this.userService.getUserById(id);

    res.json({
      success: true,
      data: this.removePassword(user)
    });
  });

  getUserByIdAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const user = await this.userService.getUserByIdAdmin(id);

    res.json({
      success: true,
      data: this.removePassword(user)
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
      return;
    }
    const user = await this.userService.getUserById(userId);

    res.json({
      success: true,
      data: this.removePassword(user as unknown as UserWithPassword)
    });
  });

  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const user = await this.userService.createUser(userData);
    
    res.status(201).json({
      success: true,
      data: this.removePassword(user as unknown as UserWithPassword),
      message: 'Utilisateur créé avec succès'
    });
  });

  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const userData: UpdateUserDto = req.body;
    const currentUser = (req as AuthRequest).user;

    // Vérifier les permissions : seul l'admin ou l'utilisateur lui-même peut se modifier
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé : vous ne pouvez modifier que votre propre profil'
      });
      return;
    }

    const user = await this.userService.updateUser(id, userData);
    
    res.json({
      success: true,
      data: this.removePassword(user as unknown as UserWithPassword),
      message: 'Utilisateur mis à jour avec succès'
    });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const currentUser = (req as AuthRequest).user;

    // Empêcher l'admin de se supprimer lui-même
    if (currentUser?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
      return;
    }

    const success = await this.userService.deleteUser(id);
    
    res.json({
      success,
      message: success ? 'Utilisateur supprimé avec succès' : 'Échec de la suppression'
    });
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
      return;
    }
    const user = await this.userService.getUserById(userId);

    res.json({
      success: true,
      data: this.removePassword(user as unknown as UserWithPassword)
    });
  });
}
