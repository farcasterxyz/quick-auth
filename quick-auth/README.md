# @farcaster/quick-auth

A client for interacting with a Farcaster Quick Auth server.

## Installation

```sh
npm install @auth-server/client
# or
yarn add @auth-server/client
# or
pnpm add @auth-server/client
```

## Usage

```typescript
import { createClient } from '@farcaster/quick-auth';

// Get a nonce
const domain = 'your-domain.com';
const client = createClient();
const nonce = await client.getNonce();

// Generate a SIWF message using nonce and domain (not shown)

// Verify a SIWF message and get a JWT token
const token = await client.verifySiwf({
  message,
  signature,
  domain
});

// Use the return JWT as an Bearer token and validate on your server
const token = await client.verifyToken({
  token,
  domain
});
```

## Upgrading to 0.1.0

0.1.0 depends on Zod 4 (`zod@^4.6.6`) instead of Zod 3. The client API and runtime behavior are unchanged.

The exported `Endpoints.VerifyJwt.requestQueryParametersSchema` is now a Zod 4 schema. If you compose it into your own schemas, for example `z.object({ query: Endpoints.VerifyJwt.requestQueryParametersSchema })`, your code must also use Zod 4. Zod 3 schemas cannot contain Zod 4 schemas, and doing so fails at type-check time and at parse time. Zod 3.25+ also ships Zod 4 as `zod/v4`, so you can migrate one call site at a time:

```typescript
import { z } from 'zod/v4';
import { Endpoints } from '@farcaster/quick-auth';

const schema = z.object({ query: Endpoints.VerifyJwt.requestQueryParametersSchema });
```

If you only use `createClient()`, `createLightClient()` or `decodeJwt()`, no changes are needed.
