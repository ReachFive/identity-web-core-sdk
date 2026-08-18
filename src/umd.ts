/**
 * Entry point for the UMD bundle, loaded via `<script>` / jsDelivr.
 *
 * Unlike the `es`/`cjs` entry point, this one ships runtime polyfills: consumers of the UMD
 * bundle have no build step of their own, so the SDK has to provide them. Bundler and Node
 * consumers get `src/main/index.ts` instead and polyfill according to their own targets.
 */
import './polyfills'

export * from './main/index'
