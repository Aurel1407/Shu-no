import bcrypt from 'bcryptjs';
import { User } from '../../entities/User';
import { TestDataSource } from '../test-database';

export interface TestUserOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

const DEFAULT_PASSWORD = 'TestPassw0rd!';

export const createTestUser = async (options: TestUserOptions = {}): Promise<{ user: User; password: string }> => {
  if (!TestDataSource.isInitialized) {
    throw new Error('TestDataSource must be initialized before creating users');
  }

  const userRepository = TestDataSource.getRepository(User);
  const password = options.password ?? DEFAULT_PASSWORD;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = userRepository.create({
    email: options.email ?? `user_${Date.now()}@test.com`,
    firstName: options.firstName ?? 'Test',
    lastName: options.lastName ?? 'User',
    role: options.role ?? 'user',
    isActive: options.isActive ?? true,
    password: hashedPassword,
  });

  const savedUser = await userRepository.save(user);

  return { user: savedUser, password };
};

export const createAdminUser = async (options: TestUserOptions = {}): Promise<{ user: User; password: string }> => {
  return createTestUser({
    ...options,
    role: 'admin',
    email: options.email ?? 'admin@test.com',
    firstName: options.firstName ?? 'Admin',
    lastName: options.lastName ?? 'User',
  });
};
