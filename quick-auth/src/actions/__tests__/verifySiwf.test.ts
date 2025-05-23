import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySiwf } from '../verifySiwf.js';
import { Config } from '../../config.js';
import { InvalidSiwfError, ResponseError } from '../../errors.js';

describe('verifySiwf', () => {
  const mockConfig: Config = { origin: 'https://test.example.com' };
  const mockOptions = {
    message: 'test-message',
    domain: 'example.com',
    signature: 'mock-signature'
  };
  const mockSuccessResponse = {
    valid: true,
    token: 'valid-jwt-token'
  };

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should call the verify-siwf endpoint with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    await verifySiwf(mockConfig, mockOptions);

    expect(fetch).toHaveBeenCalledWith(
      'https://test.example.com/verify-siwf',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockOptions)
      })
    );
  });

  it('should return the token when verification succeeds', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const result = await verifySiwf(mockConfig, mockOptions);

    expect(result).toEqual({ token: 'valid-jwt-token' });
  });

  it('should throw an InvalidSiwfError when verification fails with valid=false', async () => {
    const errorResponse = {
      valid: false,
      message: 'Invalid signature'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse,
    });

    try {
      await verifySiwf(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSiwfError);
      expect((error as Error).message).toContain('Invalid signature');
    }
  });

  it('should throw a ResponseError when response status is not ok', async () => {
    const errorResponse = {
      error: 'Rate limit exceeded'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => errorResponse,
    });

    try {
      await verifySiwf(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
    }
  });

  it('should throw a ResponseError when response is not ok and no error specified', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    try {
      await verifySiwf(mockConfig, mockOptions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
      expect((error as Error).message).toContain('Request failed with status 500');
    }
  });
});
