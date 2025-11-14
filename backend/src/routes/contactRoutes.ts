import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const contactController = new ContactController();

// Routes publiques
router.post('/', contactController.createContact);

// Routes admin (protégées)
router.get('/', authenticateToken, requireAdmin, contactController.getAllContacts);
router.get('/paginated', authenticateToken, requireAdmin, contactController.getContactsPaginated);
router.get('/unread-count', authenticateToken, requireAdmin, contactController.getUnreadCount);
router.get('/:id', authenticateToken, requireAdmin, contactController.getContactById);
router.put('/:id/read', authenticateToken, requireAdmin, contactController.markContactAsRead);
router.delete('/:id', authenticateToken, requireAdmin, contactController.deleteContact);

export default router;
