import { defineConfig } from 'vitest/config';
import { cloudflareworkers } from '@cloudflare/vitest-pool-workers';

export default defineConfig({
  test: {
    environment: 'cloudflare-workers',
    pool: cloudflareworkers({
      wrangler: {
        configPath: './wrangler.jsonc',
      },
    }),
    environmentOptions: {
      cloudflareWorkers: {
        vars: {
          JWK_PUBLIC_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["verify"],"alg":"RS256","n":"test-key-data"}',
          JWK_PRIVATE_KEY: '{"kty":"RSA","e":"AQAB","kid":"test-key","key_ops":["sign"],"alg":"RS256","n":"test-key-data","d":"test-key-data"}',
          ETH_RPC_URL: 'https://mainnet.optimism.io',
        },
      },
    },
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    },
  },
});
