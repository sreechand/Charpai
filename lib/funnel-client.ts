import type { Id } from '../convex/_generated/dataModel';
import { browserFunnelNames, funnelErrorCodes, isJourneyId, type BrowserFunnelEvent, type FunnelDetails } from './funnel-events';
const PREFIX = 'charpai-funnel-v1:event:', VISIT = 'charpai-funnel-v1:visit', AUTH = 'charpai-funnel-v1:auth', DROPPED = 'charpai-funnel-v1:dropped';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
type PendingAuth = {attemptId: string; method: 'google' | 'password'; flow: 'login' | 'signup'; startedAt: number};
export function createFunnelTracker(send: (event: BrowserFunnelEvent) => Promise<{accepted: boolean; retryAfter?: number}>, options: {storage?: () => Store | null; session?: () => Store | null; actorId?: Id<'users'>} = {}) {
  let actorId=options.actorId;
  const memory = new Map<string, BrowserFunnelEvent>();
  let fallbackVisit: string | undefined, timer: ReturnType<typeof setTimeout> | undefined, active: Promise<void> | undefined, stopped = false, failures = 0, dropped = 0;
  const store = () => {try {return options.storage ? options.storage() : typeof window !== 'undefined' ? localStorage : null;} catch {return null;}};
  const session = () => {try {return options.session ? options.session() : typeof window !== 'undefined' ? sessionStorage : null;} catch {return null;}};
  const get = (s: Store | null, key: string) => {try {return s?.getItem(key) ?? null;} catch {return null;}};
  const put = (s: Store | null, key: string, value: string) => {try {s?.setItem(key, value);} catch { /* Memory still retains pending events. */ }};
  const remove = (key: string) => {memory.delete(key);try {store()?.removeItem(PREFIX+key);} catch { /* A later replay is deduplicated by the backend. */ }};
  function context() {
    const saved = get(session(), VISIT);
    if (isJourneyId(saved)) return {visitId: saved};
    fallbackVisit ??= crypto.randomUUID(); put(session(), VISIT, fallbackVisit); return {visitId: fallbackVisit};
  }
  function cleanDetails(d: FunnelDetails): FunnelDetails {
    return { ...(isJourneyId(d.attemptId) ? {attemptId: d.attemptId} : {}), ...(d.method === 'google' || d.method === 'password' ? {method: d.method} : {}), ...(d.flow === 'login' || d.flow === 'signup' ? {flow: d.flow} : {}), ...(typeof d.orderId === 'string' && /^order_[a-zA-Z0-9_]{1,80}$/.test(d.orderId) ? {orderId: d.orderId} : {}), ...(typeof d.elapsedMs === 'number' && Number.isFinite(d.elapsedMs) && d.elapsedMs >= 0 && d.elapsedMs <= 86400000 ? {elapsedMs: d.elapsedMs} : {}), ...(typeof d.httpStatus === 'number' && d.httpStatus >= 100 && d.httpStatus <= 599 ? {httpStatus: d.httpStatus} : {}), ...(d.errorCode && funnelErrorCodes.includes(d.errorCode) ? {errorCode: d.errorCode} : {}), ...(typeof d.retry === 'boolean' ? {retry: d.retry} : {}), ...(Number.isSafeInteger(d.droppedEvents) && d.droppedEvents! >= 0 ? {droppedEvents:d.droppedEvents} : {}) };
  }
  function pending() {
    const s = store();
    try {
      for (let i=0; s && i<s.length; i++) {
        const key = s.key(i); if (!key?.startsWith(PREFIX)) continue;
        try {
          const e = JSON.parse(s.getItem(key) || 'null') as BrowserFunnelEvent;
          if (!e || !isJourneyId(e.eventId) || !isJourneyId(e.visitId) || !browserFunnelNames.includes(e.name) || !Number.isFinite(e.clientAt)) continue;
          memory.set(e.eventId, {eventId:e.eventId,visitId:e.visitId,name:e.name,clientAt:e.clientAt,...(e.actorId ? {actorId:e.actorId} : {}),...cleanDetails(e)});
        } catch { /* Ignore corrupted recovery entries. */ }
      }
    } catch { /* Storage access can be disabled by the browser. */ }
    return [...memory.values()].sort((a,b)=>a.clientAt-b.clientAt);
  }
  function schedule(delay: number) { if (!stopped && timer === undefined) timer = setTimeout(()=>{timer=undefined;void flush();},delay); }
  function flush(): Promise<void> {
    if (active || stopped) return active || Promise.resolve();
    active = (async () => {
      let retryDelay = 0;
      for (const e of pending()) {
        try {
          const result = await send(e);
          if (!result.accepted) {retryDelay=Math.max(1000,result.retryAfter || 1000);break;}
          remove(e.eventId); failures=0;
        } catch { retryDelay=Math.min(30000,1000*2**Math.min(failures++,5));break; }
      }
      if (retryDelay) schedule(retryDelay);
    })().finally(()=>{active=undefined;if (!timer && pending().length && !stopped) schedule(0);});
    return active;
  }
  function track(name: BrowserFunnelEvent['name'], details: FunnelDetails = {}) {
    if (stopped) return;
    const queue = pending();
    if (queue.length >= 200) {remove(queue[0].eventId);dropped++;put(store(),DROPPED,String(Number(get(store(),DROPPED)||0)+1));}
    const lost=Math.min(1000000,Math.max(dropped,Number(get(store(),DROPPED)||0)||0));
    const e: BrowserFunnelEvent = {eventId:crypto.randomUUID(),name,...context(),clientAt:Date.now(),...(actorId ? {actorId} : {}),...cleanDetails(details),...(lost ? {droppedEvents:lost} : {})};
    memory.set(e.eventId,e);put(store(),PREFIX+e.eventId,JSON.stringify(e));void flush();
  }
  function pendingAuth(): PendingAuth | null {
    try {const a=JSON.parse(get(session(),AUTH)||'null') as PendingAuth;if(a && isJourneyId(a.attemptId) && ['google','password'].includes(a.method) && ['login','signup'].includes(a.flow))return a;}catch { /* No saved authentication attempt. */ }return null;
  }
  return {
    track, flush, context,
    setActor(value: Id<'users'> | undefined) {actorId=value;},
    startAuth(method: PendingAuth['method'], flow: PendingAuth['flow']) {const a={attemptId:crypto.randomUUID(),method,flow,startedAt:Date.now()};put(session(),AUTH,JSON.stringify(a));track('auth_started',a);return {...context(),...a};},
    pendingAuth,
    clearAuth() {try {session()?.removeItem(AUTH);} catch { /* Only a recovery hint. */ }},
    resetVisit() {fallbackVisit=crypto.randomUUID();put(session(),VISIT,fallbackVisit);},
    droppedCount() {return Math.max(dropped,Number(get(store(),DROPPED)||0));},
    stop() {stopped=true;if(timer!==undefined)clearTimeout(timer);timer=undefined;},
    start() {stopped=false;void flush();}
  };
}
export type FunnelTracker = ReturnType<typeof createFunnelTracker>;
export function actorFromToken(token: string | null | undefined): Id<'users'> | undefined {
  try {if(!token)return;const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return typeof payload.sub==='string' ? payload.sub.split('|')[0] as Id<'users'> : undefined;}catch {return undefined;}
}
export function journeyHeaders(context: {visitId: string; attemptId: string}) {return {'X-Charpai-Visit':context.visitId,'X-Charpai-Attempt':context.attemptId};}
