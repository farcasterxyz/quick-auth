// pool is assumed to be a 2 character string
export async function generateNonce(pool: string): Promise<string> {
  // Generate a nonce with 128 bits of entropy (16 bytes)
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  const nonce = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${pool}${nonce}`;
}

export async function storeNonce(env: Cloudflare.Env, nonce: string): Promise<void> {
  const start = Date.now();
  const pool = nonce.slice(0, 2);
  const poolId = env.NONCE_POOL.idFromName(pool);
  const poolObject = env.NONCE_POOL.get(poolId);

  await poolObject.store(nonce);
  console.log("storeNonce duration", Date.now() - start);
}

export async function consumeNonce(env: Cloudflare.Env, nonce: string): Promise<boolean> {
  const start = Date.now();
  const pool = nonce.slice(0, 2);
  const poolId = env.NONCE_POOL.idFromName(pool);
  const poolObject = env.NONCE_POOL.get(poolId);

  const result = await poolObject.consume(nonce);
  console.log("consumeNonce duration", Date.now() - start);

  return result;
}
