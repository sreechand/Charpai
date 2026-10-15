import { internal } from './_generated/api';
import type { ActionCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { journeyContext, type ConfirmedEvent } from './funnel';
import { funnelErrorCode } from '../lib/funnel-events';

export async function safeFunnelWrite(ctx: Pick<ActionCtx, 'runMutation'>, event: ConfirmedEvent) {
  try { await ctx.runMutation(internal.funnel.recordServer, event); }
  catch { console.error(JSON.stringify({ event: 'funnel_write_failed', name: event.name })); }
}
export async function tracePayment<T>(ctx: ActionCtx, args: Record<string, unknown>, operation: 'order' | 'verification' | 'details', run: (userId: Id<'users'> | null) => Promise<T>): Promise<T> {
  const context = journeyContext(args), startedAt = Date.now(), key = `${operation}:${startedAt}:${Math.random()}`;
  const userId = await ctx.runQuery(internal.payments.identity, {});
  if (operation !== 'details') await safeFunnelWrite(ctx, { ...context, ...(userId ? {userId} : {}), eventId: `${key}:start`, name: operation === 'order' ? 'order_started' : 'verification_started' });
  try {
    const result = await run(userId);
    if (operation === 'verification') await safeFunnelWrite(ctx, { ...context, ...(userId ? {userId} : {}), eventId: `${key}:success`, name: 'verification_succeeded', elapsedMs: Date.now()-startedAt, orderId: (result as {order_id: string}).order_id });
    return result;
  } catch (error) {
    let orderId: string | undefined;
    if (userId && typeof args.razorpay_order_id === 'string') {
      try {
        const order = await ctx.runQuery(internal.payments.ownedOrder, {userId, orderId: args.razorpay_order_id});
        if (order) orderId = order.orderId;
      } catch { /* A diagnostic lookup must not replace the original payment error. */ }
    }
    await safeFunnelWrite(ctx, { ...context, ...(userId ? {userId} : {}), ...(orderId ? {orderId} : {}), eventId: `${key}:failed`, name: operation === 'order' ? 'order_failed' : operation === 'verification' ? 'verification_failed' : 'checkout_details_failed', elapsedMs: Date.now()-startedAt, errorCode: funnelErrorCode(error) });
    throw error;
  }
}
