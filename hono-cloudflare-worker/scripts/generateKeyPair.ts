import { exportJWK, generateKeyPair } from "jose"

const { publicKey, privateKey } = await generateKeyPair('RS256')

const kid = crypto.randomUUID();
const publicJwk = await exportJWK(publicKey)
const privateJWK = await exportJWK(privateKey)

console.log(
  `JWK_PUBLIC_KEY=${JSON.stringify({ ...publicJwk, kid })}\n` +
  `JWK_PRIVATE_KEY=${JSON.stringify({ ...privateJWK, kid })}`
)

process.exit(0);
