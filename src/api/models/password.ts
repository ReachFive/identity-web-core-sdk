/**
 * Password strength scoring and the account password policy.
 */
export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
  score: PasswordStrengthScore
}

export type PasswordPolicy = {
  minLength: number
  minStrength: PasswordStrengthScore
  uppercaseCharacters?: number
  specialCharacters?: number
  lowercaseCharacters?: number
  digitCharacters?: number
  allowUpdateWithAccessTokenOnly: boolean
}
