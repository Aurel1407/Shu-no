import { PricePeriodRepository } from '../repositories/PricePeriodRepository';
import { PricePeriod } from '../entities/PricePeriod';
import { ProductService } from './ProductService';

export interface CreatePricePeriodDto {
  productId: number;
  startDate: Date;
  endDate: Date;
  price: number;
  name?: string;
}

export interface UpdatePricePeriodDto {
  startDate?: Date;
  endDate?: Date;
  price?: number;
  name?: string;
}

export class PricePeriodService {
  private readonly pricePeriodRepository: PricePeriodRepository;
  private readonly productService: ProductService;

  constructor() {
    this.pricePeriodRepository = new PricePeriodRepository();
    this.productService = new ProductService();
  }

  async getAllPricePeriods(): Promise<PricePeriod[]> {
    return await this.pricePeriodRepository.findAll();
  }

  async getPricePeriodById(id: number): Promise<PricePeriod | null> {
    return await this.pricePeriodRepository.findById(id);
  }

  async getPricePeriodsByProductId(productId: number): Promise<PricePeriod[]> {
    return await this.pricePeriodRepository.findByProductId(productId);
  }

  async createPricePeriod(pricePeriodData: CreatePricePeriodDto): Promise<PricePeriod> {
    // Validation des dates
    if (pricePeriodData.startDate >= pricePeriodData.endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }

    // Vérifier les conflits avec les périodes existantes
    const existingPeriods = await this.pricePeriodRepository.findByProductId(
      pricePeriodData.productId
    );
    for (const period of existingPeriods) {
      if (
        this.periodsOverlap(
          pricePeriodData.startDate,
          pricePeriodData.endDate,
          period.startDate,
          period.endDate
        )
      ) {
        throw new Error('Cette période chevauche une période de prix existante');
      }
    }

    return await this.pricePeriodRepository.create(pricePeriodData);
  }

  async updatePricePeriod(id: number, pricePeriodData: UpdatePricePeriodDto): Promise<PricePeriod> {
    const existingPeriod = await this.pricePeriodRepository.findById(id);
    if (!existingPeriod) {
      throw new Error('Période de prix non trouvée');
    }

    const updatedData = { ...pricePeriodData };

    // Validation des dates si elles sont modifiées
    const startDate = updatedData.startDate || existingPeriod.startDate;
    const endDate = updatedData.endDate || existingPeriod.endDate;

    if (startDate >= endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }

    // Vérifier les conflits avec les autres périodes
    const existingPeriods = await this.pricePeriodRepository.findByProductId(
      existingPeriod.productId
    );
    for (const period of existingPeriods) {
      if (
        period.id !== id &&
        this.periodsOverlap(startDate, endDate, period.startDate, period.endDate)
      ) {
        throw new Error('Cette période chevauche une période de prix existante');
      }
    }

    return await this.pricePeriodRepository.update(id, updatedData);
  }

  async deletePricePeriod(id: number): Promise<boolean> {
    return await this.pricePeriodRepository.delete(id);
  }

  async deletePricePeriodsByProductId(productId: number): Promise<boolean> {
    return await this.pricePeriodRepository.deleteByProductId(productId);
  }

  async calculatePriceForDateRange(
    productId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Récupérer les périodes qui se chevauchent avec l'intervalle demandé
    const periods = await this.pricePeriodRepository.findActivePeriodsForDateRange(
      productId,
      startDate,
      endDate
    );

    // Récupérer le produit pour le prix de base
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // Normaliser les dates à minuit (ignorer les heures) pour éviter les problèmes de fuseau horaire
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    let totalPrice = 0;
    const dayMs = 1000 * 60 * 60 * 24;

    // Pré-calculer les périodes avec bornes jour-complètes
    const normalizedPeriods = periods.map((period) => {
      const pStart = new Date(period.startDate);
      pStart.setHours(0, 0, 0, 0);
      const pEndExclusive = new Date(period.endDate);
      pEndExclusive.setHours(0, 0, 0, 0);
      // rendre la borne de fin exclusive en ajoutant 1 jour
      pEndExclusive.setDate(pEndExclusive.getDate() + 1);
      return { ...period, pStart, pEndExclusive };
    });

    // Interface pour les périodes normalisées
    interface NormalizedPeriod extends PricePeriod {
      pStart: Date;
      pEndExclusive: Date;
    }

    // Itérer nuit par nuit sur l'intervalle demandé et sommer prix période ou prix de base
    for (
      let current = new Date(start);
      current < end;
      current = new Date(current.getTime() + dayMs)
    ) {
      const applicable = (normalizedPeriods as NormalizedPeriod[]).find(
        (period: NormalizedPeriod) =>
          current.getTime() >= period.pStart.getTime() &&
          current.getTime() < period.pEndExclusive.getTime()
      );

      if (applicable) {
        totalPrice += Number(applicable.price);
      } else {
        totalPrice += Number(product.price);
      }
    }

    return totalPrice;
  }

  private periodsOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }
}
