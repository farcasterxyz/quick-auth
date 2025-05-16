import { createPublicClient, type Hex, http } from 'viem';
import { optimism } from 'viem/chains';
import { parseSiweMessage, SiweMessage } from 'viem/siwe';
import { consumeNonce } from './nonce';
import { createAppClient, viemConnector } from '@farcaster/auth-client';


export async function verifyMessage(
  env: Cloudflare.Env,
  { domain, message, signature }: { domain: string; message: string; signature: string; }
): Promise<{ isValid: true; fid: number; address: string; } | { isValid: false; message?: string; }> {
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(env.ETH_RPC_URL)
  })

  const appClient = createAppClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector({ rpcUrl: env.ETH_RPC_URL }),
  },
    // @ts-expect-error 
    publicClient);

  const siweMessage = parseSiweMessage(message);
  if (!siweMessage.nonce) {
    return { isValid: false }
  }

  // Juice perf by performing this operations in parallel
  const [verifyResult, consumedNonce] = await Promise.all([
    appClient.verifySignInMessage({
      nonce: siweMessage.nonce,
      domain,
      message,
      signature: signature as Hex,
    }),
    consumeNonce(env, siweMessage.nonce)
  ])

  if (!consumedNonce) {
    return { isValid: false, message: 'Invalid nonce' }
  }

  if (verifyResult.isError) {
    return { isValid: false, message: verifyResult.error?.message }
  }

  return { isValid: true, fid: verifyResult.fid, address: (siweMessage as SiweMessage).address }
}
