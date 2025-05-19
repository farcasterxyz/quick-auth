# Auth Server

Authentication server for SIWF (Sign In With Farcaster) that issues asymmetrically signed JWTs.

## Setup

```txt
pnpm install
pnpm dev
```

## Deployment

```txt
pnpm run deploy
```

## Environment Variables

The following environment variables are required:

- `ETH_RPC_URLS`: Comma separated list of Ethereum RPC urls uesd to verify signatures and map addresses to FIDs
- `JWT_PRIVATE_KEY`: Private key in JWK format for signing JWTs
- `JWT_PUBLIC_KEY`: Public key in JWK format for verifying JWTs

You can generate a key pair using the following script:

```bash
pnpm generateKeyPair
```

## JWT Verification

Other servers can verify JWTs issued by this server by fetching the public key from the `/jwks.json` endpoint and using it to verify the JWT signature.

## API Endpoints

- `POST /nonce`: Generates a nonce for SIWF
- `POST /verify-siwf`: Verifies a SIWF message and issues a JWT
- `POST /verify-jwt`: Verifies a JWT locally
- `GET /.well-known/jwks.json`: Returns the public key in JWKS format for JWT verification

## Development

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
pnpm cf-typegen
```
