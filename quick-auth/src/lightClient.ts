import { generateNonce, verifySiwf } from "./actions/index.js";
import { Config, createConfig } from "./config.js";

export type LightClient = {
  generateNonce: () => generateNonce.ReturnType;
  verifySiwf: (options: verifySiwf.Options) => verifySiwf.ReturnType;
}

export declare namespace createLightClient {
  type Options = Partial<Config>;
  type ReturnType = LightClient;
}

/**
 * For use on frontends where JWT verification is not necessary.
 */
export function createLightClient(options: createLightClient.Options = {}): createLightClient.ReturnType {
  const config = createConfig(options);

  return {
    generateNonce: () => generateNonce(config),
    verifySiwf: (options: verifySiwf.Options) => verifySiwf(config, options),
  }
}
