export async function generateNonce(env: Cloudflare.Env, colo: string): Promise<string> {
  // Generate a nonce with 128 bits of entropy (16 bytes)
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  // Convert to hex string for use in APIs
  const nonce = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const nonceId = env.NONCE.idFromName(nonce);
  const nonceObject = env.NONCE.get(nonceId, { locationHint: colo as DurableObjectLocationHint });

  await nonceObject.initialize();

  return nonce;
}

export async function consumeNonce(env: Cloudflare.Env, nonce: string): Promise<boolean> {
  const nonceId = env.NONCE.idFromName(nonce);
  const nonceObject = env.NONCE.get(nonceId);

  return await nonceObject.consume();
}
