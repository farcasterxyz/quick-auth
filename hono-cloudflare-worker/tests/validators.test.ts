import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext } from './test-utils';
import app from '../src/index';
import { Hono } from 'hono';
import { Endpoints } from '@farcaster/quick-auth';

describe('Validators', () => {
  let context: ReturnType<typeof createTestContext>;
  let server: Hono;

  beforeEach(() => {
    context = createTestContext();
    server = app;
    
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

  describe('/verify-siwf endpoint validator', () => {
    it('should reject requests with missing parameters', async () => {
      const req = new Request('https://example.com/verify-siwf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required fields
        })
      });

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(400);
      
      const body = await res.json();
      expect(body).toHaveProperty('error', 'invalid_params');
      expect(body).toHaveProperty('error_message');
    });

    it('should accept valid requests', async () => {
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

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body).toHaveProperty('valid', true);
      expect(body).toHaveProperty('token');
    });
  });

  describe('/verify-jwt endpoint validator', () => {
    it('should reject requests with missing query parameters', async () => {
      const req = new Request('https://example.com/verify-jwt', {
        method: 'GET'
      });

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(400);
      
      const body = await res.json();
      expect(body).toHaveProperty('error', 'invalid_params');
    });

    it('should accept valid requests', async () => {
      const req = new Request('https://example.com/verify-jwt?token=mock-jwt-token&domain=test.xyz', {
        method: 'GET'
      });

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body).toHaveProperty('address');
      expect(body).toHaveProperty('sub');
    });
  });

  describe('/nonce endpoint', () => {
    it('should generate and return a nonce', async () => {
      const req = new Request('https://example.com/nonce', {
        method: 'POST'
      });

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body).toHaveProperty('nonce', 'mock-nonce-123');
    });
  });

  describe('/.well-known/jwks.json endpoint', () => {
    it('should return the public key', async () => {
      const req = new Request('https://example.com/.well-known/jwks.json', {
        method: 'GET'
      });

      const res = await server.fetch(req, context.env);
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body).toHaveProperty('keys');
      expect(Array.isArray(body.keys)).toBe(true);
      expect(body.keys.length).toBe(1);
    });
  });
});