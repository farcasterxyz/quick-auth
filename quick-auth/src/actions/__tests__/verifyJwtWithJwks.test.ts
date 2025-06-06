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
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);

    await verifyJwtWithJwks(mockConfig, mockOptions);

    expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://test.example.com/.well-known/jwks.json')
    );
  });

  it('should verify JWT with correct parameters', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);

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
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    mockJwtVerify.mockResolvedValueOnce({ payload: mockSuccessResponse } as any);

    const result = await verifyJwtWithJwks(mockConfig, mockOptions);

    expect(result).toEqual(mockSuccessResponse);
  });

  it('should throw InvalidTokenError for JWTInvalid error', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    const jwtError = new errors.JWTInvalid('Invalid JWT format');
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Invalid JWT format');
  });

  it('should throw InvalidTokenError for JWTExpired error', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    const jwtError = new errors.JWTExpired('JWT has expired');
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('JWT has expired');
  });

  it('should throw InvalidTokenError for JWTClaimValidationFailed error', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    const jwtError = new errors.JWTClaimValidationFailed('Claim validation failed');
    mockJwtVerify.mockRejectedValue(jwtError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Claim validation failed');
  });

  it('should re-throw non-JWT errors', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    const networkError = new Error('Network error');
    mockJwtVerify.mockRejectedValue(networkError);

    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.toThrow('Network error');
    await expect(verifyJwtWithJwks(mockConfig, mockOptions)).rejects.not.toThrow(InvalidTokenError);
  });

  it('should reuse JWKS set for same origin', async () => {
    const mockCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);
    const mockJwtVerify = vi.mocked(jwtVerify);
    const mockJwksSet = vi.fn();

    // Use a unique origin for this test to avoid cache conflicts
    const uniqueConfig = { origin: 'https://unique-test.example.com' };
    
    // Reset call count for this test
    mockCreateRemoteJWKSet.mockClear();
    mockJwtVerify.mockClear();
    
    mockCreateRemoteJWKSet.mockReturnValue(mockJwksSet);
    mockJwtVerify.mockResolvedValue({ payload: mockSuccessResponse } as any);

    await verifyJwtWithJwks(uniqueConfig, mockOptions);
    await verifyJwtWithJwks(uniqueConfig, mockOptions);

    // Now we can verify the caching behavior
    expect(mockJwtVerify).toHaveBeenCalledTimes(2);
    expect(mockCreateRemoteJWKSet).toHaveBeenCalledTimes(1);
  });
});
