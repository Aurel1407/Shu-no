import { Repository } from 'typeorm';
import { Order } from '../entities/Order';
import { AppDataSource } from '../config/database';
import { PaginationParams, PaginatedResponse } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

export class OrderRepository {
  private repository: Repository<Order>;

  constructor() {
    this.repository = AppDataSource.getRepository(Order);
  }

  async findAll(): Promise<Order[]> {
    return await this.repository.find({
      relations: ['user', 'product']
    });
  }

  async findById(id: number): Promise<Order | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'product']
    });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.repository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product']
    });
  }

  async findByProductId(productId: number): Promise<Order[]> {
    return await this.repository.find({
      where: { product: { id: productId } },
      relations: ['user', 'product']
    });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.repository.create(orderData);
    return await this.repository.save(order);
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order> {
    await this.repository.update(id, orderData);
    const updatedOrder = await this.findById(id);
    if (!updatedOrder) {
      throw new NotFoundError('Réservation', { orderId: id });
    }
    return updatedOrder;
  }

  async findByStatus(status: string): Promise<Order[]> {
    return await this.repository.find({
      where: { status },
      relations: ['user', 'product']
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllPaginated(params: PaginationParams): Promise<PaginatedResponse<Order>> {
    const queryBuilder = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.product', 'product');

    // Apply search if provided
    if (params.search) {
      queryBuilder.andWhere(
        '(order.status ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search OR product.title ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'status', 'totalAmount', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    queryBuilder.orderBy(`order.${sortField}`, params.sortOrder || 'DESC');

    // Get total count before applying pagination
    const total = await queryBuilder.getCount();

    // Calculate offset
    const offset = (params.page - 1) * params.limit;

    // Apply pagination
    queryBuilder.skip(offset).take(params.limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      success: true,
      data,
      pagination: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        totalItems: total,
        itemsPerPage: params.limit,
        hasNextPage: params.page < Math.ceil(total / params.limit),
        hasPreviousPage: params.page > 1
      }
    };
  }

  async findByUserIdPaginated(userId: number, params: PaginationParams): Promise<PaginatedResponse<Order>> {
    const queryBuilder = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.user = :userId', { userId });

    // Apply search if provided
    if (params.search) {
      queryBuilder.andWhere(
        '(order.status ILIKE :search OR product.title ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'status', 'totalAmount', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    queryBuilder.orderBy(`order.${sortField}`, params.sortOrder || 'DESC');

    // Get total count before applying pagination
    const total = await queryBuilder.getCount();

    // Calculate offset
    const offset = (params.page - 1) * params.limit;

    // Apply pagination
    queryBuilder.skip(offset).take(params.limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      success: true,
      data,
      pagination: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        totalItems: total,
        itemsPerPage: params.limit,
        hasNextPage: params.page < Math.ceil(total / params.limit),
        hasPreviousPage: params.page > 1
      }
    };
  }
}
