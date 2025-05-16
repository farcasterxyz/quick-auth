import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateNonce } from '../nonce.js';
import { Config } from '../../config.js';

describe('generateNonce', () => {
  const mockConfig: Config = { origin: 'https://test.example.com' };
  const mockNonce = { nonce: 'test-nonce-123' };

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should call the nonce endpoint with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNonce,
    });

    await generateNonce(mockConfig);

    expect(fetch).toHaveBeenCalledWith(
      'https://test.example.com/nonce',
      { method: 'POST' }
    );
  });

  it('should return the nonce when request succeeds', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNonce,
    });

    const result = await generateNonce(mockConfig);

    expect(result).toEqual(mockNonce);
  });

  it('should throw an error when request fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(generateNonce(mockConfig)).rejects.toThrow('Request failed (status 500)');
  });
});
