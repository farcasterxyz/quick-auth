import { z } from "zod";

export type RequestQueryParameters = {
  token: string;
  domain: string;
}


export type ResponseBody = {
  /**
   * The address the user signed in with.
   */
  address: string;

  /**
   * The user's Farcaster ID.
   */
  sub: number;

  /**
   * The Farcaster Quick Auth server that issued this token.
   */
  iss: string

  /**
   * The domain this token was issued to.
   */
  aud: string;

  /**
   * The JWT expiration time.
   */
  exp: number

  /**
   * The JWT issued at time.
   */
  iat: number
}

export type BadRequestResponseBody = {
  error: 'invalid_token' | 'invalid_params'
  error_message: string;
}

export const requestQueryParametersSchema = z.object({
  token: z.string(),
  domain: z.string(),
})
