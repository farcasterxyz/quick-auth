import { Config } from "../config.js";
import { Nonce } from "../endpoints/index.js";

export declare namespace generateNonce {
  type ReturnValue = Nonce.ResponseBody;
  type ReturnType = Promise<ReturnValue>;
}

export async function generateNonce({ origin }: Config): generateNonce.ReturnType {
  const response = await fetch(`${origin}/nonce`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Request failed (status ${response.status})`);
  }

  return await response.json() as Nonce.ResponseBody;
}
