export function expectIframeWithParams(iframeId: string, src: string) {
  // "wm" needed to make sure the randomized id is valid
  const iframe = document.querySelector(`#wm${iframeId}`)
  expect(iframe).not.toBeNull()
  expect(iframe?.getAttribute('height')).toBe('0')
  expect(iframe?.getAttribute('width')).toBe('0')
  expect(iframe?.getAttribute('src')).toEqual(src)
}
