import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Profile } from './database.types';
import { identifyPurchaser } from './purchases';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthState = {
  ready: boolean;
  session: Session | null;
  userId: string | null;
  profile: Profile | null;
  subscribed: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setSubscribed(false);
      return;
    }
    const [{ data: p }, { data: sub }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.rpc('has_active_subscription', { uid: userId }),
    ]);
    setProfile(p ?? null);
    setSubscribed(Boolean(sub));
  }, [userId]);

  useEffect(() => {
    refresh();
    identifyPurchaser(userId);
  }, [refresh, userId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ ready, session, userId, profile, subscribed, refresh, signOut }),
    [ready, session, userId, profile, subscribed, refresh, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
