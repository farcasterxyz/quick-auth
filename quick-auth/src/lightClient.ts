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
 *
 * This function is exported (as a named export) from the main `'quick-auth'` module
 * entry point as well as from its subpath export `'quick-auth/light'`.
 */
export function createLightClient(options: createLightClient.Options = {}): createLightClient.ReturnType {
  const config = createConfig(options);

  return {
    generateNonce: () => generateNonce(config),
    verifySiwf: (options: verifySiwf.Options) => verifySiwf(config, options),
  }
}
