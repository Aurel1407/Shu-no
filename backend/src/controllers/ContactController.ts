import { Request, Response } from 'express';
import { ContactService } from '../services/ContactService';
import { CreateContactDto } from '../dtos/ContactDto';
import { asyncHandler } from '../middleware/errorHandler';

export class ContactController {
  private readonly contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  createContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contactData: CreateContactDto = req.body;
    const contact = await this.contactService.createContact(contactData);

    res.status(201).json({
      success: true,
      data: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      },
      message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    });
  });

  getAllContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contacts = await this.contactService.getAllContacts();
    res.json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  });

  getContactById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const contact = await this.contactService.getContactById(id);

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Message de contact non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: contact
    });
  });

  markContactAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const success = await this.contactService.markContactAsRead(id);

    res.json({
      success,
      message: success ? 'Message marqué comme lu' : 'Échec de la mise à jour'
    });
  });

  deleteContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const success = await this.contactService.deleteContact(id);

    res.json({
      success,
      message: success ? 'Message supprimé avec succès' : 'Échec de la suppression'
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const count = await this.contactService.getUnreadCount();
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  });

  getContactsPaginated = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.contactService.getContactsPaginated(req.query);
    res.json(result);
  });
}
