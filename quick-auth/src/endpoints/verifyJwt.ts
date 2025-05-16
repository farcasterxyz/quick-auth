import { z } from "zod";

export type RequestQueryParameters = {
  token: string;
  domain: string;
}


export type ResponseBody = {
  address: string;
  sub: string;
  iss: string;
  exp: number;
  aud: string;
}

export type BadRequestResponseBody = {
  error: 'invalid_token' | 'invalid_params'
  error_message: string;
}

export const requestQueryParametersSchema = z.object({
  token: z.string(),
  domain: z.string(),
})
