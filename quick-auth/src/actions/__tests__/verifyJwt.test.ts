import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyJwt } from '../verifyJwt.js';
import { Config } from '../../config.js';

describe('verifyJwt', () => {
  const mockConfig: Config = { origin: 'https://test.example.com' };
  const mockOptions = { token: 'mock-jwt-token', domain: 'example.com' };
  const mockSuccessResponse = {
    address: '0x123',
    sub: 'sub123',
    iss: 'iss123',
    exp: 123456789,
    aud: 'aud123'
  };

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should call the verify-jwt endpoint with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      json: async () => mockSuccessResponse,
    });

    await verifyJwt(mockConfig, mockOptions);

    const url = new URL('https://test.example.com/verify-jwt');
    url.searchParams.set('token', mockOptions.token);
    url.searchParams.set('domain', mockOptions.domain);

    expect(fetch).toHaveBeenCalledWith(url);
  });

  it('should return the verification data when request succeeds', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      json: async () => mockSuccessResponse,
    });

    const result = await verifyJwt(mockConfig, mockOptions);

    expect(result).toEqual(mockSuccessResponse);
  });

  it('should throw an error when token is invalid', async () => {
    const errorResponse = {
      error: 'invalid_token',
      error_message: 'Token has expired'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow('Invalid token: Token has expired');
  });

  it('should throw an error when params are invalid', async () => {
    const errorResponse = {
      error: 'invalid_params',
      error_message: 'Missing domain parameter'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow('Invalid params: Missing domain parameter');
  });

  it('should throw a generic bad request error for other 400 errors', async () => {
    const errorResponse = {
      error: 'unknown_error',
      error_message: 'Something went wrong'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow('Bad request');
  });

  it('should throw an error for non-200/400 status codes', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });

    await expect(verifyJwt(mockConfig, mockOptions)).rejects.toThrow('Request failed (status 500)');
  });
});
