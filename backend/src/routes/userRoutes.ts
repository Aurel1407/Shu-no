import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateDto, validateParams, paramValidators } from '../middleware/dtoValidation';
import { CreateUserDto, UpdateUserDto } from '../dtos/UserDto';

const router = Router();
const userController = new UserController();

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// GET /api/users/paginated (Admin only)
router.get('/paginated', authenticateToken, requireAdmin, userController.getUsersPaginated);

// GET /api/users/admin/:id (Admin only)
router.get('/admin/:id', 
  authenticateToken,
  requireAdmin,
  validateParams({ id: paramValidators.id }),
  userController.getUserByIdAdmin
);

// GET /api/users/profile (Authenticated users)
router.get('/profile', authenticateToken, userController.getProfile);

// POST /api/users (Création d'utilisateur - Public)
router.post('/', 
  validateDto(CreateUserDto),
  userController.createUser
);

// PUT /api/users/:id (Authenticated users)
router.put('/:id', 
  authenticateToken,
  validateParams({ id: paramValidators.id }),
  validateDto(UpdateUserDto),
  userController.updateUser
);

// DELETE /api/users/:id (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validateParams({ id: paramValidators.id }),
  userController.deleteUser
);

export default router;
