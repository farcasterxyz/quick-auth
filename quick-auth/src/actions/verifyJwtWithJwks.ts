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
    if (error instanceof errors.JWTExpired) {
      throw new InvalidTokenError(error.message, 'expired')
    }

    if (error instanceof errors.JWSSignatureVerificationFailed) {
      throw new InvalidTokenError(error.message, 'invalid_signature')
    }

    if (error instanceof errors.JWTClaimValidationFailed) {
      const reason = error.claim === 'aud'
        ? 'domain_mismatch'
        : 'malformed'
      throw new InvalidTokenError(error.message, reason)
    }

    if (error instanceof errors.JWTInvalid) {
      throw new InvalidTokenError(error.message, 'malformed')
    }

    throw error
  }
}
