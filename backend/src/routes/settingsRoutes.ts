import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const settingsController = new SettingsController();

// GET /api/settings/auto-confirm - Récupérer les paramètres de confirmation automatique
router.get('/auto-confirm', authenticateToken, requireAdmin, (req, res) => {
  return settingsController.getAutoConfirmSettings(req, res);
});

// PUT /api/settings/auto-confirm - Mettre à jour les paramètres de confirmation automatique
router.put('/auto-confirm', authenticateToken, requireAdmin, (req, res) => {
  return settingsController.updateAutoConfirmSettings(req, res);
});

// POST /api/settings/auto-confirm/trigger - Déclencher la confirmation automatique
router.post('/auto-confirm/trigger', authenticateToken, requireAdmin, (req, res) => {
  return settingsController.triggerAutoConfirm(req, res);
});

export default router;
