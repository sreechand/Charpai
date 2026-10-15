import {expect,test,vi} from 'vitest';
import type {ActionCtx} from './_generated/server';
import {tracePayment} from './funnelAction';
test('a diagnostics outage does not change a successful payment operation',async()=>{
 const logger=vi.spyOn(console,'error').mockImplementation(()=>{});
 const ctx={runQuery:vi.fn(async()=>null),runMutation:vi.fn(async()=>{throw Error('diagnostics unavailable');})} as unknown as ActionCtx;
 const result={success:true,order_id:'order_fixture'};
 try {expect(await tracePayment(ctx,{},'verification',async()=>result)).toEqual(result);expect(logger).toHaveBeenCalledTimes(2);}finally{logger.mockRestore();}
});
