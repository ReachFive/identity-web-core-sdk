/**
 * Runtime polyfills for the UMD bundle only — see `src/umd.ts`. Bundler and Node consumers get
 * `src/main/index.ts` and polyfill according to their own targets.
 *
 * `fetch` is the one API a `<script>`-tag consumer could plausibly be missing, and it fails hard
 * rather than degrading, so it is worth shipping.
 *
 * ES built-ins are not polyfilled, and polyfilling them would be pointless. The SDK's floor is
 * Chrome 92 / Safari 15.4, set by `crypto.subtle` (PKCE code challenge, One Tap nonce) and
 * `crypto.randomUUID` (correlation id), which no polyfill can provide. Every built-in the SDK uses
 * is native well below that floor — the most modern is `Object.fromEntries`, from ES2019.
 */
import 'whatwg-fetch'
