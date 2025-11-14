import { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import { Order } from '../entities/Order';
import { AppDataSource } from '../config/database';
import { PaginationParams, PaginatedResponse } from '../utils/pagination';
import { NotFoundError, ConflictError } from '../utils/errors';
import { cacheService, CacheKeys, CacheTTL } from '../services/CacheService';

export class ProductRepository {
  private repository: Repository<Product>;

  constructor() {
    this.repository = AppDataSource.getRepository(Product);
  }

  async findAll(): Promise<Product[]> {
    return cacheService.getOrSet(
      CacheKeys.PRODUCTS_ACTIVE,
      async () => {
        return await this.repository.find({ where: { isActive: true } });
      },
      CacheTTL.FIVE_MINUTES
    );
  }

  async findById(id: number): Promise<Product | null> {
    return cacheService.getOrSet(
      CacheKeys.PRODUCT_BY_ID(id),
      async () => {
        return await this.repository.findOneBy({ id, isActive: true });
      },
      CacheTTL.FIVE_MINUTES
    );
  }

  async findByIdAdmin(id: number): Promise<Product | null> {
    // Pas de cache pour les requêtes admin (données en temps réel)
    return await this.repository.findOneBy({ id });
  }

  async findByLocation(location: string): Promise<Product[]> {
    return await this.repository.find({
      where: { location, isActive: true }
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.repository.create(productData);
    const saved = await this.repository.save(product);
    
    // Invalider le cache des produits
    this.invalidateCache();
    
    return saved;
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.repository.update(id, productData);
    const updatedProduct = await this.findByIdAdmin(id);
    if (!updatedProduct) {
      throw new NotFoundError('Produit', { productId: id });
    }
    
    // Invalider le cache pour ce produit spécifique et la liste
    this.invalidateCache(id);
    
    return updatedProduct;
  }

  async delete(id: number): Promise<boolean> {
    // Check if product exists
    const product = await this.findByIdAdmin(id);
    if (!product) {
      throw new NotFoundError('Produit', { productId: id });
    }

    // Check if product has associated orders
    const orderRepository = AppDataSource.getRepository(Order);
    const orderCount = await orderRepository.count({ where: { product: { id } } });

    if (orderCount > 0) {
      throw new ConflictError('Impossible de supprimer un produit avec des réservations associées', { productId: id, orderCount });
    }

    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async findAllAdmin(): Promise<Product[]> {
    return await this.repository.find();
  }

  async findAllPaginated(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.repository.createQueryBuilder('product');

    // Apply search if provided
    if (params.search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.location ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // Apply active filter by default
    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });

    // Apply sorting
    const validSortFields = ['id', 'title', 'price', 'location', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, params.sortOrder || 'DESC');

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

  async findAllPaginatedAdmin(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.repository.createQueryBuilder('product');

    // Apply search if provided
    if (params.search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.location ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'title', 'price', 'location', 'isActive', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, params.sortOrder || 'DESC');

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

  /**
   * Invalider le cache des produits
   * @param productId ID du produit spécifique à invalider (optionnel)
   */
  private invalidateCache(productId?: number): void {
    // Invalider la liste des produits actifs
    cacheService.delete(CacheKeys.PRODUCTS_ACTIVE);
    
    // Invalider le produit spécifique si ID fourni
    if (productId) {
      cacheService.delete(CacheKeys.PRODUCT_BY_ID(productId));
    }
    
    // Invalider tous les caches de produits par pattern
    cacheService.deletePattern('products:*');
  }
}
