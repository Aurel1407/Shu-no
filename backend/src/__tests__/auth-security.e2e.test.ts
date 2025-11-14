import request from 'supertest';
import app from '../app';
import { TestDataSource, cleanDatabase } from '../test/test-database';
import { createAdminUser, createTestUser } from '../test/utils/test-users';
import { createAuthenticatedSession, applyAuthHeaders } from '../test/utils/auth-session';
import { RefreshToken } from '../entities/RefreshToken';

const AUTH_HEADER = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('Authentication, roles and CSRF protection (e2e)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('authenticates an active user and returns sanitized payload with tokens', async () => {
    const { user, password } = await createTestUser({ email: 'login-user@test.com' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toMatchObject({
      id: user.id,
      email: user.email,
      role: 'user',
    });
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(typeof response.body.data.accessToken).toBe('string');
    expect(typeof response.body.data.refreshToken).toBe('string');

    const refreshTokenCount = await TestDataSource.getRepository(RefreshToken).count();
    expect(refreshTokenCount).toBe(1);
  });

  it('rejects invalid credentials with 401 error', async () => {
    const { user } = await createTestUser({ email: 'wrong-password@test.com' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'TotallyWrongPassword!' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error || response.body.message).toBeDefined();
  });

  it('issues a new access token when refresh token is valid', async () => {
    const { user, password } = await createTestUser({ email: 'refresh-user@test.com' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const refreshResponse = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: loginResponse.body.data.refreshToken })
      .expect(200);

    expect(refreshResponse.body.success).toBe(true);
    expect(typeof refreshResponse.body.data.accessToken).toBe('string');
    expect(refreshResponse.body.data.user).toMatchObject({ id: user.id, email: user.email });
  });

  it('enforces admin-only access on protected routes', async () => {
    const { user: adminUser, password: adminPassword } = await createAdminUser({
      email: 'role-admin@test.com',
    });
    const { user: normalUser, password: normalPassword } = await createTestUser({
      email: 'role-user@test.com',
    });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: normalUser.email, password: normalPassword })
      .expect(200);

    await request(app)
      .get('/api/users')
      .set(AUTH_HEADER(userLogin.body.data.accessToken))
      .expect(403);

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminPassword })
      .expect(200);

    const adminResponse = await request(app)
      .get('/api/users')
      .set(AUTH_HEADER(adminLogin.body.data.accessToken))
      .expect(200);

    expect(adminResponse.body.success).toBe(true);
    expect(Array.isArray(adminResponse.body.data)).toBe(true);
    expect(adminResponse.body.count).toBeGreaterThanOrEqual(2);
  });

  it('rejects state-changing requests without CSRF token', async () => {
    const { user, password } = await createTestUser({ email: 'csrf-missing@test.com' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    await request(app)
      .put(`/api/users/${user.id}`)
      .set(AUTH_HEADER(login.body.data.accessToken))
      .send({ firstName: 'Hacker' })
      .expect(403);
  });

  it('accepts state-changing requests when a valid CSRF token is supplied', async () => {
    const { user } = await createTestUser({ email: 'csrf-valid@test.com' });
    const session = await createAuthenticatedSession(user);

    const profileResponse = await applyAuthHeaders(
      session.agent.get('/api/users/profile'),
      session
    ).expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.email).toBe(user.email);

    const updateResponse = await applyAuthHeaders(
      session.agent.put(`/api/users/${user.id}`).send({ firstName: 'Updated' }),
      session,
      { includeCsrf: true }
    ).expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.firstName).toBe('Updated');
  });
});
