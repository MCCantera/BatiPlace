import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { RequireAuth } from '@/components/require-auth';
import { Empty, H1, Loading, P, Screen } from '@/components/ui';
import type { SearchResult } from '@/lib/database.types';
import { useFavorites } from '@/lib/favorites';
import { supabase } from '@/lib/supabase';
import { space } from '@/lib/theme';

type FavListing = Pick<SearchResult, 'id' | 'title' | 'price_cents' | 'price_unit' | 'city' | 'condition' | 'category_id' | 'spec' | 'photo_path'>;

export default function FavoritesScreen() {
  return (
    <RequireAuth title="Favoris" reason="Sauvegardez des annonces pour les retrouver ici, sur le Web comme dans l’application.">
      <FavoritesList />
    </RequireAuth>
  );
}

function FavoritesList() {
  const { width } = useWindowDimensions();
  const favorites = useFavorites();
  const [items, setItems] = useState<FavListing[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('favorites')
        .select('listing:listings(id, title, price_cents, price_unit, city, condition, category_id, spec, status, listing_photos(path, position))')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          const rows = (data ?? []) as unknown as {
            listing: (Omit<FavListing, 'photo_path'> & { status: string; listing_photos: { path: string; position: number }[] }) | null;
          }[];
          setItems(
            rows
              .map((r) => r.listing)
              .filter((l): l is NonNullable<typeof l> => Boolean(l) && l!.status === 'active')
              .map(({ listing_photos, status: _status, ...l }) => ({
                ...l,
                photo_path: [...listing_photos].sort((a, b) => a.position - b.position)[0]?.path ?? null,
              })),
          );
        });
    }, []),
  );

  const columns = width >= 1000 ? 4 : width >= 720 ? 3 : 2;
  const visible = (items ?? []).filter((l) => favorites.ids.has(l.id));

  return (
    <Screen>
      <H1>Favoris</H1>
      {items === null ? (
        <Loading />
      ) : visible.length === 0 ? (
        <Empty title="Aucun favori pour l’instant" body="Touchez le cœur d’une annonce pour la retrouver ici." />
      ) : (
        <>
          <P muted>{visible.length} annonce{visible.length > 1 ? 's' : ''} sauvegardée{visible.length > 1 ? 's' : ''}</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {visible.map((l) => (
              <View key={l.id} style={{ width: `${100 / columns - 3}%`, flexGrow: 1 }}>
                <ListingCard listing={l} favorite onToggleFavorite={() => favorites.toggle(l.id)} />
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
