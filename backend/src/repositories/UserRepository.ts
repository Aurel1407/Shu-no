import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { PaginationParams } from '../utils/pagination';
import { NotFoundError, DatabaseError } from '../utils/errors';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByIdAdmin(id: number): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundError('Utilisateur', { userId: id });
    }
    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Nouvelles méthodes pour la pagination
  async findAllPaginated(params: PaginationParams): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    // Recherche par email ou nom si fournie
    if (params.search) {
      queryBuilder.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${params.search}%` }
      );
    }

    // Tri
    if (params.sortBy && ['id', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt'].includes(params.sortBy)) {
      queryBuilder.orderBy(`user.${params.sortBy}`, params.sortOrder || 'ASC');
    } else {
      queryBuilder.orderBy('user.id', 'ASC');
    }

    // Pagination
    const offset = (params.page - 1) * params.limit;
    queryBuilder.skip(offset).take(params.limit);

    // Exécution
    const [users, total] = await queryBuilder.getManyAndCount();
    
    return { users, total };
  }

  async countAll(): Promise<number> {
    return await this.repository.count();
  }

  async countBySearch(search: string): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    queryBuilder.where(
      'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
      { search: `%${search}%` }
    );
    return await queryBuilder.getCount();
  }
}
