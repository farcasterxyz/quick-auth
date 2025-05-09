import { importJWK, KeyLike } from 'jose';

export async function loadKeys(env: Cloudflare.Env): Promise<{ 
  publicKey: KeyLike | Uint8Array; 
  privateKey: KeyLike | Uint8Array; 
}> {
  try {
    const publicKeyJson = JSON.parse(env.JWK_PUBLIC_KEY);
    const privateKeyJson = JSON.parse(env.JWK_PRIVATE_KEY);
    
    // Import the keys
    const publicKey = await importJWK(publicKeyJson, 'RS256');
    const privateKey = await importJWK(privateKeyJson, 'RS256');
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('Failed to load JWK:', error);
    throw new Error('Failed to load JWK');
  }
}
