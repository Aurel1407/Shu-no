import { PricePeriodService } from './PricePeriodService';
import { PricePeriodRepository } from '../repositories/PricePeriodRepository';
import { ProductService } from './ProductService';

describe('PricePeriodService', () => {
  let pricePeriodService: PricePeriodService;
  let mockPricePeriodRepository: jest.Mocked<PricePeriodRepository>;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Créer des mocks manuellement
    mockPricePeriodRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByProductId: jest.fn(),
      findActivePeriodsForDateRange: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByProductId: jest.fn(),
    } as any;

    mockProductService = {
      getProductById: jest.fn(),
    } as any;

    // Créer le service et injecter les mocks
    pricePeriodService = new PricePeriodService();
    (pricePeriodService as any).pricePeriodRepository = mockPricePeriodRepository;
    (pricePeriodService as any).productService = mockProductService;
  });

  describe('getAllPricePeriods', () => {
    it('should return all price periods', async () => {
      const mockPeriods = [
        { id: 1, productId: 1, price: 100, name: 'Summer' },
        { id: 2, productId: 1, price: 80, name: 'Fall' },
      ];
      mockPricePeriodRepository.findAll.mockResolvedValue(mockPeriods as any);

      const result = await pricePeriodService.getAllPricePeriods();

      expect(mockPricePeriodRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPeriods);
    });
  });

  describe('getPricePeriodById', () => {
    it('should return price period by id', async () => {
      const mockPeriod = { id: 1, productId: 1, price: 100, name: 'Summer' };
      mockPricePeriodRepository.findById.mockResolvedValue(mockPeriod as any);

      const result = await pricePeriodService.getPricePeriodById(1);

      expect(mockPricePeriodRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPeriod);
    });

    it('should return null if not found', async () => {
      mockPricePeriodRepository.findById.mockResolvedValue(null);

      const result = await pricePeriodService.getPricePeriodById(999);

      expect(result).toBeNull();
    });
  });

  describe('getPricePeriodsByProductId', () => {
    it('should return periods for product', async () => {
      const mockPeriods = [
        { id: 1, productId: 5, price: 100 },
        { id: 2, productId: 5, price: 120 },
      ];
      mockPricePeriodRepository.findByProductId.mockResolvedValue(mockPeriods as any);

      const result = await pricePeriodService.getPricePeriodsByProductId(5);

      expect(mockPricePeriodRepository.findByProductId).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockPeriods);
    });
  });

  describe('createPricePeriod', () => {
    it('should create a new price period', async () => {
      const pricePeriodData = {
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        price: 150,
        name: 'Summer',
      };
      const createdPeriod = { id: 1, ...pricePeriodData };

      mockPricePeriodRepository.findByProductId.mockResolvedValue([]);
      mockPricePeriodRepository.create.mockResolvedValue(createdPeriod as any);

      const result = await pricePeriodService.createPricePeriod(pricePeriodData);

      expect(mockPricePeriodRepository.findByProductId).toHaveBeenCalledWith(1);
      expect(mockPricePeriodRepository.create).toHaveBeenCalledWith(pricePeriodData);
      expect(result).toEqual(createdPeriod);
    });

    it('should throw error if start date is after end date', async () => {
      const pricePeriodData = {
        productId: 1,
        startDate: new Date('2025-08-31'),
        endDate: new Date('2025-06-01'),
        price: 150,
      };

      await expect(pricePeriodService.createPricePeriod(pricePeriodData)).rejects.toThrow(
        'La date de début doit être antérieure à la date de fin'
      );
    });

    it('should throw error if dates are equal', async () => {
      const sameDate = new Date('2025-06-01');
      const pricePeriodData = {
        productId: 1,
        startDate: sameDate,
        endDate: sameDate,
        price: 150,
      };

      await expect(pricePeriodService.createPricePeriod(pricePeriodData)).rejects.toThrow(
        'La date de début doit être antérieure à la date de fin'
      );
    });

    it('should throw error if period overlaps with existing period', async () => {
      const pricePeriodData = {
        productId: 1,
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-07-15'),
        price: 150,
      };

      const existingPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
        price: 100,
      };

      mockPricePeriodRepository.findByProductId.mockResolvedValue([existingPeriod as any]);

      await expect(pricePeriodService.createPricePeriod(pricePeriodData)).rejects.toThrow(
        'Cette période chevauche une période de prix existante'
      );
    });

    it('should not throw error if periods are adjacent but not overlapping', async () => {
      const pricePeriodData = {
        productId: 1,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-08-31'),
        price: 150,
      };

      const existingPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-06-30'),
        price: 100,
      };

      mockPricePeriodRepository.findByProductId.mockResolvedValue([existingPeriod as any]);
      mockPricePeriodRepository.create.mockResolvedValue({ id: 2, ...pricePeriodData } as any);

      const result = await pricePeriodService.createPricePeriod(pricePeriodData);

      expect(result).toBeDefined();
      expect(result.id).toBe(2);
    });
  });

  describe('updatePricePeriod', () => {
    it('should update price period successfully', async () => {
      const existingPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        price: 100,
      };

      const updateData = {
        price: 180,
        name: 'Updated Summer',
      };

      mockPricePeriodRepository.findById.mockResolvedValue(existingPeriod as any);
      mockPricePeriodRepository.findByProductId.mockResolvedValue([existingPeriod as any]);
      mockPricePeriodRepository.update.mockResolvedValue({ ...existingPeriod, ...updateData } as any);

      const result = await pricePeriodService.updatePricePeriod(1, updateData);

      expect(mockPricePeriodRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result.price).toBe(180);
    });

    it('should throw error if period not found', async () => {
      mockPricePeriodRepository.findById.mockResolvedValue(null);

      await expect(pricePeriodService.updatePricePeriod(999, { price: 180 })).rejects.toThrow(
        'Période de prix non trouvée'
      );
    });

    it('should throw error if updated dates are invalid', async () => {
      const existingPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        price: 100,
      };

      mockPricePeriodRepository.findById.mockResolvedValue(existingPeriod as any);

      await expect(
        pricePeriodService.updatePricePeriod(1, {
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-06-01'),
        })
      ).rejects.toThrow('La date de début doit être antérieure à la date de fin');
    });

    it('should throw error if updated period overlaps with another period', async () => {
      const existingPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-07-31'),
        price: 100,
      };

      const otherPeriod = {
        id: 2,
        productId: 1,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-09-30'),
        price: 120,
      };

      mockPricePeriodRepository.findById.mockResolvedValue(existingPeriod as any);
      mockPricePeriodRepository.findByProductId.mockResolvedValue([existingPeriod, otherPeriod] as any);

      await expect(
        pricePeriodService.updatePricePeriod(1, {
          endDate: new Date('2025-08-15'), // Chevauche otherPeriod
        })
      ).rejects.toThrow('Cette période chevauche une période de prix existante');
    });
  });

  describe('deletePricePeriod', () => {
    it('should delete price period successfully', async () => {
      mockPricePeriodRepository.delete.mockResolvedValue(true);

      const result = await pricePeriodService.deletePricePeriod(1);

      expect(mockPricePeriodRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if period not found', async () => {
      mockPricePeriodRepository.delete.mockResolvedValue(false);

      const result = await pricePeriodService.deletePricePeriod(999);

      expect(result).toBe(false);
    });
  });

  describe('deletePricePeriodsByProductId', () => {
    it('should delete all periods for a product', async () => {
      mockPricePeriodRepository.deleteByProductId.mockResolvedValue(true);

      const result = await pricePeriodService.deletePricePeriodsByProductId(5);

      expect(mockPricePeriodRepository.deleteByProductId).toHaveBeenCalledWith(5);
      expect(result).toBe(true);
    });
  });

  describe('calculatePriceForDateRange', () => {
    it('should calculate price using base price when no periods', async () => {
      const mockProduct = { id: 1, price: 100 };
      mockPricePeriodRepository.findActivePeriodsForDateRange.mockResolvedValue([]);
      mockProductService.getProductById.mockResolvedValue(mockProduct as any);

      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-06-05'); // 4 nights

      const result = await pricePeriodService.calculatePriceForDateRange(1, startDate, endDate);

      expect(result).toBe(400); // 4 nights * 100
    });

    it('should calculate price using custom period price', async () => {
      const mockProduct = { id: 1, price: 100 };
      const mockPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
        price: 150,
      };

      mockPricePeriodRepository.findActivePeriodsForDateRange.mockResolvedValue([mockPeriod as any]);
      mockProductService.getProductById.mockResolvedValue(mockProduct as any);

      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-06-05'); // 4 nights

      const result = await pricePeriodService.calculatePriceForDateRange(1, startDate, endDate);

      expect(result).toBe(600); // 4 nights * 150
    });

    it('should calculate mixed prices when period partially overlaps', async () => {
      const mockProduct = { id: 1, price: 100 };
      const mockPeriod = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-10'),
        price: 150,
      };

      mockPricePeriodRepository.findActivePeriodsForDateRange.mockResolvedValue([mockPeriod as any]);
      mockProductService.getProductById.mockResolvedValue(mockProduct as any);

      const startDate = new Date('2025-06-08');
      const endDate = new Date('2025-06-15'); // 7 nights: 3 at 150 (8-10), 4 at 100 (11-14)

      const result = await pricePeriodService.calculatePriceForDateRange(1, startDate, endDate);

      expect(result).toBe(850); // (3 * 150) + (4 * 100) = 450 + 400
    });

    it('should throw error if product not found', async () => {
      mockPricePeriodRepository.findActivePeriodsForDateRange.mockResolvedValue([]);
      mockProductService.getProductById.mockResolvedValue(null);

      await expect(
        pricePeriodService.calculatePriceForDateRange(999, new Date('2025-06-01'), new Date('2025-06-05'))
      ).rejects.toThrow('Produit non trouvé');
    });

    it('should handle multiple price periods correctly', async () => {
      const mockProduct = { id: 1, price: 100 };
      const period1 = {
        id: 1,
        productId: 1,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-10'),
        price: 120,
      };
      const period2 = {
        id: 2,
        productId: 1,
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-20'),
        price: 180,
      };

      mockPricePeriodRepository.findActivePeriodsForDateRange.mockResolvedValue([period1, period2] as any);
      mockProductService.getProductById.mockResolvedValue(mockProduct as any);

      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-06-21'); // 20 nights

      const result = await pricePeriodService.calculatePriceForDateRange(1, startDate, endDate);

      // 10 nights (1-10) at 120 = 1200
      // 4 nights (11-14) at 100 = 400
      // 6 nights (15-20) at 180 = 1080
      // Total = 2680
      expect(result).toBe(2680);
    });
  });
});
