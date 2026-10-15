/// <reference types="vite/client" />
import {convexTest} from 'convex-test';
import rateLimiter from '@convex-dev/rate-limiter/test';
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {createHmac} from 'node:crypto';
import {api} from './_generated/api';
import schema from './schema';
const provider=vi.hoisted(()=>({failOrder:false,status:'captured',recover:false}));
vi.mock('razorpay',()=>({default:class {
 orders={create:async()=>{if(provider.failOrder)throw {statusCode:401};return {id:'order_synthetic',amount:20000,currency:'INR'};},fetchPayments:async()=>({items:provider.recover?[{id:'pay_synthetic',status:'captured',order_id:'order_synthetic',amount:20000,currency:'INR'}]:[]})};
 payments={fetch:async()=>({id:'pay_synthetic',order_id:'order_synthetic',amount:20000,currency:'INR',status:provider.status})};
}}));
const modules=import.meta.glob('./**/*.ts');
const visitId='00000000-0000-4000-8000-000000000001',attemptId='00000000-0000-4000-8000-000000000002';
beforeEach(()=>{vi.useFakeTimers();vi.stubEnv('CONVEX_CLOUD_URL','http://127.0.0.1:3220');vi.stubEnv('RAZORPAY_KEY_ID','rzp_test_synthetic');vi.stubEnv('RAZORPAY_KEY_SECRET','synthetic-secret');vi.stubEnv('RAZORPAY_AMOUNT_PAISE','20000');vi.stubEnv('EMAIL_ENABLED','false');provider.failOrder=false;provider.status='captured';provider.recover=false;});
afterEach(()=>{vi.useRealTimers();vi.unstubAllEnvs();});
async function setup(){const t=convexTest(schema,modules);rateLimiter.register(t,'funnelRateLimiter');const ids=await t.run(async ctx=>({owner:await ctx.db.insert('users',{}),other:await ctx.db.insert('users',{})}));return {t,...ids,user:t.withIdentity({subject:`${ids.owner}|session`})};}
const events=(t:Awaited<ReturnType<typeof setup>>['t'])=>t.run(ctx=>ctx.db.query('funnelEvents').take(200));
test('anonymous events are acknowledged and deduplicated; browser cannot assert confirmed outcomes or pass secrets',async()=>{
 const {t}=await setup();const event={eventId:crypto.randomUUID(),visitId,attemptId,name:'auth_started' as const,clientAt:Date.now(),method:'password' as const};
 expect(await t.mutation(api.funnel.recordBrowser,event)).toEqual({accepted:true});
 expect(await t.mutation(api.funnel.recordBrowser,event)).toEqual({accepted:true});expect(await events(t)).toHaveLength(1);
 await expect(t.mutation(api.funnel.recordBrowser,{...event,name:'credits_granted'} as never)).rejects.toThrow();
 await expect(t.mutation(api.funnel.recordBrowser,{...event,email:'private@example.invalid',password:'not-recorded'} as never)).rejects.toThrow();
 const row=(await events(t))[0];expect(row).toMatchObject({source:'browser',paymentMode:'test'});expect(row.userId).toBeUndefined();
});
test('replayed events cannot attach to another account or link an order it does not own',async()=>{
 const {t,user,owner,other}=await setup();await t.run(ctx=>ctx.db.insert('paymentOrders',{userId:other,orderId:'order_other',amount:20000,currency:'INR',status:'created',createdAt:Date.now()}));
 const e={eventId:crypto.randomUUID(),visitId,name:'checkout_opened' as const,clientAt:Date.now(),actorId:other,orderId:'order_other'};
 await user.mutation(api.funnel.recordBrowser,e);await user.mutation(api.funnel.recordBrowser,{...e,eventId:crypto.randomUUID(),actorId:owner});
 const rows=await events(t);expect(rows[0].userId).toBeUndefined();expect(rows[0].orderId).toBeUndefined();expect(rows[1].userId).toBe(owner);expect(rows[1].orderId).toBeUndefined();
});
test('browser noise is bounded and can retry after rate limiting',async()=>{
 const {t}=await setup();let rejected=0;
 for(let i=0;i<95;i++)if(!(await t.mutation(api.funnel.recordBrowser,{eventId:crypto.randomUUID(),visitId,name:'auth_failed',clientAt:Date.now()})).accepted)rejected++;
 expect(rejected).toBeGreaterThan(0);expect((await events(t)).length).toBeLessThan(95);
 await vi.advanceTimersByTimeAsync(60000);expect((await t.mutation(api.funnel.recordBrowser,{eventId:crypto.randomUUID(),visitId,name:'auth_failed',clientAt:Date.now()})).accepted).toBe(true);
});
test('confirmed order and credit events survive a successful verification and duplicate callback without duplicate credits',async()=>{
 const {t,user}=await setup();await user.action(api.razorpay.createOrder,{visitId,attemptId});
 const signature=createHmac('sha256','synthetic-secret').update('order_synthetic|pay_synthetic').digest('hex');
 const payload={visitId,attemptId,razorpay_order_id:'order_synthetic',razorpay_payment_id:'pay_synthetic',razorpay_signature:signature};
 await user.action(api.razorpay.verifyPayment,payload);await user.action(api.razorpay.verifyPayment,payload);
 expect((await user.query(api.payments.status,{})).credits).toBe(4);
 const rows=await events(t);expect(rows.filter(e=>e.name==='order_created')).toHaveLength(1);expect(rows.filter(e=>e.name==='credits_granted')).toHaveLength(1);
 expect(rows.find(e=>e.name==='credits_granted')).toMatchObject({source:'server',credits:4,expectedCredits:4,orderId:'order_synthetic'});
 expect(rows.filter(e=>e.name==='verification_succeeded')).toHaveLength(2);expect(JSON.stringify(rows)).not.toContain(signature);
 expect(rows.find(e=>e.name==='order_created')).toMatchObject({visitId,attemptId});
});
test('provider configuration failure and bad signature are recorded without granting credits',async()=>{
 const {t,user}=await setup();provider.failOrder=true;await expect(user.action(api.razorpay.createOrder,{visitId,attemptId})).rejects.toThrow();
 expect((await events(t)).find(e=>e.name==='order_failed')).toMatchObject({errorCode:'provider_auth'});
 provider.failOrder=false;await user.action(api.razorpay.createOrder,{visitId,attemptId});
 await expect(user.action(api.razorpay.verifyPayment,{visitId,attemptId,razorpay_order_id:'order_synthetic',razorpay_payment_id:'pay_synthetic',razorpay_signature:'wrong'})).rejects.toThrow();
 expect((await user.query(api.payments.status,{})).credits).toBe(0);
 expect((await events(t)).find(e=>e.name==='verification_failed')).toMatchObject({errorCode:'signature_mismatch',source:'server'});
});
test('captured-payment recovery records a distinct event and grants credits once',async()=>{
 const {t,user}=await setup();await user.action(api.razorpay.createOrder,{visitId,attemptId});provider.recover=true;
 await user.action(api.razorpay.checkoutDetails,{visitId,attemptId});await user.action(api.razorpay.checkoutDetails,{visitId,attemptId});
 expect((await user.query(api.payments.status,{})).credits).toBe(4);
 const rows=await events(t);expect(rows.filter(e=>e.name==='payment_recovered')).toHaveLength(1);expect(rows.filter(e=>e.name==='credits_granted')).toHaveLength(1);
});
test('missing password account remains a typed error and its diagnostic survives the rejection',async()=>{
 const {t}=await setup();await expect(t.action(api.auth.signIn,{provider:'password',params:{flow:'signIn',email:'nobody@example.invalid',password:'synthetic-password',telemetryVisitId:visitId,telemetryAttemptId:attemptId}})).rejects.toThrow();
 const rows=await events(t);expect(rows.find(e=>e.name==='auth_failed')).toMatchObject({source:'server',errorCode:'account_not_found',visitId,attemptId});
 expect(JSON.stringify(rows)).not.toMatch(/nobody@|synthetic-password/);
});
