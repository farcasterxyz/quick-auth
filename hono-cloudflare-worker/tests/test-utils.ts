import { createExecutionContext, ProvidedEnv } from 'cloudflare:test';

export interface TestContext {
  env: ProvidedEnv;
  executionContext: ExecutionContext;
}

export function createMockEnv(): ProvidedEnv {
  return {
    JWK_PUBLIC_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["verify"],"alg":"RS256","n":"test-key-data"}',
    JWK_PRIVATE_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["sign"],"alg":"RS256","n":"test-key-data","d":"test-key-data"}',
    ETH_RPC_URL: 'https://mainnet.optimism.io',
  } as unknown as ProvidedEnv;
}

export function createTestContext(): TestContext {
  return {
    env: createMockEnv(),
    executionContext: createExecutionContext()
  };
}
