import type { Id } from '../convex/_generated/dataModel';

export const browserFunnelNames = [
  'telemetry_probe',
  'auth_started', 'auth_failed', 'auth_redirect_started', 'auth_observed_authenticated', 'session_restored',
  'logout_started', 'logout_succeeded', 'logout_failed', 'checkout_viewed', 'checkout_details_failed',
  'checkout_clicked', 'checkout_script_ready', 'checkout_script_failed', 'checkout_opened', 'checkout_closed',
  'checkout_failed', 'payment_callback_received', 'verification_started', 'verification_succeeded', 'verification_failed'
] as const;
export const serverFunnelNames = [
  'auth_started', 'auth_failed', 'auth_credentials_accepted', 'account_created', 'session_created',
  'order_started', 'order_created', 'order_failed', 'verification_started', 'verification_succeeded',
  'verification_failed', 'payment_recovered', 'credits_granted', 'checkout_details_failed'
] as const;
export const funnelErrorCodes = ['account_exists', 'account_not_found', 'incorrect_password', 'invalid_input', 'auth_failed', 'network', 'timeout', 'configuration', 'provider_auth', 'provider_failed', 'order_not_owned', 'signature_mismatch', 'payment_mismatch', 'payment_pending', 'unknown'] as const;
export type FunnelErrorCode = typeof funnelErrorCodes[number];
export type FunnelDetails = {
  attemptId?: string; method?: 'google' | 'password'; flow?: 'login' | 'signup'; orderId?: string;
  elapsedMs?: number; droppedEvents?: number; httpStatus?: number; errorCode?: FunnelErrorCode; retry?: boolean;
};
export type BrowserFunnelEvent = FunnelDetails & {
  eventId: string; name: typeof browserFunnelNames[number]; visitId: string; actorId?: Id<'users'>; clientAt: number;
};
export const isJourneyId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function funnelErrorCode(error: unknown): FunnelErrorCode {
  const e = error as {data?: {code?: string; message?: string}; message?: string; name?: string};
  const text = `${e?.data?.code || ''} ${e?.data?.message || ''} ${e?.message || ''}`;
  if (/already exists|already.*account/i.test(text)) return 'account_exists';
  if (/ACCOUNT_NOT_FOUND|InvalidAccountId/.test(text)) return 'account_not_found';
  if (/INCORRECT_PASSWORD|InvalidSecret|Invalid credentials/.test(text)) return 'incorrect_password';
  if (/signature did not match/i.test(text)) return 'signature_mismatch';
  if (/order not found|not found for this account/i.test(text)) return 'order_not_owned';
  if (/details do not match|unexpected order/i.test(text)) return 'payment_mismatch';
  if (/not captured/i.test(text)) return 'payment_pending';
  if (/credentials|401/.test(text) && /Razorpay/.test(text)) return 'provider_auth';
  if (/configured|configuration/i.test(text)) return 'configuration';
  if (e?.name === 'TimeoutError' || /too long|timed out/i.test(text)) return 'timeout';
  if (/network|fetch|connection/i.test(text) || e?.name === 'TypeError') return 'network';
  if (/required|password.*(length|characters)|at least|invalid.*(input|email)/i.test(text)) return 'invalid_input';
  if (/Razorpay|payment failed/i.test(text)) return 'provider_failed';
  return 'unknown';
}
