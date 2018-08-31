import { Validator, snakeCaseTransformation, errorDebugString } from 'validation.ts'


type AjaxParams<DATA> = {
  url: string
  validator?: Validator<DATA>
} & RequestInit

export function ajax<DATA = undefined>(params: AjaxParams<DATA>): Promise<DATA> {
  const { validator } = params

  return fetch(params.url, params).then(response => {
    if (response.status == 204) return undefined as any as DATA

    return response.json().then(json => {
      if (validator) {
        const validated = validator.validate(json, { transformObjectKeys: snakeCaseTransformation })

        if (validated.isOk())
          return validated.get()
        else
          throw new Error(`reach5 validation error: \n ${errorDebugString(validated.get())}`)
      }
      else {
        return json as DATA
      }
    })
  })
}