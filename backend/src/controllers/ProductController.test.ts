import { Request, Response, NextFunction } from 'express';
import { ProductController } from './ProductController';
import { ProductService } from '../services/ProductService';
import { Product } from '../entities/Product';

// Mock ProductService
jest.mock('../services/ProductService');

describe('ProductController', () => {
  let productController: ProductController;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Créer les mocks pour Request et Response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      params: {},
      body: {},
      query: {}
    };
    
    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;
    
    mockNext = jest.fn();

    // Créer le contrôleur avec le service mocké
    productController = new ProductController();
    mockProductService = new ProductService() as jest.Mocked<ProductService>;
    (productController as any).productService = mockProductService;
  });

  describe('getAllProducts', () => {
    it('should return all products successfully', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Gîte Les Pins',
          description: 'Charmant gîte en Bretagne',
          location: 'Bretagne',
          price: 80,
          address: '123 Rue des Pins',
          city: 'Quimper',
          postalCode: '29000',
          maxGuests: 4,
          isActive: true,
          pricePeriods: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        count: 1
      });
    });
  });

  describe('getProductById', () => {
    it('should return a product by id successfully', async () => {
      const mockProduct: Product = {
        id: 1,
        name: 'Gîte Les Pins',
        description: 'Charmant gîte en Bretagne',
        location: 'Bretagne',
        price: 80,
        address: '123 Rue des Pins',
        city: 'Quimper',
        postalCode: '29000',
        maxGuests: 4,
        isActive: true,
        pricePeriods: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.getProductById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });
  });
});
