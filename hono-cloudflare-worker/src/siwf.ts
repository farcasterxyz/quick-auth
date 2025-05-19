import type { Hex } from 'viem';
import { parseSiweMessage, SiweMessage } from 'viem/siwe';
import { consumeNonce } from './nonce';
import { createAppClient, viemConnector } from '@farcaster/auth-client';


export async function verifyMessage(
  env: Cloudflare.Env,
  {
    domain,
    message,
    signature,
    acceptAuthAddress
  }: {
    domain: string;
    message: string;
    signature: string;
    acceptAuthAddress?: boolean;
  }
): Promise<
  | { isValid: true; fid: number; address: string; }
  | { isValid: false; message?: string; }
> {
  const appClient = createAppClient(
    {
      relay: "https://relay.farcaster.xyz",
      ethereum: viemConnector({ rpcUrls: env.ETH_RPC_URLS.split(',') }),
    }
  );

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
      acceptAuthAddress,
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
