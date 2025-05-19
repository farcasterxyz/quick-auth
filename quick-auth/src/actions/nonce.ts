import { Config } from "../config.js";
import { Nonce } from "../endpoints/index.js";
import { ResponseError } from "../errors.js";

export declare namespace generateNonce {
  type ReturnValue = Nonce.ResponseBody;
  type ReturnType = Promise<ReturnValue>;
}

export async function generateNonce({ origin }: Config): generateNonce.ReturnType {
  const response = await fetch(`${origin}/nonce`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new ResponseError({ status: response.status });
  }

  return await response.json() as Nonce.ResponseBody;
}
