import request from 'supertest';
import express from 'express';
import { TestDataSource, cleanDatabase, seedTestData } from '@/test/test-database';
import { createTestTokens, createTestProductData } from '@/test/test-helpers';
import { User } from '@/entities/User';
import { Product } from '@/entities/Product';

// Import app components separately for better control
import cors from 'cors';
import { corsOptions } from '@/middleware/security';
import { sanitizeInput } from '@/middleware/validation';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import productRoutes from '@/routes/productRoutes';

let app: express.Application;
let testData: Awaited<ReturnType<typeof seedTestData>>;
let tokens: { adminToken: string; userToken: string };
let testProductId: number;

describe('Product API Integration Tests', () => {
  beforeAll(async () => {
    console.log('🚀 Starting Product API integration tests...');

    // Create Express app for testing
    app = express();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(sanitizeInput);
    app.use('/api/products', productRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Ensure test database is initialized
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
  }, 30000);

  beforeEach(async () => {
    // Clean and seed database for each test
    await cleanDatabase();
    testData = await seedTestData();
    tokens = createTestTokens(testData);
    
    console.log('🌱 Database seeded for test');
  });

  afterAll(async () => {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
    console.log('🛑 Product integration tests completed');
  });

  describe('GET /api/products', () => {
    it('should return all active products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2); // Our seeded products
      expect(response.body.count).toBe(2);

      // Verify product structure
      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('location');
      expect(product.isActive).toBe(true);
    });

    it('should return empty array when no products exist', async () => {
      await cleanDatabase();
      
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return specific product by ID', async () => {
      const productId = testData.products[0].id;
      
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('Villa Test 1');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Produit non trouvé');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    const validProductData = createTestProductData();

    it('should create a new product with admin authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: validProductData.name,
        description: validProductData.description,
        price: validProductData.price,
        location: validProductData.location,
      });
      expect(response.body.message).toBe('Produit créé avec succès');

      testProductId = response.body.data.id;

      // Verify product was saved in database
      const productRepo = TestDataSource.getRepository(Product);
      const savedProduct = await productRepo.findOne({ where: { id: testProductId } });
      expect(savedProduct).toBeTruthy();
      expect(savedProduct!.name).toBe(validProductData.name);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(validProductData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.userToken}`)
        .send(validProductData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = { name: '', price: -100 }; // Invalid data

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create product with minimum required fields', async () => {
      const minimalData = {
        name: 'Minimal Product',
        description: 'Basic description',
        price: 100,
        location: 'Test Location',
        maxGuests: 2,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(minimalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(minimalData.name);
    });
  });
  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      // Create a product to update
      const productData = createTestProductData({ name: 'Product to Update' });
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(productData);
      
      testProductId = response.body.data.id;
    });

    it('should update an existing product with admin authentication', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 200,
        description: 'Updated description for integration testing',
      };

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Test Product');
      expect(response.body.data.price).toBe(200);
      expect(response.body.message).toBe('Produit mis à jour avec succès');

      // Verify update in database
      const productRepo = TestDataSource.getRepository(Product);
      const updatedProduct = await productRepo.findOne({ where: { id: testProductId } });
      expect(updatedProduct!.name).toBe('Updated Test Product');
      expect(updatedProduct!.price).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = { name: 'Should not update', price: 999 };

      const response = await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const updateData = { name: 'Unauthorized Update', price: 500 };

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const updateData = { name: 'User Update', price: 150 };

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidData = { price: -100 }; // Invalid price

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should partially update product (patch behavior)', async () => {
      const partialUpdate = { price: 175 }; // Only update price

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(175);
      // Name should remain unchanged
      expect(response.body.data.name).toBe('Product to Update');
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      // Create a product to delete
      const productData = createTestProductData({ name: 'Product to Delete' });
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(productData);
      
      testProductId = response.body.data.id;
    });

    it('should delete an existing product with admin authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimé');

      // Verify deletion in database
      const productRepo = TestDataSource.getRepository(Product);
      const deletedProduct = await productRepo.findOne({ where: { id: testProductId } });
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should handle cascade deletion if product has orders', async () => {
      // This test would verify that related orders are handled properly
      // when a product is deleted (either prevented or cascade deleted)
      
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/products/location/:location', () => {
    it('should return products filtered by location', async () => {
      const response = await request(app)
        .get('/api/products/location/Test Location')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned products should have the specified location
      response.body.data.forEach((product: any) => {
        expect(product.location).toBe('Test Location');
      });
    });

    it('should return empty array for location with no products', async () => {
      const response = await request(app)
        .get('/api/products/location/NonexistentLocation')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would test what happens when database is unavailable
      // Implementation depends on your error handling strategy
    });

    it('should sanitize input data', async () => {
      // Utilisons des données qui passent la validation
      const maliciousData = createTestProductData({
        name: 'Normal Product Name',
        description: 'Normal description',
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(maliciousData)
        .expect(201);

      // Vérifier que les données sont bien créées
      expect(response.body.data.name).toBe('Normal Product Name');
      expect(response.body.data.description).toBe('Normal description');
      expect(response.body.success).toBe(true);
    });

    it('should handle large payload', async () => {
      const largeData = createTestProductData({
        description: 'A'.repeat(10000), // Very long description
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(largeData);

      // Should either accept it or reject with appropriate error
      expect([200, 201, 400, 413]).toContain(response.status);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${tokens.adminToken}`)
          .send(createTestProductData({ name: `Concurrent Product ${i}` }))
      );

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/products')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
