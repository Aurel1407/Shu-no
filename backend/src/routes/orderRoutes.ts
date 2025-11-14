import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

// GET /api/orders (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => orderController.getAllOrders(req, res));

// GET /api/orders/paginated (admin only)
router.get('/paginated', authenticateToken, requireAdmin, orderController.getOrdersPaginated);

// GET /api/orders/my-bookings
router.get('/my-bookings', authenticateToken, (req, res) => {
  return orderController.getMyBookings(req, res);
});

// GET /api/orders/user/:userId/paginated
router.get('/user/:userId/paginated', authenticateToken, orderController.getOrdersByUserPaginated);

// GET /api/orders/product/:productId
router.get('/product/:productId', authenticateToken, requireAdmin, (req, res) => orderController.getOrdersByProduct(req, res));

// GET /api/orders/:id
router.get('/:id', authenticateToken, (req, res) => orderController.getOrderById(req, res));

// POST /api/orders
router.post('/', authenticateToken, (req, res) => orderController.createOrder(req, res));

// POST /api/orders/create-payment-intent
router.post('/create-payment-intent', authenticateToken, (req, res) => orderController.createPaymentIntent(req, res));

// PUT /api/orders/:id
router.put('/:id', authenticateToken, requireAdmin, (req, res) => orderController.updateOrder(req, res));

// DELETE /api/orders/:id
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => orderController.deleteOrder(req, res));

export default router;
