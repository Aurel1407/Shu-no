import { Request, Response } from 'express';
import { PricePeriodService, CreatePricePeriodDto, UpdatePricePeriodDto } from '../services/PricePeriodService';
import { logError } from '../config/logger';

// Utilitaire pour parser un entier
function parseIntParam(param: string | undefined): number | null {
  if (!param) return null;
  const value = parseInt(param);
  return isNaN(value) ? null : value;
}

// Utilitaire pour parser une date
function parseDateParam(param: string | undefined): Date | null {
  if (!param) return null;
  const date = new Date(param);
  return isNaN(date.getTime()) ? null : date;
}

// Centralisation de l'envoi d'erreur
function sendError(res: Response, status: number, message: string, context?: string, error?: unknown): void {
  if (error) logError(error instanceof Error ? error : new Error(String(error)), { context });
  res.status(status).json({ error: message });
}

export class PricePeriodController {
  private readonly pricePeriodService: PricePeriodService;

  constructor() {
    this.pricePeriodService = new PricePeriodService();
  }

  async getAllPricePeriods(req: Request, res: Response): Promise<void> {
    try {
      const pricePeriods = await this.pricePeriodService.getAllPricePeriods();
      res.json(pricePeriods);
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la récupération des périodes de prix', 'getAllPricePeriods', error);
    }
  }

  async getPricePeriodById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null) return sendError(res, 400, 'ID invalide', 'getPricePeriodById');
      const pricePeriod = await this.pricePeriodService.getPricePeriodById(id);
      if (!pricePeriod) return sendError(res, 404, 'Période de prix non trouvée', 'getPricePeriodById');
      res.json(pricePeriod);
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la récupération de la période de prix', 'getPricePeriodById', error);
    }
  }

  async getPricePeriodsByProductId(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseIntParam(req.params.productId);
      if (productId === null) return sendError(res, 400, 'ID produit invalide', 'getPricePeriodsByProductId');
      const pricePeriods = await this.pricePeriodService.getPricePeriodsByProductId(productId);
      res.json(pricePeriods);
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la récupération des périodes de prix du produit', 'getPricePeriodsByProductId', error);
    }
  }

  async createPricePeriod(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseIntParam(req.body.productId);
      const startDate = parseDateParam(req.body.startDate);
      const endDate = parseDateParam(req.body.endDate);
      if (productId === null || !startDate || !endDate) {
        return sendError(res, 400, 'Paramètres invalides', 'createPricePeriod');
      }
      const pricePeriodData: CreatePricePeriodDto = {
        productId,
        startDate,
        endDate,
        price: req.body.price,
        name: req.body.name
      };
      const pricePeriod = await this.pricePeriodService.createPricePeriod(pricePeriodData);
      res.status(201).json(pricePeriod);
    } catch (error) {
      sendError(res, 400, error instanceof Error ? error.message : 'Erreur lors de la création de la période de prix', 'createPricePeriod', error);
    }
  }

  async updatePricePeriod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null) return sendError(res, 400, 'ID invalide', 'updatePricePeriod');
      const pricePeriodData: UpdatePricePeriodDto = {};
      if (req.body.startDate) {
        const startDate = parseDateParam(req.body.startDate);
        if (!startDate) return sendError(res, 400, 'Date de début invalide', 'updatePricePeriod');
        pricePeriodData.startDate = startDate;
      }
      if (req.body.endDate) {
        const endDate = parseDateParam(req.body.endDate);
        if (!endDate) return sendError(res, 400, 'Date de fin invalide', 'updatePricePeriod');
        pricePeriodData.endDate = endDate;
      }
      if (req.body.price !== undefined) pricePeriodData.price = req.body.price;
      if (req.body.name !== undefined) pricePeriodData.name = req.body.name;
      const pricePeriod = await this.pricePeriodService.updatePricePeriod(id, pricePeriodData);
      res.json(pricePeriod);
    } catch (error) {
      sendError(res, 400, error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la période de prix', 'updatePricePeriod', error);
    }
  }

  async deletePricePeriod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIntParam(req.params.id);
      if (id === null) return sendError(res, 400, 'ID invalide', 'deletePricePeriod');
      const deleted = await this.pricePeriodService.deletePricePeriod(id);
      if (!deleted) return sendError(res, 404, 'Période de prix non trouvée', 'deletePricePeriod');
      res.status(204).send();
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la suppression de la période de prix', 'deletePricePeriod', error);
    }
  }

  async calculatePriceForDateRange(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseIntParam(req.params.productId);
      const startDate = parseDateParam(req.query.startDate as string);
      const endDate = parseDateParam(req.query.endDate as string);
      if (productId === null || !startDate || !endDate) {
        return sendError(res, 400, 'Paramètres invalides', 'calculatePriceForDateRange');
      }
      const totalPrice = await this.pricePeriodService.calculatePriceForDateRange(productId, startDate, endDate);
      res.json({ totalPrice });
    } catch (error) {
      sendError(res, 500, 'Erreur lors du calcul du prix', 'calculatePriceForDateRange', error);
    }
  }
}
