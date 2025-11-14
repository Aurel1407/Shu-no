import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { CreateProductDto, UpdateProductDto } from '../dtos/ProductDto';
import { asyncHandler } from '../middleware/errorHandler';

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, message });
}

function parseId(param: string): number | null {
  const id = parseInt(param);
  return isNaN(id) || id <= 0 ? null : id;
}
export class ProductController {
  private readonly productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const products = await this.productService.getAllProducts();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  });

  getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
      return;
    }
    
    const product = await this.productService.getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: product
    });
  });

  getProductByIdAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const product = await this.productService.getProductByIdAdmin(id);

    res.json({
      success: true,
      data: product
    });
  });

  getProductsByLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const location = req.params.location;
    const products = await this.productService.getProductsByLocation(location);
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  });

  createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productData: CreateProductDto = req.body;
    const product = await this.productService.createProduct(productData);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Produit créé avec succès'
    });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID de produit invalide');
    const productData: UpdateProductDto = req.body;
    const product = await this.productService.updateProduct(id, productData);
    res.json({ success: true, data: product, message: 'Produit mis à jour avec succès' });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID de produit invalide');
    const success = await this.productService.deleteProduct(id);
    res.json({ success, message: success ? 'Produit supprimé avec succès' : 'Échec de la suppression' });
  });

  getAllProductsAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const products = await this.productService.getAllProductsAdmin();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  });

  getProductsPaginated = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.productService.getProductsPaginated(req.query);
    res.json(result);
  });

  getProductsPaginatedAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.productService.getProductsPaginatedAdmin(req.query);
    res.json(result);
  });
}
