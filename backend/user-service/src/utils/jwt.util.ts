import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export type TokenType = 'access' | 'refresh' | 'reset';

interface TokenPayload extends JwtPayload {
  sub: string;
  type: TokenType;
}

const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';
const RESET_TTL = process.env.JWT_RESET_TTL ?? '1h';

function getSecret(type: TokenType): string {
  if (type === 'access') {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET is not set');
    return s;
  }
  if (type === 'refresh') {
    const s = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_REFRESH_SECRET / JWT_SECRET is not set');
    return s;
  }
  // reset
  const s = process.env.JWT_RESET_SECRET ?? process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_RESET_SECRET / JWT_SECRET is not set');
  return s;
}

function getTtl(type: TokenType): SignOptions['expiresIn'] {
  if (type === 'access') return ACCESS_TTL as SignOptions['expiresIn'];
  if (type === 'refresh') return REFRESH_TTL as SignOptions['expiresIn'];
  return RESET_TTL as SignOptions['expiresIn'];
}

/** Sign a JWT with the right secret/TTL for the requested type. */
export function signToken(userId: string, type: TokenType): string {
  return jwt.sign({ sub: userId, type }, getSecret(type), { expiresIn: getTtl(type) });
}

/** Verify a token and assert its `type` matches the expected one. */
export function verifyToken(token: string, expected: TokenType): TokenPayload {
  const decoded = jwt.verify(token, getSecret(expected)) as TokenPayload;
  if (decoded.type !== expected) {
    throw new Error(`Token type mismatch: expected ${expected}, got ${decoded.type}`);
  }
  return decoded;
}

/** Convenience: issue an access+refresh pair for a freshly authenticated user. */
export function issueTokenPair(userId: string): { accessToken: string; refreshToken: string } {
  return {
    accessToken: signToken(userId, 'access'),
    refreshToken: signToken(userId, 'refresh'),
  };
}
