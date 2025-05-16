import { Config } from "../config.js";
import { Nonce } from "../endpoints/index.js";
export declare namespace generateNonce {
    type ReturnValue = Nonce.ResponseBody;
    type ReturnType = Promise<ReturnValue>;
}
export declare function generateNonce({ origin }: Config): generateNonce.ReturnType;
