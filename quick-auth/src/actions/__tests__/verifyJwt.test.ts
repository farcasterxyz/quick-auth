import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyJwt } from '../verifyJwt.js';
import { verifyJwtWithJwks } from '../verifyJwtWithJwks.js';
import { Config } from '../../config.js';
import { InvalidTokenError } from '../../errors.js';

vi.mock('../verifyJwtWithJwks.js');

describe('verifyJwt', () => {
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

  it('default', async () => {
    const mockVerifyJwtWithJwks = vi.mocked(verifyJwtWithJwks);
    mockVerifyJwtWithJwks.mockResolvedValueOnce(mockSuccessResponse);
    const result = await verifyJwt(mockConfig, mockOptions);
    expect(result).toEqual(mockSuccessResponse);
  });

  it('should throw an InvalidTokenError when token is invalid', async () => {
    const mockVerifyJwtWithJwks = vi.mocked(verifyJwtWithJwks);
    const error = new InvalidTokenError('Token has expired');
    mockVerifyJwtWithJwks.mockRejectedValue(error);

    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow(InvalidTokenError);
    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow('Token has expired');
  });
});
