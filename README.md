# Auth Server

Authentication server for SIWF (Sign In With Farcaster) that issues asymmetrically signed JWTs.

## Setup

```txt
npm install
npm run dev
```

## Deployment

```txt
npm run deploy
```

## Environment Variables

The following environment variables are required:

- `JWT_PRIVATE_KEY`: Private key in JWK format for signing JWTs
- `JWT_PUBLIC_KEY`: Public key in JWK format for verifying JWTs

You can generate a key pair using the following script:

```js
const { generateKeyPair, exportJWK } = require('jose');

async function generateAndExportKeys() {
  const { privateKey, publicKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
  
  const privateJWK = await exportJWK(privateKey);
  const publicJWK = await exportJWK(publicKey);
  
  privateJWK.alg = 'RS256';
  publicJWK.alg = 'RS256';
  
  console.log('Private Key (set as JWT_PRIVATE_KEY):');
  console.log(JSON.stringify(privateJWK));
  
  console.log('\nPublic Key (set as JWT_PUBLIC_KEY):');
  console.log(JSON.stringify(publicJWK));
}

generateAndExportKeys().catch(console.error);
```

## JWT Verification

Other servers can verify JWTs issued by this server by fetching the public key from the `/jwks.json` endpoint and using it to verify the JWT signature.

## API Endpoints

- `GET /jwks.json`: Returns the public key in JWKS format for JWT verification
- `POST /nonce`: Generates a nonce for SIWF
- `POST /verify-siwf`: Verifies a SIWF message and issues a JWT
- `POST /verify-token`: Verifies a JWT locally

## Development

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
