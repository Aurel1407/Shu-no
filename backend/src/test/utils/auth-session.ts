import request, { Test as SupertestTest } from 'supertest';
import app from '@/app';
import { generateToken } from '@/utils/auth';
import { User } from '@/entities/User';

export const DEFAULT_TEST_USER_AGENT = 'supertest-agent';

export type AuthAgent = ReturnType<typeof request.agent>;

export interface AuthSession {
  agent: AuthAgent;
  accessToken: string;
  csrfToken: string;
  user: User;
}

interface SessionOptions {
  userAgent?: string;
}

export const createAuthenticatedSession = async (
  user: User,
  options: SessionOptions = {}
): Promise<AuthSession> => {
  const userAgent = options.userAgent ?? DEFAULT_TEST_USER_AGENT;
  const agent = request.agent(app);
  const accessToken = generateToken(user);

  const response = await agent
    .get('/api/auth/csrf-token')
    .set('User-Agent', userAgent)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);

  const csrfToken = response.body?.data?.csrfToken;

  if (typeof csrfToken !== 'string') {
    throw new Error('CSRF token was not provided by /api/auth/csrf-token');
  }

  return {
    agent,
    accessToken,
    csrfToken,
    user,
  };
};

export const applyAuthHeaders = (
  req: SupertestTest,
  session: AuthSession,
  options: { includeCsrf?: boolean; userAgent?: string } = {}
): SupertestTest => {
  const userAgent = options.userAgent ?? DEFAULT_TEST_USER_AGENT;
  let result = req
    .set('User-Agent', userAgent)
    .set('Authorization', `Bearer ${session.accessToken}`);

  if (options.includeCsrf) {
    result = result.set('x-csrf-token', session.csrfToken);
  }

  return result;
};
