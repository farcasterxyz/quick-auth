export type Config = {
  /**
   * Origin for the Farcaster Auth Server.
   *
   * @example https://auth.farcaster.xyz
   * @default https://auth.farcaster.xyz
   */
  origin: string;
}

export declare namespace createConfig {
  type Options = Partial<Config>;
}

export function createConfig(options: createConfig.Options) {
  return {
    origin: options.origin ?? 'https://auth.farcaster.xyz'
  }
}
