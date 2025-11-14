import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Order } from '../entities/Order';
import { PricePeriod } from '../entities/PricePeriod';
import { Contact } from '../entities/Contact';
import { RefreshToken } from '../entities/RefreshToken';
import { createAdminUser, createTestUser } from './utils/test-users';

/**
 * Configuration de base de données dédiée aux tests
 * Utilise SQLite en mémoire pour les tests (plus rapide et isolé)
 */
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Base de données en mémoire
  
  // Configuration spécifique aux tests
  synchronize: true, // Recréer la structure à chaque run
  dropSchema: true,  // Nettoyer avant chaque run
  logging: false,    // Pas de logs SQL en test
  
  entities: [User, Product, Order, PricePeriod, Contact, RefreshToken],
});

/**
 * Helper pour nettoyer la base de données entre les tests
 */
export const cleanDatabase = async (): Promise<void> => {
  if (!TestDataSource.isInitialized) return;

  const entities = TestDataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = TestDataSource.getRepository(entity.name);
    await repository.clear();
  }
};

/**
 * Helper pour créer des données de test
 */
export const seedTestData = async () => {
  const productRepository = TestDataSource.getRepository(Product);

  // Créer des utilisateurs de test avec de vrais mots de passe hashés
  const { user: adminUser, password: adminPassword } = await createAdminUser({
    email: 'admin@test.com',
  });

  const { user: normalUser, password: normalPassword } = await createTestUser({
    email: 'user@test.com',
  });

  // Créer des produits de test
  const product1 = productRepository.create({
    name: 'Villa Test 1',
    description: 'Une villa de test pour les tests',
    price: 120,
    location: 'Test Location',
    address: '123 Rue Test',
    city: 'Test City',
    postalCode: '12345',
    maxGuests: 6,
    amenities: ['WiFi', 'Parking'],
    isActive: true,
  });
  await productRepository.save(product1);

  const product2 = productRepository.create({
    name: 'Gîte Test 2',
    description: 'Un gîte de test pour les tests',
    price: 95,
    location: 'Test Location 2',
    address: '456 Avenue Test',
    city: 'Test City 2',
    postalCode: '67890',
    maxGuests: 4,
    amenities: ['WiFi', 'Jardin'],
    isActive: true,
  });
  await productRepository.save(product2);

  return {
    adminUser,
    normalUser,
    adminPassword,
    normalPassword,
    products: [product1, product2],
  };
};
