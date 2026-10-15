'use client';
import {createContext,useContext,useEffect,useMemo,useRef,type ReactNode} from 'react';
import {useMutation} from 'convex/react';
import {useAuthToken,useConvexAuth} from '@convex-dev/auth/react';
import {api} from '@/convex/_generated/api';
import {actorFromToken,createFunnelTracker,type FunnelTracker} from '@/lib/funnel-client';
const JourneyContext=createContext<FunnelTracker|null>(null);
const unavailable=createFunnelTracker(async()=>({accepted:true}),{storage:()=>null,session:()=>null});
export function useJourney(){return useContext(JourneyContext)||unavailable;}
export function JourneyProvider({children}:{children:ReactNode}){
 const record=useMutation(api.funnel.recordBrowser),token=useAuthToken(),{isAuthenticated,isLoading}=useConvexAuth();
 const tracker=useMemo(()=>createFunnelTracker(event=>record(event)),[record]);
 useEffect(()=>{tracker.setActor(actorFromToken(token));},[tracker,token]);
 const observed=useRef(false);
 useEffect(()=>{
  tracker.start();const online=()=>{void tracker.flush();};window.addEventListener('online',online);
  return()=>{tracker.stop();window.removeEventListener('online',online);};
 },[tracker]);
 useEffect(()=>{
  if(isLoading)return;
  if(!isAuthenticated){observed.current=false;return;}
  if(observed.current)return;observed.current=true;
  const pending=tracker.pendingAuth();
  tracker.track(pending?'auth_observed_authenticated':'session_restored',pending?{...pending,elapsedMs:Date.now()-pending.startedAt}:{});
  tracker.clearAuth();
 },[isAuthenticated,isLoading,tracker]);
 return <JourneyContext.Provider value={tracker}>{children}</JourneyContext.Provider>;
}
