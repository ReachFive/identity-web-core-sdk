/**
 * jsdom with a redefinable `window.location`.
 *
 * Since jsdom 21, `window.location` is defined `configurable: false`, as the HTML spec requires
 * ([LegacyUnforgeable]). The specs replace it with a stub through `Object.defineProperty`, to observe
 * redirects without navigating. This environment keeps that possible: while jsdom builds its window,
 * it leaves `location` configurable. Nothing else about the window changes.
 */
const { TestEnvironment } = require('jest-environment-jsdom')

class RedefinableLocationEnvironment extends TestEnvironment {
  constructor(config, context) {
    const defineProperties = Object.defineProperties
    Object.defineProperties = function (target, descriptors) {
      if (descriptors && descriptors.location && descriptors.location.configurable === false) {
        descriptors = { ...descriptors, location: { ...descriptors.location, configurable: true } }
      }
      return defineProperties.call(this, target, descriptors)
    }
    try {
      super(config, context)
    } finally {
      Object.defineProperties = defineProperties
    }
  }
}

module.exports = RedefinableLocationEnvironment
