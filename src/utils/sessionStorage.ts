export function getWithExpiry(key: string) {
  const storedValue = sessionStorage.getItem(key)
  if (!storedValue) {
    return null
  }
  try {
    const item = JSON.parse(storedValue)
    const now = new Date()
    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key)
      return null
    }
    return item.value
  } catch (e) {
    return null
  }
}
export function setWithExpiry(key: string, value: string, ttl: number) {
  const now = new Date()
  const item = {
    value,
    expiry: now.getTime() + ttl
  }
  sessionStorage.setItem(key, JSON.stringify(item))
}
