import { Request, Response, NextFunction } from 'express';
import { OrderController } from './OrderController';
import { OrderService } from '../services/OrderService';

// Mock OrderService
jest.mock('../services/OrderService');

describe('OrderController', () => {
  let orderController: OrderController;
  let mockOrderService: jest.Mocked<OrderService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      params: {},
      body: {},
      query: {}
    } as Request;
    
    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;
    
    mockNext = jest.fn();

    orderController = new OrderController();
    mockOrderService = new OrderService() as jest.Mocked<OrderService>;
    (orderController as any).orderService = mockOrderService;
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        { id: 1, totalPrice: 100, status: 'confirmed' },
        { id: 2, totalPrice: 200, status: 'pending' }
      ];
      mockOrderService.getAllOrders = jest.fn().mockResolvedValue(mockOrders);

      await orderController.getAllOrders(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getAllOrders).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      mockOrderService.getAllOrders = jest.fn().mockRejectedValue(new Error('Database error'));

      await orderController.getAllOrders(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération des réservations' });
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = { id: 1, totalPrice: 100, status: 'confirmed' };
      mockRequest.params = { id: '1' };
      mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: '999' };
      mockOrderService.getOrderById = jest.fn().mockResolvedValue(null);

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Réservation non trouvée' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      mockOrderService.getOrderById = jest.fn().mockRejectedValue(new Error('Database error'));

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération de la réservation' });
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders by user id', async () => {
      const mockOrders = [
        { id: 1, userId: 5, totalPrice: 100 },
        { id: 2, userId: 5, totalPrice: 200 }
      ];
      mockRequest.params = { userId: '5' };
      mockOrderService.getOrdersByUserId = jest.fn().mockResolvedValue(mockOrders);

      await orderController.getOrdersByUser(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrdersByUserId).toHaveBeenCalledWith(5);
      expect(jsonMock).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      mockRequest.params = { userId: '5' };
      mockOrderService.getOrdersByUserId = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.getOrdersByUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getOrdersByProduct', () => {
    it('should return orders by product id', async () => {
      const mockOrders = [
        { id: 1, productId: 10, totalPrice: 100 },
        { id: 2, productId: 10, totalPrice: 200 }
      ];
      mockRequest.params = { productId: '10' };
      mockOrderService.getOrdersByProductId = jest.fn().mockResolvedValue(mockOrders);

      await orderController.getOrdersByProduct(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrdersByProductId).toHaveBeenCalledWith(10);
      expect(jsonMock).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      mockRequest.params = { productId: '10' };
      mockOrderService.getOrdersByProductId = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.getOrdersByProduct(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 1,
        productId: 2,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        totalPrice: 400,
        status: 'pending',
        guests: 2
      };
      const createdOrder = { id: 1, ...orderData };
      mockRequest.body = orderData;
      mockOrderService.createOrder = jest.fn().mockResolvedValue(createdOrder);

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdOrder);
    });

    it('should return 404 if user not found', async () => {
      const orderData = { userId: 999, productId: 2, checkIn: '2025-12-01', checkOut: '2025-12-05' };
      mockRequest.body = orderData;
      mockOrderService.createOrder = jest.fn().mockRejectedValue(new Error('User not found'));

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 404 if product not found', async () => {
      const orderData = { userId: 1, productId: 999, checkIn: '2025-12-01', checkOut: '2025-12-05' };
      mockRequest.body = orderData;
      mockOrderService.createOrder = jest.fn().mockRejectedValue(new Error('Product not found'));

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('should return 400 for invalid date range', async () => {
      const orderData = { userId: 1, productId: 2, checkIn: '2025-12-05', checkOut: '2025-12-01' };
      mockRequest.body = orderData;
      mockOrderService.createOrder = jest.fn().mockRejectedValue(new Error('Invalid date range'));

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Dates invalides' });
    });

    it('should handle general errors', async () => {
      mockRequest.body = { userId: 1, productId: 2 };
      mockOrderService.createOrder = jest.fn().mockRejectedValue(new Error('General error'));

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la création de la réservation' });
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const orderData = {
        productId: 1,
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        totalPrice: 500,
        guests: 2
      };
      const pendingOrder = { id: 10, ...orderData, status: 'pending_payment' };
      
      mockRequest.body = orderData;
      (mockRequest as any).user = { id: 5 };
      mockOrderService.createPendingOrder = jest.fn().mockResolvedValue(pendingOrder);

      await orderController.createPaymentIntent(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.createPendingOrder).toHaveBeenCalledWith(
        expect.objectContaining({ ...orderData, userId: 5, status: 'pending_payment' })
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 10,
          amount: 50000,
          currency: 'eur',
          status: 'requires_payment_method'
        })
      );
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.body = { productId: 1, totalPrice: 500 };
      (mockRequest as any).user = undefined;

      await orderController.createPaymentIntent(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Utilisateur non authentifié' });
    });

    it('should handle errors', async () => {
      mockRequest.body = { productId: 1, totalPrice: 500 };
      (mockRequest as any).user = { id: 5 };
      mockOrderService.createPendingOrder = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.createPaymentIntent(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la création de l\'intent de paiement' });
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const updateData = { status: 'confirmed', totalPrice: 450 };
      const updatedOrder = { id: 1, ...updateData };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockOrderService.updateOrder = jest.fn().mockResolvedValue(updatedOrder);

      await orderController.updateOrder(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(1, updateData);
      expect(jsonMock).toHaveBeenCalledWith(updatedOrder);
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { status: 'confirmed' };
      mockOrderService.updateOrder = jest.fn().mockRejectedValue(new Error('Order not found'));

      await orderController.updateOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Réservation non trouvée' });
    });

    it('should return 404 if product not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { productId: 999 };
      mockOrderService.updateOrder = jest.fn().mockRejectedValue(new Error('Product not found'));

      await orderController.updateOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Produit non trouvé' });
    });

    it('should handle general errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'confirmed' };
      mockOrderService.updateOrder = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.updateOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la mise à jour de la réservation' });
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      mockRequest.params = { id: '1' };
      mockOrderService.deleteOrder = jest.fn().mockResolvedValue(true);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Réservation supprimée avec succès', id: 1 });
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: '999' };
      mockOrderService.deleteOrder = jest.fn().mockResolvedValue(false);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Réservation non trouvée' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      mockOrderService.deleteOrder = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la suppression de la réservation' });
    });
  });

  describe('getMyBookings', () => {
    it('should return user bookings', async () => {
      const mockOrders = [
        { id: 1, userId: 5, totalPrice: 100 },
        { id: 2, userId: 5, totalPrice: 200 }
      ];
      (mockRequest as any).user = { id: 5 };
      mockOrderService.getOrdersByUserId = jest.fn().mockResolvedValue(mockOrders);

      await orderController.getMyBookings(mockRequest as any, mockResponse as Response);

      expect(mockOrderService.getOrdersByUserId).toHaveBeenCalledWith(5);
      expect(jsonMock).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      (mockRequest as any).user = { id: 5 };
      mockOrderService.getOrdersByUserId = jest.fn().mockRejectedValue(new Error('Error'));

      await orderController.getMyBookings(mockRequest as any, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération de vos réservations' });
    });
  });

  describe('getOrdersPaginated', () => {
    it('should return paginated orders', async () => {
      const paginatedResult = {
        data: [{ id: 1 }, { id: 2 }],
        total: 10,
        page: 1,
        limit: 10
      };
      const nextMock = jest.fn();
      mockRequest.query = { page: '1', limit: '10' };
      mockOrderService.getOrdersPaginated = jest.fn().mockResolvedValue(paginatedResult);

      await orderController.getOrdersPaginated(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockOrderService.getOrdersPaginated).toHaveBeenCalledWith({ page: '1', limit: '10' });
      expect(jsonMock).toHaveBeenCalledWith(paginatedResult);
    });
  });

  describe('getOrdersByUserPaginated', () => {
    it('should return paginated orders by user', async () => {
      const paginatedResult = {
        data: [{ id: 1, userId: 5 }],
        total: 5,
        page: 1,
        limit: 10
      };
      const nextMock = jest.fn();
      mockRequest.params = { userId: '5' };
      mockRequest.query = { page: '1', limit: '10' };
      mockOrderService.getOrdersByUserIdPaginated = jest.fn().mockResolvedValue(paginatedResult);

      await orderController.getOrdersByUserPaginated(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockOrderService.getOrdersByUserIdPaginated).toHaveBeenCalledWith(5, { page: '1', limit: '10' });
      expect(jsonMock).toHaveBeenCalledWith(paginatedResult);
    });
  });
});
