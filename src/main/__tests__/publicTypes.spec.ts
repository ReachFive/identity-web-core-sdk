/**
 * Every type named in the exported `Client` signature has to be reachable from the package entry
 * point, otherwise a consumer is handed a value it cannot name. This is a compile-time test: it
 * asserts nothing at runtime, but `ts-jest` fails the suite if any of these imports is missing.
 *
 * Until the declarations were bundled into a single `es/main.d.ts`, the build also published a
 * per-module tree, and consumers reached the sub-client types through `es/main/<module>` deep
 * imports. Those paths are gone, so the entry point is now the only supported way in.
 */
import type {
  DeleteTrustedDeviceParams,
  EmailVerificationParams,
  Events,
  GetUserParams,
  ListTrustedDevicesResponse,
  PhoneNumberVerificationParams,
  RemoveMfaEmailParams,
  RemoveMfaPhoneNumberParams,
  RemoveSessionDeviceParams,
  RequestAccountRecoveryParams,
  RequestPasswordResetParams,
  ResetPasskeysParams,
  StartMfaEmailRegistrationParams,
  StartMfaEmailRegistrationResponse,
  StartMfaPhoneNumberRegistrationParams,
  StartMfaPhoneNumberRegistrationResponse,
  StepUpParams,
  UnlinkParams,
  UpdateEmailParams,
  UpdatePasswordParams,
  UpdatePhoneNumberParams,
  UpdateProfileParams,
  VerifyEmailParams,
  VerifyMfaEmailRegistrationParams,
  VerifyMfaPasswordlessParams,
  VerifyMfaPhoneNumberRegistrationParams,
  VerifyPhoneNumberParams,
  WithPkceParams
} from '../index'

type PublicTypes = [
  DeleteTrustedDeviceParams,
  EmailVerificationParams,
  Events,
  GetUserParams,
  ListTrustedDevicesResponse,
  PhoneNumberVerificationParams,
  RemoveMfaEmailParams,
  RemoveMfaPhoneNumberParams,
  RemoveSessionDeviceParams,
  RequestAccountRecoveryParams,
  RequestPasswordResetParams,
  ResetPasskeysParams,
  StartMfaEmailRegistrationParams,
  StartMfaEmailRegistrationResponse,
  StartMfaPhoneNumberRegistrationParams,
  StartMfaPhoneNumberRegistrationResponse,
  StepUpParams,
  UnlinkParams,
  UpdateEmailParams,
  UpdatePasswordParams,
  UpdatePhoneNumberParams,
  UpdateProfileParams,
  VerifyEmailParams,
  VerifyMfaEmailRegistrationParams,
  VerifyMfaPasswordlessParams,
  VerifyMfaPhoneNumberRegistrationParams,
  VerifyPhoneNumberParams,
  WithPkceParams<unknown>
]

describe('public type surface', () => {
  test('every type used by the Client signature is exported from the entry point', () => {
    // The assertion lives in the import list above: this body only keeps Jest happy.
    const types: PublicTypes | undefined = undefined
    expect(types).toBeUndefined()
  })
})
