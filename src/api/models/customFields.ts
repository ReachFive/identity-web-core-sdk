/**
 * Account-defined custom profile fields.
 */
export type CustomFieldType =
  'number' | 'integer' | 'decimal' | 'string' | 'date' | 'checkbox' | 'select' | 'tags' | 'object' | 'phone' | 'email'

export type LabelTranslation = {
  langCode: string
  label: string
}

export type SelectableValue = {
  value: string
  label: string
  translations: LabelTranslation[]
}

export type CustomField = {
  id?: string
  name: string
  nameTranslations?: LabelTranslation[]
  path: string
  dataType: CustomFieldType
  selectableValues?: SelectableValue[]
  scope?: string
  readScope?: string
}
