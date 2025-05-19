import { Config } from "../config.js";
import { VerifySiwf } from "../endpoints/index.js";
import { GlobalErrorType, InvalidSiwfError, ResponseError } from "../errors.js";

export declare namespace verifySiwf {
  type Options = VerifySiwf.RequestBody;
  type ReturnValue = { token: string };
  type ReturnType = Promise<ReturnValue>;

  type ErrorType =
    | InvalidSiwfError
    | ResponseError
    | GlobalErrorType
}

export async function verifySiwf({ origin }: Config, options: verifySiwf.Options): verifySiwf.ReturnType {
  const response = await fetch(`${origin}/verify-siwf`, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    throw new ResponseError({ status: response.status })
  }

  const data = await response.json() as VerifySiwf.ResponseBody;
  if (data.valid === false) {
    throw new InvalidSiwfError(data.message ?? 'unknown');
  }

  return { token: data.token };
}
