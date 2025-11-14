import { Repository } from 'typeorm';
import { PricePeriod } from '../entities/PricePeriod';
import { AppDataSource } from '../config/database';

export class PricePeriodRepository {
  private readonly repository: Repository<PricePeriod>;

  constructor() {
    this.repository = AppDataSource.getRepository(PricePeriod);
  }

  async findAll(): Promise<PricePeriod[]> {
    return await this.repository.find({
      relations: ['product'],
      order: { startDate: 'ASC' }
    });
  }

  async findById(id: number): Promise<PricePeriod | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['product']
    });
  }

  async findByProductId(productId: number): Promise<PricePeriod[]> {
    return await this.repository.find({
      where: { productId },
      relations: ['product'],
      order: { startDate: 'ASC' }
    });
  }

  async findActivePeriodsForDateRange(productId: number, startDate: Date, endDate: Date): Promise<PricePeriod[]> {
    return await this.repository
      .createQueryBuilder('period')
      .where('period.productId = :productId', { productId })
      .andWhere('period.startDate <= :endDate', { endDate })
      .andWhere('period.endDate >= :startDate', { startDate })
      .orderBy('period.startDate', 'ASC')
      .getMany();
  }

  async create(pricePeriodData: Partial<PricePeriod>): Promise<PricePeriod> {
    const pricePeriod = this.repository.create(pricePeriodData);
    return await this.repository.save(pricePeriod);
  }

  async update(id: number, pricePeriodData: Partial<PricePeriod>): Promise<PricePeriod> {
    await this.repository.update(id, pricePeriodData);
    const updatedPeriod = await this.findById(id);
    if (!updatedPeriod) {
      throw new Error('Price period not found after update');
    }
    return updatedPeriod;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByProductId(productId: number): Promise<boolean> {
    const result = await this.repository.delete({ productId });
    return (result.affected ?? 0) > 0;
  }
}
