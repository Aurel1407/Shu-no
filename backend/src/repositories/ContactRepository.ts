import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Contact } from '../entities/Contact';
import { PaginationParams, PaginatedResponse } from '../utils/pagination';

export class ContactRepository {
  private readonly repository: Repository<Contact>;

  constructor() {
    this.repository = AppDataSource.getRepository(Contact);
  }

  async create(contactData: Partial<Contact>): Promise<Contact> {
    const contact = this.repository.create(contactData);
    return await this.repository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<Contact | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async markAsRead(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isRead: true });
    return result.affected ? result.affected > 0 : false;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async getUnreadCount(): Promise<number> {
    return await this.repository.count({
      where: { isRead: false }
    });
  }

  async findAllPaginated(params: PaginationParams): Promise<PaginatedResponse<Contact>> {
    const queryBuilder = this.repository.createQueryBuilder('contact');

    // Apply search if provided
    if (params.search) {
      queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.subject ILIKE :search OR contact.message ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'name', 'email', 'subject', 'isRead', 'createdAt'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    queryBuilder.orderBy(`contact.${sortField}`, params.sortOrder || 'DESC');

    // Get total count before applying pagination
    const total = await queryBuilder.getCount();

    // Calculate offset
    const offset = (params.page - 1) * params.limit;

    // Apply pagination
    queryBuilder.skip(offset).take(params.limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      success: true,
      data,
      pagination: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        totalItems: total,
        itemsPerPage: params.limit,
        hasNextPage: params.page < Math.ceil(total / params.limit),
        hasPreviousPage: params.page > 1
      }
    };
  }
}
