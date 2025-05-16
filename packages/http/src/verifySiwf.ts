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

export const path = '/verify-siwf';
