export function defineWindowProperty(propertyKey: string, propertyValue?: object) {
  return Object.defineProperty(window, propertyKey, {
    writable: true,
    value: propertyValue ?? { assign: jest.fn() },
  })
}

export const mockWindowCrypto = {
  getRandomValues: (_: Uint8Array) =>
    Uint8Array.from([
      232, 13, 106, 142, 120, 103, 229, 207, 154, 233, 25, 115, 160, 208, 85, 59, 40, 124, 18, 56, 69, 251, 83, 63, 102,
      164, 125, 65, 53, 14, 213, 172,
    ]),
  subtle: {
    digest: (_: AlgorithmIdentifier, __: ArrayBuffer) =>
      Promise.resolve(
        Uint8Array.from([
          40, 17, 208, 1, 36, 3, 28, 43, 86, 140, 49, 149, 25, 6, 143, 142, 194, 188, 115, 196, 165, 172, 125, 178, 126,
          109, 231, 66, 30, 249, 163, 94,
        ]).buffer
      ),
  },
}
