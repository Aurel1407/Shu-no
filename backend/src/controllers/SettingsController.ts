import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { OrderService } from '../services/OrderService';


function sendError(res: Response, status: number, message: string, error?: unknown): void {
  // Gestion centralisée des erreurs
  res.status(status).json({ error: message });
}

export class SettingsController {
  private readonly settingsService: SettingsService;
  private readonly orderService: OrderService;

  constructor() {
    this.settingsService = new SettingsService();
    this.orderService = new OrderService();
  }

  async getAutoConfirmSettings(req: Request, res: Response): Promise<void> {
    try {
      
      const settings = await this.settingsService.getAutoConfirmSettings();
      
      res.json(settings);
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la récupération des paramètres', error);
    }
  }

  async updateAutoConfirmSettings(req: Request, res: Response): Promise<void> {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        
        return sendError(res, 400, 'Le champ "enabled" doit être un booléen');
      }
      const settings = await this.settingsService.updateAutoConfirmSettings(enabled);
      
      res.json(settings);
    } catch (error) {
      sendError(res, 500, 'Erreur lors de la mise à jour des paramètres', error);
    }
  }

  async triggerAutoConfirm(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.getAutoConfirmSettings();
      if (!settings.enabled) {
        return sendError(res, 400, 'La confirmation automatique n\'est pas activée');
      }
      const confirmedCount = await this.orderService.autoConfirmPendingOrders();
      res.json({
        message: `${confirmedCount} réservation(s) confirmée(s) automatiquement`,
        confirmedCount
      });
    } catch (error) {
      sendError(res, 500, 'Erreur lors du déclenchement de la confirmation automatique', error);
    }
  }
}
