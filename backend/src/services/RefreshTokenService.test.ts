import { RefreshTokenService } from '../services/RefreshTokenService';
import { cleanDatabase, TestDataSource } from '../test/test-database';
import { createTestUser } from '../test/utils/test-users';
import { RefreshToken } from '../entities/RefreshToken';

const getRefreshTokenRepository = () => TestDataSource.getRepository(RefreshToken);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('RefreshTokenService maintenance behaviors', () => {
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    await cleanDatabase();
    refreshTokenService = new RefreshTokenService();
  });

  it('revokes the oldest tokens when exceeding the configured limit', async () => {
    const { user } = await createTestUser({ email: 'limit-flow@test.com' });
  const createdTokens = [] as RefreshToken[];

    for (let index = 0; index < 6; index++) {
      const token = await refreshTokenService.generateRefreshToken(
        user.id,
        `127.0.0.${index + 1}`,
        `jest-agent-${index + 1}`
      );
      createdTokens.push(token);
      await sleep(2);
    }

    const activeTokensBeforeLimit = await refreshTokenService.getUserActiveTokens(user.id);
    expect(activeTokensBeforeLimit).toHaveLength(createdTokens.length);

    await refreshTokenService.limitUserTokens(user.id, 5);

    const repository = getRefreshTokenRepository();
    const storedTokens = await repository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    expect(storedTokens).toHaveLength(createdTokens.length);

    const expectedRevokedTokens = activeTokensBeforeLimit.slice(4);
    const revokedTokens = storedTokens.filter((token) => token.isRevoked);

    expect(revokedTokens).toHaveLength(expectedRevokedTokens.length);
    expect(revokedTokens.map((token) => token.token)).toEqual(
      expect.arrayContaining(expectedRevokedTokens.map((token) => token.token))
    );

    const activeTokens = await refreshTokenService.getUserActiveTokens(user.id);
    expect(activeTokens).toHaveLength(4);
    expect(activeTokens.every((token) => token.isRevoked === false)).toBe(true);
  });

  it('deletes tokens that are expired or already revoked during cleanup', async () => {
    const { user } = await createTestUser({ email: 'cleanup-flow@test.com' });

    const activeToken = await refreshTokenService.generateRefreshToken(user.id);

    const expiredToken = await refreshTokenService.generateRefreshToken(user.id);
    expiredToken.expiresAt = new Date(Date.now() - 60 * 60 * 1000);
    await getRefreshTokenRepository().save(expiredToken);

    const revokedToken = await refreshTokenService.generateRefreshToken(user.id);
    revokedToken.revoke();
    await getRefreshTokenRepository().save(revokedToken);

    await refreshTokenService.cleanupExpiredTokens();

    const remainingTokens = await getRefreshTokenRepository().find({
      where: { userId: user.id },
    });

    expect(remainingTokens).toHaveLength(1);
    expect(remainingTokens[0].token).toBe(activeToken.token);
  });
});
