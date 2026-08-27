/**
 * Minimal test-environment shims.
 *
 * jsdom 19, which ships with jest-environment-jsdom 28, does not expose `TextEncoder` or
 * `TextDecoder` as globals even though every browser has had them since 2017. `jose` builds its
 * encoder at module load time, so importing it fails outright without these.
 *
 * Deliberately narrow: `window.crypto` is still stubbed per-spec by
 * `__tests__/helpers/testHelpers.ts`, so that tests keep deterministic random values and digests.
 */
import { TextDecoder, TextEncoder } from 'util'

Object.assign(globalThis, {
  TextEncoder: globalThis.TextEncoder ?? TextEncoder,
  TextDecoder: globalThis.TextDecoder ?? TextDecoder
})
