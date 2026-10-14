import { config } from "zod/v4/core";

// Workers forbid dynamic code generation. zod v4 decides whether to JIT-compile
// object schemas with `new Function()` once, when each schema is constructed,
// using a bare `new Function("")` probe. That probe can succeed at Worker
// startup while `new Function()` still throws per request, which makes every
// `safeParse` die with "EvalError: Code generation from strings disallowed".
// Force the interpreted path. This module must be imported before anything
// that constructs a zod/v4 schema (i.e. before `@farcaster/quick-auth`).
config({ jitless: true });
