import { type Env } from '../worker-configuration';
import { Nonce } from '../src/durable-objects/nonce';
import app from '../src/index';

export interface TestContext {
  env: Env;
  executionContext: ExecutionContext;
}

export function createMockEnv(): Env {
  return {
    JWK_PUBLIC_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["verify"],"alg":"RS256","n":"test-key-data"}',
    JWK_PRIVATE_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["sign"],"alg":"RS256","n":"test-key-data","d":"test-key-data"}',
    ETH_RPC_URL: 'https://mainnet.optimism.io',
    NONCE: {
      newUniqueId: () => ({ toString: () => 'test-id' }),
      get: () => {
        const storage = new Map();
        const state = storage;
        const env = {};
        
        return new Nonce(state, env, { id: 'test-id' });
      }
    },
  } as unknown as Env;
}

export function createMockExecutionContext(): ExecutionContext {
  const waitPromises: Promise<any>[] = [];

  return {
    waitUntil: (promise: Promise<any>) => {
      waitPromises.push(promise);
    },
    passThroughOnException: () => {},
    async waitForPendingPromises() {
      await Promise.all(waitPromises);
    }
  } as unknown as ExecutionContext;
}

export function createTestContext(): TestContext {
  return {
    env: createMockEnv(),
    executionContext: createMockExecutionContext()
  };
}

export function createTestApp(ctx: TestContext) {
  return app.handle.bind(app);
}