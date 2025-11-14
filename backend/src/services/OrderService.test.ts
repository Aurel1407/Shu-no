import { OrderService } from './OrderService';
import { OrderRepository } from '../repositories/OrderRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { PricePeriodService } from './PricePeriodService';
import { NotFoundError, ValidationError } from '../utils/errors';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: jest.Mocked<OrderRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockPricePeriodService: jest.Mocked<PricePeriodService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Créer des mocks manuellement
    mockOrderRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByProductId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllPaginated: jest.fn(),
      findByUserIdPaginated: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockProductRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockPricePeriodService = {
      calculatePriceForDateRange: jest.fn(),
    } as any;

    // Créer le service et injecter les mocks
    orderService = new OrderService();
    (orderService as any).orderRepository = mockOrderRepository;
    (orderService as any).userRepository = mockUserRepository;
    (orderService as any).productRepository = mockProductRepository;
    (orderService as any).pricePeriodService = mockPricePeriodService;
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        { id: 1, totalPrice: 100, status: 'confirmed' },
        { id: 2, totalPrice: 200, status: 'pending' }
      ];
      mockOrderRepository.findAll = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(mockOrderRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = { id: 1, totalPrice: 100, status: 'confirmed' };
      mockOrderRepository.findById = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(1);

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should return null if order not found', async () => {
      mockOrderRepository.findById = jest.fn().mockResolvedValue(null);

      const result = await orderService.getOrderById(999);

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('getOrdersByUserId', () => {
    it('should return orders by user id', async () => {
      const mockOrders = [
        { id: 1, userId: 5, totalPrice: 100 },
        { id: 2, userId: 5, totalPrice: 200 }
      ];
      mockOrderRepository.findByUserId = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByUserId(5);

      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrdersByProductId', () => {
    it('should return orders by product id', async () => {
      const mockOrders = [
        { id: 1, productId: 10, totalPrice: 100 },
        { id: 2, productId: 10, totalPrice: 200 }
      ];
      mockOrderRepository.findByProductId = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByProductId(10);

      expect(mockOrderRepository.findByProductId).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('createOrder', () => {
    it('should create order with custom price periods', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const mockProduct = { id: 2, title: 'Test Product', price: 100 };
      const orderData = {
        userId: 1,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockProductRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      mockPricePeriodService.calculatePriceForDateRange = jest.fn().mockResolvedValue(500);

      const createdOrder = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        checkIn: new Date(orderData.checkIn),
        checkOut: new Date(orderData.checkOut),
        guests: orderData.guests,
        totalPrice: 500,
        status: 'pending'
      };
      mockOrderRepository.create = jest.fn().mockResolvedValue(createdOrder);

      const result = await orderService.createOrder(orderData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(2);
      expect(mockPricePeriodService.calculatePriceForDateRange).toHaveBeenCalledWith(
        2,
        expect.any(Date),
        expect.any(Date)
      );
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          product: mockProduct,
          totalPrice: 500
        })
      );
      expect(result).toEqual(createdOrder);
    });

    it('should create order with base price when no price periods', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const mockProduct = { id: 2, title: 'Test Product', price: 100 };
      const orderData = {
        userId: 1,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockProductRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      mockPricePeriodService.calculatePriceForDateRange = jest.fn().mockResolvedValue(0);

      const createdOrder = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        checkIn: new Date(orderData.checkIn),
        checkOut: new Date(orderData.checkOut),
        guests: orderData.guests,
        totalPrice: 400, // 4 nights * 100
        status: 'pending'
      };
      mockOrderRepository.create = jest.fn().mockResolvedValue(createdOrder);

      const result = await orderService.createOrder(orderData);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPrice: 400
        })
      );
      expect(result.totalPrice).toBe(400);
    });

    it('should throw NotFoundError if user not found', async () => {
      const orderData = {
        userId: 999,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if product not found', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const orderData = {
        userId: 1,
        productId: 999,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockProductRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(NotFoundError);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createPendingOrder', () => {
    it('should create pending order with pending_payment status', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const mockProduct = { id: 2, title: 'Test Product', price: 100 };
      const orderData = {
        userId: 1,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2,
        status: 'pending_payment'
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockProductRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      mockPricePeriodService.calculatePriceForDateRange = jest.fn().mockResolvedValue(500);

      const createdOrder = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        checkIn: new Date(orderData.checkIn),
        checkOut: new Date(orderData.checkOut),
        guests: orderData.guests,
        totalPrice: 500,
        status: 'pending_payment'
      };
      mockOrderRepository.create = jest.fn().mockResolvedValue(createdOrder);

      const result = await orderService.createPendingOrder(orderData);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending_payment'
        })
      );
      expect(result.status).toBe('pending_payment');
    });

    it('should use default pending_payment status if not provided', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const mockProduct = { id: 2, title: 'Test Product', price: 100 };
      const orderData = {
        userId: 1,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guests: 2
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockProductRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      mockPricePeriodService.calculatePriceForDateRange = jest.fn().mockResolvedValue(0);

      const createdOrder = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        totalPrice: 400,
        status: 'pending_payment'
      };
      mockOrderRepository.create = jest.fn().mockResolvedValue(createdOrder);

      const result = await orderService.createPendingOrder(orderData);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending_payment'
        })
      );
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const existingOrder = {
        id: 1,
        product: { id: 2, price: 100 },
        checkIn: new Date('2025-12-01'),
        checkOut: new Date('2025-12-05'),
        totalPrice: 400
      };

      const updateData = {
        status: 'confirmed',
        notes: 'Updated notes'
      };

      mockOrderRepository.findById = jest.fn().mockResolvedValue(existingOrder);
      mockOrderRepository.update = jest.fn().mockResolvedValue({ ...existingOrder, ...updateData });

      const result = await orderService.updateOrder(1, updateData);

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: 'confirmed',
          notes: 'Updated notes'
        })
      );
      expect(result.status).toBe('confirmed');
    });

    it('should recalculate price when dates change', async () => {
      const existingOrder = {
        id: 1,
        product: { id: 2, price: 100 },
        checkIn: new Date('2025-12-01'),
        checkOut: new Date('2025-12-05'),
        totalPrice: 400
      };

      const mockProduct = { id: 2, price: 100 };
      const updateData = {
        checkIn: '2025-12-01',
        checkOut: '2025-12-10' // 9 nights now
      };

      mockOrderRepository.findById = jest.fn().mockResolvedValue(existingOrder);
      mockProductRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      mockPricePeriodService.calculatePriceForDateRange = jest.fn().mockResolvedValue(0);
      mockOrderRepository.update = jest.fn().mockResolvedValue({
        ...existingOrder,
        checkOut: new Date(updateData.checkOut),
        totalPrice: 900
      });

      const result = await orderService.updateOrder(1, updateData);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(2);
      expect(mockPricePeriodService.calculatePriceForDateRange).toHaveBeenCalled();
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          checkIn: expect.any(Date),
          checkOut: expect.any(Date),
          totalPrice: 900
        })
      );
    });

    it('should throw NotFoundError if order not found', async () => {
      mockOrderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.updateOrder(999, { status: 'confirmed' })).rejects.toThrow(NotFoundError);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw NotFoundError if product not found on date change', async () => {
      const existingOrder = {
        id: 1,
        product: { id: 999, price: 100 },
        checkIn: new Date('2025-12-01'),
        checkOut: new Date('2025-12-05')
      };

      mockOrderRepository.findById = jest.fn().mockResolvedValue(existingOrder);
      mockProductRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        orderService.updateOrder(1, { checkOut: '2025-12-10' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      mockOrderRepository.delete = jest.fn().mockResolvedValue(true);

      const result = await orderService.deleteOrder(1);

      expect(mockOrderRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if order not found', async () => {
      mockOrderRepository.delete = jest.fn().mockResolvedValue(false);

      const result = await orderService.deleteOrder(999);

      expect(mockOrderRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });

  describe('autoConfirmPendingOrders', () => {
    it('should confirm orders pending for more than 24 hours', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);

      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 12);

      const mockOrders = [
        { id: 1, status: 'pending', createdAt: oldDate },
        { id: 2, status: 'pending', createdAt: oldDate },
        { id: 3, status: 'pending', createdAt: recentDate }
      ];

      mockOrderRepository.findByStatus = jest.fn().mockResolvedValue(mockOrders);
      mockOrderRepository.update = jest.fn().mockResolvedValue({});

      const result = await orderService.autoConfirmPendingOrders();

      expect(mockOrderRepository.findByStatus).toHaveBeenCalledWith('pending');
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, { status: 'confirmed' });
      expect(mockOrderRepository.update).toHaveBeenCalledWith(2, { status: 'confirmed' });
      expect(result).toBe(2);
    });

    it('should return 0 if no pending orders', async () => {
      mockOrderRepository.findByStatus = jest.fn().mockResolvedValue([]);

      const result = await orderService.autoConfirmPendingOrders();

      expect(result).toBe(0);
    });
  });

  describe('getOrdersPaginated', () => {
    it('should return paginated orders', async () => {
      const paginatedResult = {
        data: [{ id: 1 }, { id: 2 }],
        total: 10,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      const queryParams = { page: '1', limit: '10' };
      mockOrderRepository.findAllPaginated = jest.fn().mockResolvedValue(paginatedResult);

      const result = await orderService.getOrdersPaginated(queryParams);

      expect(mockOrderRepository.findAllPaginated).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getOrdersByUserIdPaginated', () => {
    it('should return paginated orders by user', async () => {
      const paginatedResult = {
        data: [{ id: 1, userId: 5 }],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      const queryParams = { page: '1', limit: '10' };
      mockOrderRepository.findByUserIdPaginated = jest.fn().mockResolvedValue(paginatedResult);

      const result = await orderService.getOrdersByUserIdPaginated(5, queryParams);

      expect(mockOrderRepository.findByUserIdPaginated).toHaveBeenCalledWith(5, expect.any(Object));
      expect(result).toEqual(paginatedResult);
    });
  });
});
