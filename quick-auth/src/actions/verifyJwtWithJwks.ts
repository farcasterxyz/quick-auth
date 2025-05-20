import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { Config } from "../config.js";
import { VerifyJwt } from "../endpoints/index.js";
import { GlobalErrorType, InvalidTokenError } from "../errors.js";

export declare namespace verifyJwtWithJwks {
  type Options = VerifyJwt.RequestQueryParameters;
  type ReturnValue = VerifyJwt.ResponseBody;
  type ReturnType = Promise<ReturnValue>;

  type ErrorType =
    | InvalidTokenError
    | GlobalErrorType;
}

const jwksSets: Record<string, ReturnType<typeof createRemoteJWKSet>> = {};

const getJwksSet = (url: string) => {
  if (!jwksSets[url]) {
    jwksSets[url] = createRemoteJWKSet(new URL(url))
  }

  return jwksSets[url];
}

export async function verifyJwtWithJwks({ origin }: Config, options: verifyJwtWithJwks.Options): verifyJwtWithJwks.ReturnType {
  const JWKS = getJwksSet(`${origin}/.well-known/jwks.json`)

  try {
    const { payload } = await jwtVerify<VerifyJwt.ResponseBody>(options.token, JWKS, {
      issuer: origin,
      audience: options.domain,
    })

    return payload;
  } catch (error) {
    if (
      error instanceof errors.JWTInvalid
      || error instanceof errors.JWTExpired
      || error instanceof errors.JWTClaimValidationFailed
    ) {
      throw new InvalidTokenError(error.message)
    }

    throw error
  }
}

