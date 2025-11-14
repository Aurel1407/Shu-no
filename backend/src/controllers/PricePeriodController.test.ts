import { Request, Response } from 'express';
import { PricePeriodController } from './PricePeriodController';
import { PricePeriodService } from '../services/PricePeriodService';

describe('PricePeriodController', () => {
  let pricePeriodController: PricePeriodController;
  let mockPricePeriodService: jest.Mocked<PricePeriodService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock PricePeriodService
    mockPricePeriodService = {
      getAllPricePeriods: jest.fn(),
      getPricePeriodById: jest.fn(),
      getPricePeriodsByProductId: jest.fn(),
      createPricePeriod: jest.fn(),
      updatePricePeriod: jest.fn(),
      deletePricePeriod: jest.fn(),
      calculatePriceForDateRange: jest.fn(),
    } as any;

    // Mock Request and Response
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({
      json: jsonMock,
      send: sendMock,
    });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockRequest = {
      params: {},
      body: {},
      query: {},
    };

    // Créer le controller et injecter le mock
    pricePeriodController = new PricePeriodController();
    (pricePeriodController as any).pricePeriodService = mockPricePeriodService;
  });

  it('should be defined', () => {
    expect(new PricePeriodController()).toBeDefined();
  });

  describe('getAllPricePeriods', () => {
    it('should return all price periods', async () => {
      const mockPricePeriods = [
        { id: 1, productId: 1, price: 100, startDate: '2025-06-01', endDate: '2025-08-31', name: 'Summer' },
        { id: 2, productId: 1, price: 80, startDate: '2025-09-01', endDate: '2025-11-30', name: 'Fall' },
      ];
      mockPricePeriodService.getAllPricePeriods.mockResolvedValue(mockPricePeriods as any);

      await pricePeriodController.getAllPricePeriods(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.getAllPricePeriods).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockPricePeriods);
    });

    it('should handle errors', async () => {
      mockPricePeriodService.getAllPricePeriods.mockRejectedValue(new Error('Database error'));

      await pricePeriodController.getAllPricePeriods(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération des périodes de prix' });
    });
  });

  describe('getPricePeriodById', () => {
    it('should return price period by id', async () => {
      const mockPricePeriod = { id: 1, productId: 1, price: 100, name: 'Summer' };
      mockRequest.params = { id: '1' };
      mockPricePeriodService.getPricePeriodById.mockResolvedValue(mockPricePeriod as any);

      await pricePeriodController.getPricePeriodById(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.getPricePeriodById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockPricePeriod);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await pricePeriodController.getPricePeriodById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID invalide' });
    });

    it('should return 404 if price period not found', async () => {
      mockRequest.params = { id: '999' };
      mockPricePeriodService.getPricePeriodById.mockResolvedValue(null);

      await pricePeriodController.getPricePeriodById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Période de prix non trouvée' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      mockPricePeriodService.getPricePeriodById.mockRejectedValue(new Error('Error'));

      await pricePeriodController.getPricePeriodById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération de la période de prix' });
    });
  });

  describe('getPricePeriodsByProductId', () => {
    it('should return price periods by product id', async () => {
      const mockPricePeriods = [
        { id: 1, productId: 5, price: 100 },
        { id: 2, productId: 5, price: 120 },
      ];
      mockRequest.params = { productId: '5' };
      mockPricePeriodService.getPricePeriodsByProductId.mockResolvedValue(mockPricePeriods as any);

      await pricePeriodController.getPricePeriodsByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.getPricePeriodsByProductId).toHaveBeenCalledWith(5);
      expect(jsonMock).toHaveBeenCalledWith(mockPricePeriods);
    });

    it('should return 400 for invalid product id', async () => {
      mockRequest.params = { productId: 'invalid' };

      await pricePeriodController.getPricePeriodsByProductId(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID produit invalide' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { productId: '5' };
      mockPricePeriodService.getPricePeriodsByProductId.mockRejectedValue(new Error('Error'));

      await pricePeriodController.getPricePeriodsByProductId(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('createPricePeriod', () => {
    it('should create a new price period', async () => {
      const pricePeriodData = {
        productId: 1,
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        price: 150,
        name: 'High Season',
      };
      const createdPricePeriod = { id: 1, ...pricePeriodData };
      mockRequest.body = pricePeriodData;
      mockPricePeriodService.createPricePeriod.mockResolvedValue(createdPricePeriod as any);

      await pricePeriodController.createPricePeriod(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.createPricePeriod).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 1,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          price: 150,
          name: 'High Season',
        })
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdPricePeriod);
    });

    it('should return 400 for missing productId', async () => {
      mockRequest.body = { startDate: '2025-06-01', endDate: '2025-08-31', price: 150 };

      await pricePeriodController.createPricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Paramètres invalides' });
    });

    it('should return 400 for invalid dates', async () => {
      mockRequest.body = {
        productId: 1,
        startDate: 'invalid-date',
        endDate: '2025-08-31',
        price: 150,
      };

      await pricePeriodController.createPricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Paramètres invalides' });
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        productId: 1,
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        price: 150,
      };
      mockPricePeriodService.createPricePeriod.mockRejectedValue(new Error('Overlap detected'));

      await pricePeriodController.createPricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Overlap detected' });
    });
  });

  describe('updatePricePeriod', () => {
    it('should update price period successfully', async () => {
      const updateData = {
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        price: 180,
        name: 'Updated Season',
      };
      const updatedPricePeriod = { id: 1, productId: 1, ...updateData };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockPricePeriodService.updatePricePeriod.mockResolvedValue(updatedPricePeriod as any);

      await pricePeriodController.updatePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.updatePricePeriod).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          price: 180,
          name: 'Updated Season',
        })
      );
      expect(jsonMock).toHaveBeenCalledWith(updatedPricePeriod);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { price: 180 };

      await pricePeriodController.updatePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID invalide' });
    });

    it('should return 400 for invalid start date', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { startDate: 'invalid-date' };

      await pricePeriodController.updatePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Date de début invalide' });
    });

    it('should return 400 for invalid end date', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { endDate: 'invalid-date' };

      await pricePeriodController.updatePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Date de fin invalide' });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { price: 180 };
      mockPricePeriodService.updatePricePeriod.mockRejectedValue(new Error('Update failed'));

      await pricePeriodController.updatePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  describe('deletePricePeriod', () => {
    it('should delete price period successfully', async () => {
      mockRequest.params = { id: '1' };
      mockPricePeriodService.deletePricePeriod.mockResolvedValue(true);

      await pricePeriodController.deletePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.deletePricePeriod).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should return 400 for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await pricePeriodController.deletePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID invalide' });
    });

    it('should return 404 if price period not found', async () => {
      mockRequest.params = { id: '999' };
      mockPricePeriodService.deletePricePeriod.mockResolvedValue(false);

      await pricePeriodController.deletePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Période de prix non trouvée' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: '1' };
      mockPricePeriodService.deletePricePeriod.mockRejectedValue(new Error('Error'));

      await pricePeriodController.deletePricePeriod(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors de la suppression de la période de prix' });
    });
  });

  describe('calculatePriceForDateRange', () => {
    it('should calculate price for date range', async () => {
      mockRequest.params = { productId: '1' };
      mockRequest.query = { startDate: '2025-06-01', endDate: '2025-06-10' };
      mockPricePeriodService.calculatePriceForDateRange.mockResolvedValue(900);

      await pricePeriodController.calculatePriceForDateRange(mockRequest as Request, mockResponse as Response);

      expect(mockPricePeriodService.calculatePriceForDateRange).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        expect.any(Date)
      );
      expect(jsonMock).toHaveBeenCalledWith({ totalPrice: 900 });
    });

    it('should return 400 for invalid product id', async () => {
      mockRequest.params = { productId: 'invalid' };
      mockRequest.query = { startDate: '2025-06-01', endDate: '2025-06-10' };

      await pricePeriodController.calculatePriceForDateRange(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Paramètres invalides' });
    });

    it('should return 400 for invalid dates', async () => {
      mockRequest.params = { productId: '1' };
      mockRequest.query = { startDate: 'invalid', endDate: '2025-06-10' };

      await pricePeriodController.calculatePriceForDateRange(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Paramètres invalides' });
    });

    it('should handle errors', async () => {
      mockRequest.params = { productId: '1' };
      mockRequest.query = { startDate: '2025-06-01', endDate: '2025-06-10' };
      mockPricePeriodService.calculatePriceForDateRange.mockRejectedValue(new Error('Calculation error'));

      await pricePeriodController.calculatePriceForDateRange(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Erreur lors du calcul du prix' });
    });
  });
});

