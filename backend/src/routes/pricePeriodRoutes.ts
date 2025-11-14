import { Router } from 'express';
import { PricePeriodController } from '../controllers/PricePeriodController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const pricePeriodController = new PricePeriodController();

// GET /api/price-periods
router.get('/', authenticateToken, (req, res) => pricePeriodController.getAllPricePeriods(req, res));

// GET /api/price-periods/:id
router.get('/:id', authenticateToken, (req, res) => pricePeriodController.getPricePeriodById(req, res));

// GET /api/price-periods/product/:productId
router.get('/product/:productId', authenticateToken, (req, res) => pricePeriodController.getPricePeriodsByProductId(req, res));

// GET /api/price-periods/product/:productId/calculate
// Cette route est publique pour permettre au frontend de calculer les prix sans token
router.get('/product/:productId/calculate', (req, res) => pricePeriodController.calculatePriceForDateRange(req, res));

// POST /api/price-periods
router.post('/', authenticateToken, requireAdmin, (req, res) => pricePeriodController.createPricePeriod(req, res));

// PUT /api/price-periods/:id
router.put('/:id', authenticateToken, requireAdmin, (req, res) => pricePeriodController.updatePricePeriod(req, res));

// DELETE /api/price-periods/:id
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => pricePeriodController.deletePricePeriod(req, res));

export default router;
