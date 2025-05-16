import { z } from "zod/v4";

export type RequestBody = {
  message: string;
  domain: string;
  signature: string;
}

export type ResponseBody = {
  valid: true;
  token: string;
} | {
  valid: false;
  message?: string;
}

export const requestBodySchema = z.object({
  message: z.string(),
  domain: z.string(),
  signature: z.string(),
})
