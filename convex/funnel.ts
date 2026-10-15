import { getAuthUserId } from '@convex-dev/auth/server';
import { RateLimiter, MINUTE } from '@convex-dev/rate-limiter';
import { v } from 'convex/values';
import { mutation, internalMutation, env, type MutationCtx } from './_generated/server';
import { components } from './_generated/api';
import { browserFunnelNames, serverFunnelNames, funnelErrorCodes, isJourneyId } from '../lib/funnel-events';
import type { FunnelDetails } from '../lib/funnel-events';
import type { Id } from './_generated/dataModel';

const errors = v.union(...funnelErrorCodes.map(v.literal));
export const contextFields = { visitId: v.optional(v.string()), attemptId: v.optional(v.string()) };
const fields = { ...contextFields, method: v.optional(v.union(v.literal('password'), v.literal('google'))), flow: v.optional(v.union(v.literal('login'), v.literal('signup'))), orderId: v.optional(v.string()), elapsedMs: v.optional(v.number()), httpStatus: v.optional(v.number()), errorCode: v.optional(errors), retry: v.optional(v.boolean()), droppedEvents: v.optional(v.number()) };
const limiter = new RateLimiter(components.funnelRateLimiter, {
  visit: { kind: 'token bucket', rate: 90, period: MINUTE, capacity: 90 },
  global: { kind: 'token bucket', rate: 1000, period: MINUTE, capacity: 1000 }
});
export type ConfirmedEvent = FunnelDetails & { eventId: string; name: typeof serverFunnelNames[number]; userId?: Id<'users'>; visitId?: string; amount?: number; expectedCredits?: number; credits?: number };
function cleanContext(args: { visitId?: string; attemptId?: string }) {
  return { ...(isJourneyId(args.visitId) ? {visitId: args.visitId} : {}), ...(isJourneyId(args.attemptId) ? {attemptId: args.attemptId} : {}) };
}
export function journeyContext(args: Record<string, unknown>) { return cleanContext(args as {visitId?: string; attemptId?: string}); }
function deploymentMetadata() {
  return { backendUrl: env.CONVEX_CLOUD_URL, backendRelease: env.FUNNEL_RELEASE || 'unversioned', instrumentationVersion: 'auth-checkout-v1', paymentMode: (env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'test' : env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'live' : 'unknown') as 'test' | 'live' | 'unknown' };
}
export async function writeConfirmed(ctx: MutationCtx, args: ConfirmedEvent) {
  if (await ctx.db.query('funnelEvents').withIndex('by_source_and_eventId', q => q.eq('source', 'server').eq('eventId', args.eventId)).unique()) return;
  await ctx.db.insert('funnelEvents', { ...args, ...cleanContext(args), source: 'server', receivedAt: Date.now(), ...deploymentMetadata() });
}
export const recordServer = internalMutation({
  args: { ...fields, eventId: v.string(), name: v.union(...serverFunnelNames.map(v.literal)), userId: v.optional(v.id('users')), amount: v.optional(v.number()), expectedCredits: v.optional(v.number()), credits: v.optional(v.number()) },
  returns: v.null(), handler: async (ctx, args) => { await writeConfirmed(ctx, args); return null; }
});
export const recordBrowser = mutation({
  args: { ...fields, eventId: v.string(), name: v.union(...browserFunnelNames.map(v.literal)), visitId: v.string(), actorId: v.optional(v.id('users')), clientAt: v.number() },
  returns: v.object({ accepted: v.boolean(), retryAfter: v.optional(v.number()) }),
  handler: async (ctx, args) => {
    if (!isJourneyId(args.eventId) || !isJourneyId(args.visitId) || (args.attemptId && !isJourneyId(args.attemptId)) || !Number.isFinite(args.clientAt) || (args.elapsedMs !== undefined && (!Number.isFinite(args.elapsedMs) || args.elapsedMs < 0 || args.elapsedMs > 86400000)) || (args.orderId && args.orderId.length > 100) || (args.httpStatus !== undefined && (!Number.isSafeInteger(args.httpStatus) || args.httpStatus < 100 || args.httpStatus > 599)) || (args.droppedEvents !== undefined && (!Number.isSafeInteger(args.droppedEvents) || args.droppedEvents < 0 || args.droppedEvents > 1000000))) throw new Error('Invalid diagnostic metadata.');
    if (await ctx.db.query('funnelEvents').withIndex('by_source_and_eventId', q => q.eq('source', 'browser').eq('eventId', args.eventId)).unique()) return { accepted: true };
    for (const [name, options] of [['visit', {key: args.visitId}], ['global', {}]] as const) {
      const result = await limiter.limit(ctx, name, options);
      if (!result.ok) return { accepted: false, retryAfter: result.retryAfter };
    }
    const currentUser = await getAuthUserId(ctx);
    // Replayed events from a previous account must not attach to the current account.
    const userId = currentUser && currentUser === args.actorId ? currentUser : undefined;
    let orderId: string | undefined;
    if (args.orderId && userId) {
      const suppliedOrderId=args.orderId;
      const order = await ctx.db.query('paymentOrders').withIndex('by_order_id', q => q.eq('orderId', suppliedOrderId)).unique();
      if (order?.userId === userId) orderId = args.orderId;
    }
    const event = { ...args }; delete event.actorId;
    await ctx.db.insert('funnelEvents', { ...event, userId, orderId, source: 'browser', receivedAt: Date.now(), ...deploymentMetadata() });
    return { accepted: true };
  }
});
