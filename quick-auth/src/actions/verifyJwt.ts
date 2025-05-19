import { Config } from "../config.js";
import { verifyJwtWithJwks } from "./verifyJwtWithJwks.js";

export declare namespace verifyJwt {
  type Options = verifyJwtWithJwks.Options;
  type ReturnValue = verifyJwtWithJwks.ReturnValue;
  type ReturnType = verifyJwtWithJwks.ReturnType;
  type ErrorType = verifyJwtWithJwks.ErrorType;
}

export async function verifyJwt(config: Config, options: verifyJwt.Options): verifyJwt.ReturnType {
  return verifyJwtWithJwks(config, options);
}
