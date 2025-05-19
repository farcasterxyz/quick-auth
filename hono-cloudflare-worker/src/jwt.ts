import { SignJWT, jwtVerify } from 'jose';
import { loadKeys } from './jwks';

const JWT_ISSUER = 'https://auth.farcaster.xyz';
const JWT_EXPIRATION = '1h';

export interface JWTPayload {
  address: string;
}

/**
 * Creates a JWT 
 * @param env The environment variables
 * @param walletAddress The wallet address that was authenticated
 * @returns A signed JWT token
 */
export async function createJWT({
  env,
  fid,
  address,
  domain
}: {
  env: Cloudflare.Env;
  fid: number;
  address: string;
  domain: string;
}): Promise<string> {
  const payload = {
    address,
  } satisfies JWTPayload;

  // Load the private key from environment
  const { privateKey, kid } = await loadKeys(env);

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .setSubject(fid.toString())
    .setAudience(domain)
    .sign(privateKey);

  return jwt;
}

/**
 * Verifies a JWT 
 * @param env The environment variables
 * @param token The JWT token to verify
 * @param domain The domain for audience validation
 * @returns The payload if valid, null if invalid
 */
export async function verifyJWT({
  env,
  token,
  domain
}: {
  env: Cloudflare.Env;
  token: string;
  domain: string;
}): Promise<JWTPayload | null> {
  try {
    // Load the public key from environment
    const { publicKey } = await loadKeys(env);

    const { payload } = await jwtVerify<JWTPayload>(token, publicKey, {
      algorithms: ['RS256'],
      issuer: JWT_ISSUER,
      audience: domain,
      requiredClaims: ['sub', 'exp', 'iss', 'aud']
    });

    if (!payload.sub) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}
