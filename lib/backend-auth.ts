import { SignJWT } from 'jose';

/**
 * Mints short-lived HS256 tokens that the NestJS backend verifies on every
 * protected request. The frontend is the identity authority (it has already
 * verified the next-auth session); these tokens carry that verified identity to
 * the backend so the backend can independently enforce access control even
 * against direct (non-browser) requests.
 *
 * Server-only: BACKEND_JWT_SECRET must NOT be exposed to the client (no
 * NEXT_PUBLIC_ prefix). Only import this from server code (route handlers,
 * auth callbacks).
 */

const TOKEN_TTL = '60s';

function getKey(): Uint8Array {
  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret) {
    throw new Error('BACKEND_JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export interface UserTokenClaims {
  email: string;
  role?: string;
  userId?: string;
}

/** Token representing an authenticated admin/editor user. */
export async function mintUserToken(claims: UserTokenClaims): Promise<string> {
  return new SignJWT({
    scope: 'user',
    email: claims.email,
    role: claims.role,
    userId: claims.userId,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getKey());
}

/**
 * Token for server-to-server internal calls that happen BEFORE a user session
 * exists (the next-auth sign-in authorization check).
 */
export async function mintInternalToken(): Promise<string> {
  return new SignJWT({ scope: 'internal' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getKey());
}
