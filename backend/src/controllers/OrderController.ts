import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/OrderDto';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logError } from '../config/logger';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({ error: 'Réservation non trouvée' });
        return;
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de la réservation' });
    }
  }

  async getOrdersByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await this.orderService.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des réservations de l\'utilisateur' });
    }
  }

  async getOrdersByProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.productId);
      const orders = await this.orderService.getOrdersByProductId(productId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des réservations du produit' });
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: CreateOrderDto = req.body;
      const order = await this.orderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      if (error.message === 'User not found' || error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Invalid date range') {
        res.status(400).json({ error: 'Dates invalides' });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
      }
    }
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      // Créer une réservation en attente de paiement
      const pendingOrder = await this.orderService.createPendingOrder({
        ...orderData,
        userId,
        status: 'pending_payment'
      });

      // Générer un ID unique pour la transaction
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simuler la création d'un intent de paiement
      // Dans un vrai projet, vous appelleriez ici les APIs Stripe/PayPal
      const paymentIntent = {
        id: paymentIntentId,
        orderId: pendingOrder.id,
        amount: orderData.totalPrice * 100, // Stripe utilise les centimes
        currency: 'eur',
        status: 'requires_payment_method',
        // URLs simulées - à remplacer par les vraies APIs
        stripeUrl: `https://checkout.stripe.com/pay/${paymentIntentId}`,
        paypalUrl: `https://www.paypal.com/checkoutnow?token=${paymentIntentId}`
      };

      res.status(201).json(paymentIntent);
    } catch (error: any) {
      logError(error, { context: 'Création intent paiement' });
      res.status(500).json({ error: 'Erreur lors de la création de l\'intent de paiement' });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const orderData: UpdateOrderDto = req.body;
      const order = await this.orderService.updateOrder(id, orderData);
      res.json(order);
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ error: 'Réservation non trouvée' });
      } else if (error.message === 'Product not found') {
        res.status(404).json({ error: 'Produit non trouvé' });
      } else {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation' });
      }
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await this.orderService.deleteOrder(id);

      if (!success) {
        res.status(404).json({ error: 'Réservation non trouvée' });
        return;
      }

      res.status(200).json({ message: 'Réservation supprimée avec succès', id: id });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la réservation' });
    }
  }

  async getMyBookings(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const orders = await this.orderService.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de vos réservations' });
    }
  }

  getOrdersPaginated = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.orderService.getOrdersPaginated(req.query);
    res.json(result);
  });

  getOrdersByUserPaginated = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId);
    const result = await this.orderService.getOrdersByUserIdPaginated(userId, req.query);
    res.json(result);
  });
}
