import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, ListingImage, Tag } from './ui';

import { conditionLabel, distanceLabel, money } from '@/lib/catalog';
import type { SearchResult } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { photoUrl } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

type CardListing = Pick<
  SearchResult,
  'id' | 'title' | 'price_cents' | 'price_unit' | 'city' | 'condition' | 'category_id' | 'photo_path' | 'spec'
> & { distance_km?: number; boosted?: boolean; seller_type?: SearchResult['seller_type'] };

export function ListingCard({
  listing,
  favorite,
  onToggleFavorite,
}: {
  listing: CardListing;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const t = useTheme();
  const { tr } = useI18n();
  const pro = listing.seller_type && listing.seller_type !== 'particulier';
  return (
    <Link href={{ pathname: '/annonce/[id]', params: { id: listing.id } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: t.surface, borderColor: listing.boosted ? t.accent : t.line },
          pressed && { opacity: 0.9 },
        ]}>
        <View>
          <ListingImage uri={photoUrl(listing.photo_path)} categoryId={listing.category_id} style={styles.image} />
          {listing.boosted ? (
            <View style={[styles.badge, { backgroundColor: t.accent }]}>
              <Text style={{ color: t.accentText, fontWeight: '700', fontSize: 12 }}>{tr('En vedette')}</Text>
            </View>
          ) : null}
          {onToggleFavorite ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favorite ? tr('Retirer des favoris') : tr('Ajouter aux favoris')}
              onPress={(e) => {
                e.preventDefault();
                onToggleFavorite();
              }}
              hitSlop={8}
              style={styles.fav}>
              <Icon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? t.danger : '#1e2a24'} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={[styles.price, { color: t.text }]}>
            {money(listing.price_cents)}
            {listing.price_unit ? <Text style={{ fontSize: 12, color: t.muted, fontWeight: '500' }}> {tr(listing.price_unit)}</Text> : null}
          </Text>
          <Text numberOfLines={2} style={{ color: t.text, fontSize: 15, fontWeight: '500', lineHeight: 20 }}>
            {listing.title}
          </Text>
          <Text numberOfLines={1} style={{ color: t.muted, fontSize: 13 }}>
            {listing.city}
            {listing.distance_km != null ? ` · ${distanceLabel(listing.distance_km)}` : ''}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            <Tag label={conditionLabel(listing.condition)} tone={listing.condition === 'neuf' ? 'ok' : listing.condition === 'surplus' ? 'accent' : 'neutral'} />
            {pro ? <Tag label={tr('Pro')} tone="brand" /> : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden', flex: 1 },
  image: { aspectRatio: 4 / 3, width: '100%' },
  badge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  fav: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: space.md, gap: 3 },
  price: { fontSize: 19, fontWeight: '800' },
});
