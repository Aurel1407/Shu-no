import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../entities/Product';
import { CreateProductDto, UpdateProductDto } from '../dtos/ProductDto';
import { PaginationParams, PaginatedResponse, PaginationHelper } from '../utils/pagination';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async getProductByIdAdmin(id: number): Promise<Product | null> {
    return await this.productRepository.findByIdAdmin(id);
  }

  async getProductsByLocation(location: string): Promise<Product[]> {
    return await this.productRepository.findByLocation(location);
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    return await this.productRepository.create(productData);
  }

  async updateProduct(id: number, productData: UpdateProductDto): Promise<Product> {
    return await this.productRepository.update(id, productData);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return await this.productRepository.delete(id);
  }

  async getAllProductsAdmin(): Promise<Product[]> {
    return await this.productRepository.findAllAdmin();
  }

  async getProductsPaginated(queryParams: unknown): Promise<PaginatedResponse<Product>> {
    const params = PaginationHelper.parseParams(queryParams);
    return await this.productRepository.findAllPaginated(params);
  }

  async getProductsPaginatedAdmin(queryParams: unknown): Promise<PaginatedResponse<Product>> {
    const params = PaginationHelper.parseParams(queryParams);
    return await this.productRepository.findAllPaginatedAdmin(params);
  }
}
