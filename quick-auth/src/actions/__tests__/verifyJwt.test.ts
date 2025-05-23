import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyJwt } from '../verifyJwt.js';
import { Config } from '../../config.js';
import { InvalidParametersError, InvalidTokenError, ResponseError } from '../../errors.js';

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

  it('should throw an InvalidTokenError when token is invalid', async () => {
    const errorResponse = {
      error: 'invalid_token',
      error_message: 'Token has expired'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    try {
      await verifyJwt(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTokenError);
      expect((error as Error).message).toContain('Token has expired');
    }
  });

  it('should throw an InvalidParametersError when params are invalid', async () => {
    const errorResponse = {
      error: 'invalid_params',
      error_message: 'Missing domain parameter'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    try {
      await verifyJwt(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidParametersError);
      expect((error as Error).message).toContain('Missing domain parameter');
    }
  });

  it('should throw a ResponseError for other 400 errors', async () => {
    const errorResponse = {
      error: 'unknown_error',
      error_message: 'Something went wrong'
    };

    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      json: async () => errorResponse,
    });

    try {
      await verifyJwt(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
    }
  });

  it('should throw a ResponseError for non-200/400 status codes', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });

    try {
      await verifyJwt(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
      expect((error as Error).message).toContain('Request failed with status 500');
    }
  });
});
