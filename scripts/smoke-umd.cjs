/**
 * Smoke-tests the built UMD bundles the way a `<script>`/jsDelivr consumer loads them.
 *
 * The Jest suite only ever exercises the TypeScript sources, so nothing else verifies that
 * the UMD wrapper actually publishes a usable `reach5` global — the failure mode being a
 * bundle that builds cleanly but throws on load (an unresolved import silently turned into
 * an external, for instance).
 *
 * Usage: npm run smoke:umd   (requires `npm run build` first)
 */
const fs = require('node:fs')
const path = require('node:path')
const { JSDOM } = require('jsdom')

const EXPECTED_METHOD_COUNT = 51

function loadAsScriptTag(bundlePath) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://app.example.com/' })
  const { window } = dom

  // This jsdom build ships no Web Crypto. Provide only what the SDK needs, which also
  // documents the SDK's real browser floor: `crypto.randomUUID` and `crypto.subtle`.
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-4000-8000-000000000000',
      getRandomValues: array => array,
      subtle: { digest: async () => new ArrayBuffer(32) }
    },
    configurable: true
  })

  const globals = ['window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'screen', 'crypto']
  for (const key of globals) globalThis[key] = window[key]
  globalThis.self = window

  // A real script tag has no `module`, `exports` or `define` in scope, which is what forces
  // the UMD wrapper down its browser-global branch.
  const source = fs.readFileSync(bundlePath, 'utf8')
  new Function('window', 'self', 'globalThis', source).call(globalThis, window, window, globalThis)

  return globalThis.reach5 ?? window.reach5
}

function check(bundlePath) {
  const name = path.basename(bundlePath)
  const reach5 = loadAsScriptTag(bundlePath)

  if (typeof reach5?.createClient !== 'function') {
    throw new Error(`${name}: expected a global \`reach5.createClient\` function, got ${typeof reach5?.createClient}`)
  }
  if (typeof globalThis.fetch !== 'function') {
    throw new Error(`${name}: the bundle should polyfill \`fetch\` for script-tag consumers`)
  }

  // `createClient` fires its /config bootstrap immediately; a never-settling fetch keeps the
  // assertion to construction only.
  globalThis.fetch = () => new Promise(() => {})
  const client = reach5.createClient({ clientId: 'abc', domain: 'local.reach5.net' })
  const methods = Object.keys(client)

  if (methods.length !== EXPECTED_METHOD_COUNT) {
    throw new Error(`${name}: expected ${EXPECTED_METHOD_COUNT} public members, got ${methods.length}`)
  }
  if (!(client.remoteSettings instanceof Promise)) {
    throw new Error(`${name}: \`remoteSettings\` should be a promise`)
  }

  console.log(`✓ ${name}: reach5.createClient() exposes ${methods.length} members`)
}

const bundles = ['umd/identity-core.js', 'umd/identity-core.min.js']
const missing = bundles.filter(bundle => !fs.existsSync(bundle))
if (missing.length > 0) {
  console.error(`Missing ${missing.join(', ')} — run \`npm run build\` first.`)
  process.exit(1)
}

for (const bundle of bundles) check(bundle)
