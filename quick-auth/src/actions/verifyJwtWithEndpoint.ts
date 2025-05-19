import { Config } from "../config.js";
import { VerifyJwt } from "../endpoints/index.js";
import { GlobalErrorType, InvalidParametersError, InvalidTokenError, ResponseError } from "../errors.js";

export declare namespace verifyJwtWithEndpoint {
  type Options = VerifyJwt.RequestQueryParameters;
  type ReturnValue = VerifyJwt.ResponseBody;
  type ReturnType = Promise<ReturnValue>;

  type ErrorType =
    | InvalidTokenError
    | InvalidParametersError
    | ResponseError
    | GlobalErrorType;
}

export async function verifyJwtWithEndpoint({ origin }: Config, options: verifyJwtWithEndpoint.Options): verifyJwtWithEndpoint.ReturnType {
  const url = new URL(`${origin}/verify-jwt`)
  url.searchParams.set('token', options.token)
  url.searchParams.set('domain', options.domain)

  const response = await fetch(url);
  if (response.status === 200) {
    return await response.json() as VerifyJwt.ResponseBody;
  }

  if (response.status === 400) {
    const { error, error_message } = await response.json() as VerifyJwt.BadRequestResponseBody;

    if (error === 'invalid_token') {
      throw new InvalidTokenError(error_message)
    }

    if (error === 'invalid_params') {
      throw new InvalidParametersError(error_message)
    }
  }

  throw new ResponseError({ status: response.status });
}

