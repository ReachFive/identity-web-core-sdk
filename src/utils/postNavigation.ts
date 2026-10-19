import { snakeCaseProperties } from './transformObjectProperties'

/**
 * Navigates the page with a POST request, by submitting a hidden form
 */
export function postWithNavigation(url: string, data: object): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  form.style.display = 'none'

  toFormFields(snakeCaseProperties(data)).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

function toFormFields(value: unknown, name?: string): [string, string][] {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.flatMap((item) => toFormFields(item, name))
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nested]) => toFormFields(nested, name ? `${name}.${key}` : key))
  }
  return name ? [[name, String(value)]] : []
}
