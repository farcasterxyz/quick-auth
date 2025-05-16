import { generateNonce, verifySiwf, verifyJwt } from "./actions/index.js";
import { Config, createConfig } from "./config.js";

export type Client = {
  generateNonce: () => generateNonce.ReturnType;
  verifyJwt: (options: verifyJwt.Options) => verifyJwt.ReturnType;
  verifySiwf: (options: verifySiwf.Options) => verifySiwf.ReturnType;
}

export declare namespace createClient {
  type Options = Partial<Config>;
  type ReturnType = Client;
}

export function createClient(options: createClient.Options): createClient.ReturnType {
  const config = createConfig(options);

  return {
    generateNonce: () => generateNonce(config),
    verifyJwt: (options: verifyJwt.Options) => verifyJwt(config, options),
    verifySiwf: (options: verifySiwf.Options) => verifySiwf(config, options),
  }
}
