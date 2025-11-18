import { generateToken } from '../utils/auth';
import { User } from '../entities/User';

export interface TestUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName: string;
}

/**
 * Helper pour générer des tokens JWT de test
 */
export const createTestTokens = (users: { adminUser: User; normalUser: User }) => {
  const adminToken = generateToken({
    id: users.adminUser.id,
    email: users.adminUser.email,
    role: users.adminUser.role,
  } as { id: number; email: string; role: string });

  const userToken = generateToken({
    id: users.normalUser.id,
    email: users.normalUser.email,
    role: users.normalUser.role,
  } as { id: number; email: string; role: string });

  return { adminToken, userToken };
};

/**
 * Helper pour créer des données de produit de test
 */
export const createTestProductData = (overrides = {}) => ({
  name: 'Test Product',
  description: 'A test product for integration testing',
  price: 150,
  location: 'Test Location',
  address: '123 Test Street',
  city: 'Test City',
  postalCode: '12345',
  maxGuests: 4,
  amenities: ['WiFi', 'Parking'],
  ...overrides,
});

/**
 * Helper pour créer des données d'utilisateur de test
 */
export const createTestUserData = (overrides = {}) => ({
  email: `user-${Date.now()}-${Math.random().toString(36).substring(2)}@test.com`,
  password: 'testPassword123!',
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
});

/**
 * Helper pour créer des données de commande de test
 */
export const createTestOrderData = (productId: number, overrides = {}) => ({
  productId,
  checkIn: '2024-07-15',
  checkOut: '2024-07-20',
  guests: 2,
  totalPrice: 750,
  status: 'pending',
  ...overrides,
});
