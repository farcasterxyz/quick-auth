import { decodeJwt as joseDecodeJwt } from "jose/jwt/decode";
import { JWTPayload } from "./types.js";

/**
 * Returns the JWT payload without verifying it.
 *
 * This function is exported (as a named export) from the main `'quick-auth'` module
 * entry point as well as from its subpath export `'quick-auth/decodeJwt'`.
 */
export function decodeJwt(token: string) {
  return joseDecodeJwt(token) as JWTPayload;
}
