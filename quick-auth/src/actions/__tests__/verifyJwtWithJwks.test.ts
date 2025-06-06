import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyJwtWithJwks } from '../verifyJwtWithJwks.js';
import { Config } from '../../config.js';
import { InvalidTokenError } from '../../errors.js';
import { createRemoteJWKSet, jwtVerify, errors } from 'jose';

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn(),
  errors: {
    JWTInvalid: class JWTInvalid extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'JWTInvalid';
      }
    },
    JWTExpired: class JWTExpired extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'JWTExpired';
      }
    },
    JWTClaimValidationFailed: class JWTClaimValidationFailed extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'JWTClaimValidationFailed';
      }
    }
  }
}));

describe('verifyJwtWithJwks', () => {
  const mockConfig: Config = { origin: 'https://test.example.com' };
  const mockOptions = { token: 'mock-jwt-token', domain: 'example.com' };
  const mockSuccessResponse = {
    sub: 123,
    iss: 'https://test.example.com',
    exp: 123456789,
    aud: 'example.com',
    iat: 123456700
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create JWKS set with correct URL', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);

    await verifyJwtWithJwks(mockConfig, mockOptions);

    expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://test.example.com/.well-known/jwks.json')
    );
  });

  it('should verify JWT with correct parameters', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);
    const mockJwksSet = vi.fn();

    // @ts-expect-error
    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    await verifyJwtWithJwks(mockConfig, mockOptions);

    expect(mockJwtVerify).toHaveBeenCalledWith(
      'mock-jwt-token',
      expect.any(Function),
      {
        issuer: 'https://test.example.com',
        audience: 'example.com',
      }
    );
  });

  it('should return the payload when verification succeeds', async () => {
    const mockJwtVerify = vi.mocked(jwtVerify);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);

    const result = await verifyJwtWithJwks(mockConfig, mockOptions);

    expect(result).toEqual(mockSuccessResponse);
  });

  it('should throw InvalidTokenError for JWTInvalid error', async () => {
    const mockJwtVerify = vi.mocked(jwtVerify);
    const jwtError = new errors.JWTInvalid('Invalid JWT format');
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Invalid JWT format');
  });

  it('should throw InvalidTokenError for JWTExpired error', async () => {
    const mockJwtVerify = vi.mocked(jwtVerify);
    const jwtError = new errors.JWTExpired('JWT has expired', {});
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('JWT has expired');
  });

  it('should throw InvalidTokenError for JWTClaimValidationFailed error', async () => {
    const mockJwtVerify = vi.mocked(jwtVerify);
    const jwtError = new errors.JWTClaimValidationFailed('Claim validation failed', {});
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Claim validation failed');
  });

  it('should re-throw non-JWT errors', async () => {
    const mockJwtVerify = vi.mocked(jwtVerify);
    const networkError = new Error('Network error');
    mockJwtVerify.mockRejectedValue(networkError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Network error');
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.not.toThrow(InvalidTokenError);
  });
});
