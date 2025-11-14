import { ContactRepository } from '../repositories/ContactRepository';
import { Contact } from '../entities/Contact';
import { CreateContactDto } from '../dtos/ContactDto';
import { ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse, PaginationHelper } from '../utils/pagination';

export class ContactService {
  private readonly contactRepository: ContactRepository;

  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async createContact(contactData: CreateContactDto): Promise<Contact> {
    // Validation supplémentaire côté service si nécessaire
    if (contactData.phone && !/^[0-9+\-\s().]+$/.test(contactData.phone)) {
      throw new ValidationError('Le format du numéro de téléphone est invalide');
    }

    return await this.contactRepository.create(contactData);
  }

  async getAllContacts(): Promise<Contact[]> {
    return await this.contactRepository.findAll();
  }

  async getContactById(id: number): Promise<Contact | null> {
    return await this.contactRepository.findById(id);
  }

  async markContactAsRead(id: number): Promise<boolean> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new ValidationError('Message de contact non trouvé', { contactId: id });
    }

    return await this.contactRepository.markAsRead(id);
  }

  async deleteContact(id: number): Promise<boolean> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new ValidationError('Message de contact non trouvé', { contactId: id });
    }

    return await this.contactRepository.delete(id);
  }

  async getUnreadCount(): Promise<number> {
    return await this.contactRepository.getUnreadCount();
  }

  async getContactsPaginated(queryParams: unknown): Promise<PaginatedResponse<Contact>> {
    const params = PaginationHelper.parseParams(queryParams);
    return await this.contactRepository.findAllPaginated(params);
  }
}
