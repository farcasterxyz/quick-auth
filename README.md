# Farcaster Quick Auth

Authentication server and client for SIWF (Sign In With Farcaster) that issues asymmetrically signed JWTs.

## Project Structure

This is a monorepo with the following packages:

- `hono-cloudflare-worker`: Authentication server built with Hono and deployed as a Cloudflare Worker
- `quick-auth`: Client library for interacting with the auth server

## Development

```sh
pnpm install
pnpm typecheck
pnpm test
```
