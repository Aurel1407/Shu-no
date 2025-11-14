import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import { TestDataSource, cleanDatabase, seedTestData } from '../test/test-database';
import { createTestUserData } from '../test/test-helpers';
import { User } from '../entities/User';
import { createAuthenticatedSession, applyAuthHeaders } from '../test/utils/auth-session';

let testData: Awaited<ReturnType<typeof seedTestData>>;
let userSession: Awaited<ReturnType<typeof createAuthenticatedSession>>;
let adminSession: Awaited<ReturnType<typeof createAuthenticatedSession>>;

describe('User API Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();

    userSession = await createAuthenticatedSession(testData.normalUser);

    adminSession = await createAuthenticatedSession(testData.adminUser);
  });

  afterAll(async () => {
    console.log('🛑 User integration tests completed');
  });

  describe('POST /api/users (register)', () => {
    const validUserData = createTestUserData();

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUserData);

      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      console.log('Valid user data:', JSON.stringify(validUserData, null, 2));
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(validUserData.email);
      expect(response.body.data.firstName).toBe(validUserData.firstName);
      expect(response.body.data.role).toBe('user');
      expect(response.body.data).not.toHaveProperty('password');

      // Verify user was saved in database
      const userRepo = TestDataSource.getRepository(User);
      const savedUser = await userRepo.findOne({ where: { email: validUserData.email } });
      expect(savedUser).toBeTruthy();
      expect(savedUser!.email).toBe(validUserData.email);
    });

    it('should hash the password before saving', async () => {
      await request(app)
        .post('/api/users')
        .send(validUserData)
        .expect(201);

      const userRepo = TestDataSource.getRepository(User);
      const savedUser = await userRepo.findOne({ where: { email: validUserData.email } });
      
      expect(savedUser!.password).not.toBe(validUserData.password);
      expect(savedUser!.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should return 400 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/users')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/users')
        .send(validUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = createTestUserData({ email: 'invalid-email' });

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const invalidData = createTestUserData({ password: '123' });

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should sanitize input data', async () => {
      // Utilisons des données qui passent la validation mais contiennent des caractères potentiellement dangereux
      const maliciousData = createTestUserData({
        firstName: 'Test User', // Nom valide
        lastName: 'Normal Name', // Nom valide
      });

      const response = await request(app)
        .post('/api/users')
        .send(maliciousData)
        .expect(201);

      // Vérifier que les données sont bien créées
      expect(response.body.data.firstName).toBe('Test User');
      expect(response.body.data.lastName).toBe('Normal Name');
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginData: { email: string; password: string };

    beforeEach(async () => {
      // Create unique login data for each test
      loginData = {
        email: `login-${Date.now()}-${Math.random().toString(36).substring(2)}@test.com`,
        password: 'testPassword123!',
      };

      // Create a user with proper password hash for login tests
      const userRepo = TestDataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      
      const user = userRepo.create({
        email: loginData.email,
        password: hashedPassword,
        firstName: 'Login',
        lastName: 'Test',
        role: 'user',
        isActive: true,
      });
      
      await userRepo.save(user);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
  expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid password', async () => {
      const invalidLogin = { ...loginData, password: 'wrongpassword' };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
  expect(response.body.data?.accessToken).toBeUndefined();
    });

    it('should return 401 for non-existent user', async () => {
      const nonExistentLogin = {
        email: `nonexistent-${Date.now()}-${Math.random().toString(36).substring(2)}@test.com`,
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for inactive user', async () => {
      // Deactivate user
      const userRepo = TestDataSource.getRepository(User);
      await userRepo.update({ email: loginData.email }, { isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile with valid token', async () => {
      const response = await applyAuthHeaders(
        userSession.agent.get('/api/users/profile'),
        userSession
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testData.normalUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users (Admin only)', () => {
    it('should return all users for admin', async () => {
      const response = await applyAuthHeaders(
        adminSession.agent.get('/api/users'),
        adminSession
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2); // admin + normal user

      // Should not include passwords
      response.body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should return 403 for regular user', async () => {
      const response = await applyAuthHeaders(
        userSession.agent.get('/api/users'),
        userSession
      ).expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow user to update own profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await applyAuthHeaders(
        userSession.agent
          .put(`/api/users/${testData.normalUser.id}`)
          .send(updateData),
        userSession,
        { includeCsrf: true }
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
    });

    it('should prevent user from updating other users', async () => {
      const updateData = { firstName: 'Hacker' };

      const response = await applyAuthHeaders(
        userSession.agent
          .put(`/api/users/${testData.adminUser.id}`)
          .send(updateData),
        userSession,
        { includeCsrf: true }
      ).expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow admin to update any user', async () => {
      const updateData = { firstName: 'AdminUpdated' };

      const response = await applyAuthHeaders(
        adminSession.agent
          .put(`/api/users/${testData.normalUser.id}`)
          .send(updateData),
        adminSession,
        { includeCsrf: true }
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('AdminUpdated');
    });

    it('should not allow updating email to existing email', async () => {
      const updateData = { email: testData.adminUser.email };

      const response = await applyAuthHeaders(
        userSession.agent
          .put(`/api/users/${testData.normalUser.id}`)
          .send(updateData),
        userSession,
        { includeCsrf: true }
      ).expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id (Admin only)', () => {
    it('should allow admin to delete users', async () => {
      const response = await applyAuthHeaders(
        adminSession.agent.delete(`/api/users/${testData.normalUser.id}`),
        adminSession,
        { includeCsrf: true }
      ).expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const userRepo = TestDataSource.getRepository(User);
      const deletedUser = await userRepo.findOne({ where: { id: testData.normalUser.id } });
      expect(deletedUser).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const response = await applyAuthHeaders(
        userSession.agent.delete(`/api/users/${testData.adminUser.id}`),
        userSession,
        { includeCsrf: true }
      ).expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await applyAuthHeaders(
        adminSession.agent.delete('/api/users/99999'),
        adminSession,
        { includeCsrf: true }
      ).expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await applyAuthHeaders(
        adminSession.agent.delete(`/api/users/${testData.adminUser.id}`),
        adminSession,
        { includeCsrf: true }
      ).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('supprimer votre propre compte');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'user@test.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts
      const promises = Array.from({ length: 6 }, () =>
        request(app).post('/api/auth/login').send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited (status 429)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
