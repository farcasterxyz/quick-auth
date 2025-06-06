import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyJwtWithEndpoint } from '../verifyJwtWithEndpoint.js';
import { Config } from '../../config.js';
import { InvalidTokenError, InvalidParametersError, ResponseError } from '../../errors.js';

describe('verifyJwtWithEndpoint', () => {
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

  it('should make a fetch request to the correct URL with query parameters', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockSuccessResponse), { status: 200 }));

    await verifyJwtWithEndpoint(mockConfig, mockOptions);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('https://test.example.com/verify-jwt?token=mock-jwt-token&domain=example.com')
    );
  });

  it('should return the verification data when request succeeds', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockSuccessResponse), { status: 200 }));

    const result = await verifyJwtWithEndpoint(mockConfig, mockOptions);

    expect(result).toEqual(mockSuccessResponse);
  });

  it('should throw InvalidTokenError for 400 response with invalid_token error', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const errorResponse = { error: 'invalid_token', error_message: 'Token has expired' };
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), { status: 400 }));

    const error = await verifyJwtWithEndpoint(mockConfig, mockOptions).catch(e => e);
    expect(error).toBeInstanceOf(InvalidTokenError);
    expect(error.message).toContain('Token has expired');
  });

  it('should throw InvalidParametersError for 400 response with invalid_params error', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const errorResponse = { error: 'invalid_params', error_message: 'Missing required parameter' };
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), { status: 400 }));

    const error = await verifyJwtWithEndpoint(mockConfig, mockOptions).catch(e => e);
    expect(error).toBeInstanceOf(InvalidParametersError);
    expect(error.message).toContain('Missing required parameter');
  });

  it('should throw ResponseError for non-200 and non-400 status codes', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce(new Response('', { status: 500 }));

    const error = await verifyJwtWithEndpoint(mockConfig, mockOptions).catch(e => e);
    expect(error).toBeInstanceOf(ResponseError);
    expect(error.message).toContain('Request failed with status 500');
  });

  it('should throw ResponseError for 404 status', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce(new Response('', { status: 404 }));

    const error = await verifyJwtWithEndpoint(mockConfig, mockOptions).catch(e => e);
    expect(error).toBeInstanceOf(ResponseError);
    expect(error.message).toContain('Request failed with status 404');
  });
});