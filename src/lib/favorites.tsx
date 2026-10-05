import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from './auth';
import { supabase } from './supabase';

type FavoritesState = { ids: Set<string>; toggle: (listingId: string) => void; reload: () => Promise<void> };

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!userId) return setIds(new Set());
    const { data } = await supabase.from('favorites').select('listing_id');
    setIds(new Set((data ?? []).map((f) => f.listing_id)));
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(
    async (listingId: string) => {
      if (!userId) {
        router.push('/connexion');
        return;
      }
      const had = ids.has(listingId);
      setIds((prev) => {
        const next = new Set(prev);
        if (had) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      const { error } = had
        ? await supabase.from('favorites').delete().eq('listing_id', listingId)
        : await supabase.from('favorites').insert({ listing_id: listingId });
      if (error) reload();
    },
    [ids, userId, reload],
  );

  const value = useMemo(() => ({ ids, toggle, reload }), [ids, toggle, reload]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
