import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySiwf } from '../verifySiwf.js';
import { Config } from '../../config.js';

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
      {
        method: 'POST',
        body: JSON.stringify(mockOptions)
      }
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

  it('should throw an error when verification fails with valid=false', async () => {
    const errorResponse = {
      valid: false,
      message: 'Invalid signature'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse,
    });

    await expect(verifySiwf(mockConfig, mockOptions)).rejects.toThrow('Invalid: Invalid signature');
  });

  it('should throw an error with unknown message when verification fails without message', async () => {
    const errorResponse = {
      valid: false
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse,
    });

    await expect(verifySiwf(mockConfig, mockOptions)).rejects.toThrow('Invalid: unknown');
  });

  it('should throw an error when response status is not ok', async () => {
    const errorResponse = {
      error: 'Rate limit exceeded'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
    });

    await expect(verifySiwf(mockConfig, mockOptions)).rejects.toThrow('Rate limit exceeded');
  });

  it('should throw a default error when response is not ok and no error specified', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(verifySiwf(mockConfig, mockOptions)).rejects.toThrow('Failed to get nonce');
  });
});
