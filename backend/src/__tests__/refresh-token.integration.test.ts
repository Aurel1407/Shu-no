import request from 'supertest';
import app from '../app';
import { cleanDatabase, TestDataSource } from '../test/test-database';
import { createTestUser } from '../test/utils/test-users';
import { createAuthenticatedSession, applyAuthHeaders } from '../test/utils/auth-session';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { RefreshToken } from '../entities/RefreshToken';

const getRefreshTokenRepository = () => TestDataSource.getRepository(RefreshToken);

describe('Refresh token lifecycle integration', () => {
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    await cleanDatabase();
    refreshTokenService = new RefreshTokenService();
  });

  it('rotates a refresh token and revokes the previous token', async () => {
    const { user } = await createTestUser({ email: 'rotate-flow@test.com' });
    const originalToken = await refreshTokenService.generateRefreshToken(user.id, '127.0.0.1', 'jest-agent');

    const response = await request(app)
      .post('/api/auth/rotate-token')
      .send({ refreshToken: originalToken.token })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data?.refreshToken).toBe('string');

    const repo = getRefreshTokenRepository();
    const storedOriginal = await repo.findOne({ where: { token: originalToken.token } });
    const storedNew = await repo.findOne({ where: { token: response.body.data.refreshToken } });

    expect(storedOriginal?.isRevoked).toBe(true);
    expect(storedNew).toBeTruthy();
    expect(storedNew?.isRevoked).toBe(false);
    expect(storedNew?.userId).toBe(user.id);
  });

  it('rejects rotation when refresh token is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/rotate-token')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('invalide');
  });

  it('revokes a specific refresh token', async () => {
    const { user } = await createTestUser({ email: 'revoke-one@test.com' });
    const refreshToken = await refreshTokenService.generateRefreshToken(user.id);

    const response = await request(app)
      .post('/api/auth/revoke-token')
      .send({ token: refreshToken.token })
      .expect(200);

    expect(response.body.success).toBe(true);

    const storedToken = await getRefreshTokenRepository().findOne({ where: { token: refreshToken.token } });
    expect(storedToken?.isRevoked).toBe(true);
  });

  it('returns 404 when revoking a non-existent refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/revoke-token')
      .send({ token: 'non-existent-token' })
      .expect(404);

    expect(response.body.success).toBe(false);
  });

  it('revokes all refresh tokens for the authenticated user', async () => {
    const { user } = await createTestUser({ email: 'revoke-all@test.com' });
    await refreshTokenService.generateRefreshToken(user.id);
    await refreshTokenService.generateRefreshToken(user.id);

    const session = await createAuthenticatedSession(user);

    const response = await applyAuthHeaders(
      session.agent.post('/api/auth/revoke-all-tokens'),
      session,
      { includeCsrf: true }
    ).expect(200);

    expect(response.body.success).toBe(true);

    const activeTokens = await refreshTokenService.getUserActiveTokens(user.id);
    expect(activeTokens).toHaveLength(0);
  });

  it('lists active refresh tokens for the authenticated user', async () => {
    const { user } = await createTestUser({ email: 'active-tokens@test.com' });
    const tokens = await Promise.all([
      refreshTokenService.generateRefreshToken(user.id, '127.0.0.1', 'jest-agent-1'),
      refreshTokenService.generateRefreshToken(user.id, '127.0.0.1', 'jest-agent-2'),
    ]);

    const session = await createAuthenticatedSession(user);

    const response = await applyAuthHeaders(
      session.agent.get('/api/auth/active-tokens'),
      session
    ).expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(tokens.length);
    expect(response.body.count).toBe(tokens.length);

    const tokenPreview = response.body.data[0]?.tokenPreview as string | undefined;
    expect(tokenPreview).toBeDefined();
    expect(tokenPreview?.endsWith('...')).toBe(true);
  });

  it('revokes a refresh token when logging out', async () => {
    const { user } = await createTestUser({ email: 'logout-flow@test.com' });
    const refreshToken = await refreshTokenService.generateRefreshToken(user.id);

    const response = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: refreshToken.token })
      .expect(200);

    expect(response.body.success).toBe(true);

    const storedToken = await getRefreshTokenRepository().findOne({ where: { token: refreshToken.token } });
    expect(storedToken?.isRevoked).toBe(true);
  });
});
