import { createExecutionContext, env } from 'cloudflare:test'
import { describe, expect, beforeEach, vi, test } from 'vitest';
import { createTestContext } from './test-utils';
import { app } from '../src/app';

let context: ReturnType<typeof createTestContext>;

beforeEach(() => {
  context = createTestContext();

  // Mock any external services or dependencies
  vi.mock('../src/nonce', () => ({
    generateNonce: vi.fn().mockResolvedValue('mock-nonce-123'),
    storeNonce: vi.fn().mockResolvedValue(true),
    consumeNonce: vi.fn().mockResolvedValue(true)
  }));

  vi.mock('../src/siwf', () => ({
    verifyMessage: vi.fn().mockResolvedValue({
      isValid: true,
      fid: 12345,
      address: '0x1234567890abcdef1234567890abcdef12345678'
    })
  }));

  vi.mock('../src/jwt', () => ({
    createJWT: vi.fn().mockResolvedValue('mock-jwt-token'),
    verifyJWT: vi.fn().mockResolvedValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      sub: '12345'
    })
  }));
});

describe('POST /verify-siwf', () => {
  test('default', async () => {
    const validRequest = {
      message: 'test.xyz wants you to sign in with your Farcaster account:\n\n12345\n\nURI: https://test.xyz\nVersion: 1\nChain ID: 10\nNonce: mock-nonce-123\nIssued At: 2025-05-19T00:00:00.000Z',
      domain: 'test.xyz',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };

    const req = new Request('https://example.com/verify-siwf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequest)
    });

    const res = await app.fetch(req, context.env);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('valid', true);
    expect(body).toHaveProperty('token');
  });

  test('behavior: missing parameters', async () => {
    const req = new Request('https://example.com/verify-siwf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required fields
      })
    });

    const res = await app.fetch(req, context.env);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('error', 'invalid_params');
    expect(body).toHaveProperty('error_message');
  });
});

describe('POST /verify-jwt', () => {
  test('default', async () => {
    const req = new Request('https://example.com/verify-jwt?token=mock-jwt-token&domain=test.xyz', {
      method: 'GET'
    });

    const res = await app.fetch(req, context.env);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('address');
    expect(body).toHaveProperty('sub');
  });

  test('behavior: missing query parameters', async () => {
    const req = new Request('https://example.com/verify-jwt', {
      method: 'GET'
    });

    const res = await app.fetch(req, context.env);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('error', 'invalid_params');
  });
});

describe('GET /nonce', () => {
  test('default', async () => {
    const ctx = createExecutionContext();
    const res = await app.request(
      '/nonce',
      {
        method: 'POST'
      },
      env,
      ctx
    )
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('nonce', 'mock-nonce-123');
  });
});

describe('GET /.well-known/jwks.json', () => {
  test('default', async () => {
    const req = new Request('https://example.com/.well-known/jwks.json', {
      method: 'GET'
    });

    const res = await app.fetch(req, context.env);
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body).toHaveProperty('keys');
    expect(Array.isArray(body.keys)).toBe(true);
    expect(body.keys.length).toBe(1);
  });
});
