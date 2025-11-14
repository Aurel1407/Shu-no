/**
 * Test de compression HTTP
 *
 * Ce script teste que la compression gzip/brotli fonctionne correctement
 * sur les réponses de l'API.
 */

import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../config/database';

describe('HTTP Compression Middleware', () => {
  // Connexion à la base de données avant les tests
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  // Fermeture de la connexion après les tests
  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Compression activation', () => {
    it('should compress JSON responses when Accept-Encoding: gzip is set', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Vérifier que la réponse est compressée
      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should compress large JSON responses', async () => {
      const response = await request(app).get('/api/products').set('Accept-Encoding', 'gzip');

      // Si la réponse fait plus de 1KB, elle devrait être compressée
      const bodySize = JSON.stringify(response.body).length;
      if (bodySize > 1024) {
        expect(response.headers['content-encoding']).toBe('gzip');
      }
    });
  });

  describe('Compression threshold', () => {
    it('should NOT compress small responses (< 1KB)', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Health check est petit (< 1KB), ne devrait pas être compressé
      const bodySize = JSON.stringify(response.body).length;
      if (bodySize < 1024) {
        // Peut être undefined ou pas de content-encoding
        expect(response.headers['content-encoding']).toBeUndefined();
      }
    });
  });

  describe('Compression opt-out', () => {
    it('should NOT compress when x-no-compression header is present', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'gzip')
        .set('x-no-compression', 'true')
        .expect(200);

      // Compression désactivée par le header
      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('Multiple encoding support', () => {
    it('should support gzip encoding', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should support deflate encoding', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'deflate')
        .expect(200);

      // Deflate peut être retourné ou gzip (selon l'implémentation)
      expect(['gzip', 'deflate']).toContain(response.headers['content-encoding']);
    });

    it('should prioritize brotli if available', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'br, gzip, deflate')
        .expect(200);

      // Brotli (br) est prioritaire si supporté
      // Sinon gzip
      expect(['br', 'gzip']).toContain(response.headers['content-encoding']);
    });
  });

  describe('Content-Type specific compression', () => {
    it('should compress application/json responses', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should not compress if no Accept-Encoding header', async () => {
      const response = await request(app)
        .get('/api/products')
        // Pas de header Accept-Encoding
        .expect(200);

      // Pas de compression sans Accept-Encoding
      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('Compression performance', () => {
    it('should compress and reduce response size significantly', async () => {
      // Requête sans compression
      const uncompressedResponse = await request(app).get('/api/products').expect(200);

      const uncompressedSize = JSON.stringify(uncompressedResponse.body).length;

      // Requête avec compression
      const compressedResponse = await request(app)
        .get('/api/products')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      const compressedSize = Number.parseInt(compressedResponse.headers['content-length'] || '0');

      // La compression devrait réduire la taille d'au moins 50% pour du JSON
      if (uncompressedSize > 1024) {
        const ratio = (1 - compressedSize / uncompressedSize) * 100;
        console.log(`Compression ratio: ${ratio.toFixed(2)}%`);

        // Vérifier qu'on a au moins 50% de réduction
        expect(ratio).toBeGreaterThan(50);
      }
    });
  });
});
