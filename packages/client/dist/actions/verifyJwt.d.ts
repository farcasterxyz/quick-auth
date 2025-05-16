import { Config } from "../config.js";
import { VerifyJwt } from "../endpoints/index.js";
export declare namespace verifyJwt {
    type Options = VerifyJwt.RequestQueryParameters;
    type ReturnValue = VerifyJwt.ResponseBody;
    type ReturnType = Promise<ReturnValue>;
}
export declare function verifyJwt({ origin }: Config, options: verifyJwt.Options): verifyJwt.ReturnType;
