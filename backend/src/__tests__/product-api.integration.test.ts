import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';

// Mock du ProductService
jest.mock('../services/ProductService');

describe('Product API Integration Tests', () => {
  let mockProductService: any;
  let productController: ProductController;

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();

    // Mock du service
    mockProductService = {
      getAllProducts: jest.fn(),
      getProductById: jest.fn(),
      getProductByIdAdmin: jest.fn(),
      getProductsByLocation: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      getAllProductsAdmin: jest.fn(),
      getProductsPaginated: jest.fn(),
      getProductsPaginatedAdmin: jest.fn(),
    };

    (ProductService as jest.Mock).mockImplementation(() => mockProductService);

    // Créer le contrôleur
    productController = new ProductController();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('ProductController Integration', () => {
    it('should initialize with ProductService', () => {
      expect(productController).toBeDefined();
      expect(ProductService).toHaveBeenCalledTimes(1);
    });

    it('should call getAllProducts on service when controller method is called', async () => {
      const mockProducts = [{ id: 1, name: 'Test Product' }];
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      // Mock request/response objects
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await productController.getAllProducts(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        count: 1,
      });
    });

    it('should call getProductById on service with correct id', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      const mockReq = { params: { id: '1' } };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await productController.getProductById(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('should call createProduct on service with correct data', async () => {
      const createData = { name: 'New Product', price: 100 };
      const mockCreatedProduct = { id: 1, ...createData };
      mockProductService.createProduct.mockResolvedValue(mockCreatedProduct);

      const mockReq = { body: createData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      await productController.createProduct(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.createProduct).toHaveBeenCalledWith(createData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedProduct,
        message: 'Produit créé avec succès',
      });
    });

    it('should call updateProduct on service with correct id and data', async () => {
      const updateData = { name: 'Updated Product' };
      const mockUpdatedProduct = { id: 1, ...updateData };
      mockProductService.updateProduct.mockResolvedValue(mockUpdatedProduct);

      const mockReq = { params: { id: '1' }, body: updateData };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await productController.updateProduct(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, updateData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedProduct,
        message: 'Produit mis à jour avec succès',
      });
    });

    it('should call deleteProduct on service with correct id', async () => {
      mockProductService.deleteProduct.mockResolvedValue(true);

      const mockReq = { params: { id: '1' } };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await productController.deleteProduct(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès',
      });
    });

    it('should call getProductsPaginated on service with query params', async () => {
      const mockPaginatedResponse = {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockProductService.getProductsPaginated.mockResolvedValue(mockPaginatedResponse);

      const mockReq = { query: { page: '1', limit: '10' } };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await productController.getProductsPaginated(mockReq as any, mockRes as any, mockNext);

      expect(mockProductService.getProductsPaginated).toHaveBeenCalledWith({ page: '1', limit: '10' });
      expect(mockRes.json).toHaveBeenCalledWith(mockPaginatedResponse);
    });
  });
});
