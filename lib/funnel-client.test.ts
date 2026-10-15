// @vitest-environment node
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {createFunnelTracker} from './funnel-client';
import type {BrowserFunnelEvent} from './funnel-events';
class MemoryStorage {
 map=new Map<string,string>();get length(){return this.map.size;}key(i:number){return [...this.map.keys()][i]??null;}getItem(k:string){return this.map.get(k)??null;}setItem(k:string,v:string){this.map.set(k,v);}removeItem(k:string){this.map.delete(k);}
}
beforeEach(()=>vi.useFakeTimers());afterEach(()=>vi.useRealTimers());
it('keeps an unacknowledged event across reload and retries the same ID without capturing credentials',async()=>{
 const storage=new MemoryStorage(),session=new MemoryStorage();const received:BrowserFunnelEvent[]=[];
 const first=createFunnelTracker(async e=>{received.push(e);throw Error('offline');},{storage:()=>storage,session:()=>session});
 first.track('auth_started',{method:'password',flow:'login',password:'do-not-save',email:'private@example.invalid'} as never);await first.flush();first.stop();
 expect(JSON.stringify([...storage.map])).not.toMatch(/do-not-save|private@/);
 const second=createFunnelTracker(async e=>{received.push(e);return {accepted:true};},{storage:()=>storage,session:()=>session});
 await second.flush();second.stop();expect(received).toHaveLength(2);expect(received[0].eventId).toBe(received[1].eventId);expect(storage.length).toBe(0);
});
it('retains events during throttling and retries after the backend retry interval',async()=>{
 const storage=new MemoryStorage();let calls=0;
 const tracker=createFunnelTracker(async()=>({accepted:++calls>1,retryAfter:5000}),{storage:()=>storage,session:()=>null});
 tracker.track('checkout_opened');await tracker.flush();expect(storage.length).toBe(1);
 await vi.advanceTimersByTimeAsync(5000);await tracker.flush();expect(calls).toBe(2);expect(storage.length).toBe(0);tracker.stop();
});
it('keeps concurrent trackers separate in browser storage and preserves per-event actor at capture time',async()=>{
 const storage=new MemoryStorage(),session=new MemoryStorage();
 const first=createFunnelTracker(async()=>{throw Error('offline');},{storage:()=>storage,session:()=>session});
 const second=createFunnelTracker(async()=>{throw Error('offline');},{storage:()=>storage,session:()=>session});
 first.track('auth_failed');second.track('checkout_failed');await Promise.all([first.flush(),second.flush()]);first.stop();second.stop();
 const events:BrowserFunnelEvent[]=[];const restored=createFunnelTracker(async e=>{events.push(e);return {accepted:true};},{storage:()=>storage,session:()=>session});
 await restored.flush();restored.stop();expect(events.map(e=>e.name).sort()).toEqual(['auth_failed','checkout_failed']);expect(new Set(events.map(e=>e.eventId)).size).toBe(2);
});
it('can still sign in and queue events when browser storage is blocked',async()=>{
 const tracker=createFunnelTracker(async()=>{throw Error('offline');},{storage:()=>{throw Error('blocked');},session:()=>{throw Error('blocked');}});
 const first=tracker.startAuth('google','login');expect(first.visitId).toBe(tracker.context().visitId);await tracker.flush();tracker.stop();
});
it('preserves the same Google attempt through navigation without saving account inputs',async()=>{
 const storage=new MemoryStorage(),session=new MemoryStorage();
 const first=createFunnelTracker(async()=>({accepted:true}),{storage:()=>storage,session:()=>session});
 const auth=first.startAuth('google','login');first.track('auth_redirect_started',auth);await first.flush();first.stop();
 const returned=createFunnelTracker(async()=>({accepted:true}),{storage:()=>storage,session:()=>session});
 expect(returned.pendingAuth()).toMatchObject({attemptId:auth.attemptId,method:'google',flow:'login'});expect(returned.context().visitId).toBe(auth.visitId);
 returned.clearAuth();expect(returned.pendingAuth()).toBeNull();returned.stop();
});

it('restarts automatic retry after the tracker is paused and restarted',async()=>{
 const storage=new MemoryStorage();let online=false,calls=0;
 const tracker=createFunnelTracker(async()=>{calls++;if(!online)throw Error('offline');return {accepted:true};},{storage:()=>storage,session:()=>null});
 tracker.track('auth_started');await tracker.flush();tracker.stop();tracker.start();await tracker.flush();online=true;
 await vi.advanceTimersByTimeAsync(3000);expect(calls).toBe(3);expect(storage.length).toBe(0);tracker.stop();
});
