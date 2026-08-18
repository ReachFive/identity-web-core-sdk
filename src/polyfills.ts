/**
 * Runtime polyfills for the UMD bundle only — see `src/umd.ts`.
 *
 * This used to be a blanket `import 'core-js'`, which accounted for ~86 kB gzipped of the
 * UMD bundle and was inlined into the `es`/`cjs` bundles as well. It polyfilled nothing the
 * SDK actually needs: the most modern built-in used in `src/` is `Object.fromEntries`
 * (ES2019, Chrome 73+ / Safari 12.1+), while the SDK's hard floor is already Chrome 92 /
 * Safari 15.4 because of `crypto.subtle` (PKCE, One Tap nonce) and `crypto.randomUUID`
 * (correlation id) — neither of which any polyfill can provide.
 *
 * `fetch` is kept because it is the one API a `<script>`-tag consumer could plausibly be
 * missing, and because it fails hard rather than degrading.
 */
import 'whatwg-fetch'
