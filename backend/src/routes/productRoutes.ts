import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  validateCreateProduct, 
  validateUpdateProduct,
  validateId,
  handleValidationErrors 
} from '../middleware/validation';

const router = Router();
const productController = new ProductController();

// GET /api/products
router.get('/', productController.getAllProducts);

// GET /api/products/paginated
router.get('/paginated', productController.getProductsPaginated);

// GET /api/products/admin
router.get('/admin', authenticateToken, requireAdmin, productController.getAllProductsAdmin);

// GET /api/products/admin/paginated
router.get('/admin/paginated', authenticateToken, requireAdmin, productController.getProductsPaginatedAdmin);

// GET /api/products/admin/:id
router.get('/admin/:id', authenticateToken, requireAdmin, productController.getProductByIdAdmin);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// GET /api/products/location/:location
router.get('/location/:location', productController.getProductsByLocation);

// POST /api/products
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateCreateProduct,
  handleValidationErrors,
  productController.createProduct
);

// PUT /api/products/:id
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  validateUpdateProduct,
  handleValidationErrors,
  productController.updateProduct
);

// DELETE /api/products/:id
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

export default router;
