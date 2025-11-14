import { OrderRepository } from '../repositories/OrderRepository';
import { Order } from '../entities/Order';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/OrderDto';
import { UserRepository } from '../repositories/UserRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { PricePeriodService } from './PricePeriodService';
import { PaginationParams, PaginatedResponse, PaginationHelper } from '../utils/pagination';
import { NotFoundError, ValidationError } from '../utils/errors';

export class OrderService {
  private orderRepository: OrderRepository;
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private pricePeriodService: PricePeriodService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.pricePeriodService = new PricePeriodService();
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.findAll();
  }

  async getOrderById(id: number): Promise<Order | null> {
    return await this.orderRepository.findById(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders;
  }

  async getOrdersByProductId(productId: number): Promise<Order[]> {
    return await this.orderRepository.findByProductId(productId);
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(orderData.userId);
    if (!user) {
      throw new NotFoundError('Utilisateur', { userId: orderData.userId });
    }

    // Vérifier que le produit existe
    const product = await this.productRepository.findById(orderData.productId);
    if (!product) {
      throw new NotFoundError('Produit', { productId: orderData.productId });
    }

    // Calculer le prix total basé sur les périodes de prix ou le prix de base
    const checkIn = new Date(orderData.checkIn);
    const checkOut = new Date(orderData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Essayer de calculer le prix avec les périodes de prix
    let totalPrice = await this.pricePeriodService.calculatePriceForDateRange(
      orderData.productId,
      checkIn,
      checkOut
    );

    // Si aucune période de prix n'est définie, utiliser le prix de base
    if (totalPrice === 0) {
      totalPrice = product.price * nights;
    }

    return await this.orderRepository.create({
      user,
      product,
      checkIn: new Date(orderData.checkIn),
      checkOut: new Date(orderData.checkOut),
      guests: orderData.guests,
      totalPrice,
      notes: orderData.notes,
    });
  }

  async createPendingOrder(orderData: CreateOrderDto & { status?: string }): Promise<Order> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(orderData.userId);
    if (!user) {
      throw new NotFoundError('Utilisateur', { userId: orderData.userId });
    }

    // Vérifier que le produit existe
    const product = await this.productRepository.findById(orderData.productId);
    if (!product) {
      throw new NotFoundError('Produit', { productId: orderData.productId });
    }

    // Calculer le prix total basé sur les périodes de prix ou le prix de base
    const checkIn = new Date(orderData.checkIn);
    const checkOut = new Date(orderData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Essayer de calculer le prix avec les périodes de prix
    let totalPrice = await this.pricePeriodService.calculatePriceForDateRange(
      orderData.productId,
      checkIn,
      checkOut
    );

    // Si aucune période de prix n'est définie, utiliser le prix de base
    if (totalPrice === 0) {
      totalPrice = product.price * nights;
    }

    return await this.orderRepository.create({
      user,
      product,
      checkIn: new Date(orderData.checkIn),
      checkOut: new Date(orderData.checkOut),
      guests: orderData.guests,
      totalPrice,
      notes: orderData.notes,
      status: orderData.status || 'pending_payment',
    });
  }

  async updateOrder(id: number, orderData: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Réservation', { orderId: id });
    }

    const updateData: Partial<Order> = {};

    if (orderData.checkIn) updateData.checkIn = new Date(orderData.checkIn);
    if (orderData.checkOut) updateData.checkOut = new Date(orderData.checkOut);
    if (orderData.guests !== undefined) updateData.guests = orderData.guests;
    if (orderData.status !== undefined) updateData.status = orderData.status;
    if (orderData.notes !== undefined) updateData.notes = orderData.notes;

    // Recalculate total price if dates changed
    if (orderData.checkIn || orderData.checkOut) {
      const product = await this.productRepository.findById(order.product.id);
      if (!product) {
        throw new NotFoundError('Produit', { productId: order.product.id });
      }
      const checkIn = orderData.checkIn ? new Date(orderData.checkIn) : order.checkIn;
      const checkOut = orderData.checkOut ? new Date(orderData.checkOut) : order.checkOut;
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      // Essayer de calculer le prix avec les périodes de prix
      let totalPrice = await this.pricePeriodService.calculatePriceForDateRange(
        order.product.id,
        checkIn,
        checkOut
      );

      // Si aucune période de prix n'est définie, utiliser le prix de base
      if (totalPrice === 0) {
        totalPrice = product.price * nights;
      }

      updateData.totalPrice = totalPrice;
    }

    return await this.orderRepository.update(id, updateData);
  }

  async deleteOrder(id: number): Promise<boolean> {
    return await this.orderRepository.delete(id);
  }

  async autoConfirmPendingOrders(): Promise<number> {
    // Confirmer automatiquement les réservations en attente depuis plus de 24h
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pendingOrders = await this.orderRepository.findByStatus('pending');

    let confirmedCount = 0;
    for (const order of pendingOrders) {
      if (new Date(order.createdAt) <= twentyFourHoursAgo) {
        await this.orderRepository.update(order.id, { status: 'confirmed' });
        confirmedCount++;
      }
    }

    return confirmedCount;
  }

  async getOrdersPaginated(queryParams: unknown): Promise<PaginatedResponse<Order>> {
    const params = PaginationHelper.parseParams(queryParams);
    return await this.orderRepository.findAllPaginated(params);
  }

  async getOrdersByUserIdPaginated(
    userId: number,
    queryParams: unknown
  ): Promise<PaginatedResponse<Order>> {
    const params = PaginationHelper.parseParams(queryParams);
    return await this.orderRepository.findByUserIdPaginated(userId, params);
  }
}
