import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ReportSheet } from '@/components/report-sheet';
import { Avatar, Button, Card, Empty, H1, Icon, ListingImage, Loading, Notice, P, Screen, Stars, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { category, conditionLabel, money, sellerTypeLabel, timeAgo } from '@/lib/catalog';
import type { Listing, Profile } from '@/lib/database.types';
import { useFavorites } from '@/lib/favorites';
import { useI18n } from '@/lib/i18n';
import { listingSeo, useSeo } from '@/lib/seo';
import { friendlyError, photoUrl, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

type Detail = Listing & {
  seller: Pick<Profile, 'id' | 'display_name' | 'seller_type' | 'city' | 'rbq_license' | 'rbq_verified' | 'avatar_url'> | null;
  listing_photos: { path: string; position: number }[];
};

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { tr } = useI18n();
  const { width } = useWindowDimensions();
  const { userId } = useAuth();
  const favorites = useFavorites();
  const [item, setItem] = useState<Detail | null | undefined>(undefined);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('listings')
      .select('*, seller:profiles(id, display_name, seller_type, city, rbq_license, rbq_verified, avatar_url), listing_photos(path, position)')
      .eq('id', id)
      .maybeSingle()
      .then(async ({ data }) => {
        const d = data as unknown as Detail | null;
        setItem(d);
        if (d) {
          supabase.rpc('increment_listing_view', { listing: d.id });
          const { data: r } = await supabase.from('seller_ratings').select('average, count').eq('seller_id', d.seller_id).maybeSingle();
          setRating(r);
        }
      });
  }, [id]);

  const firstPhoto = item ? [...item.listing_photos].sort((a, b) => a.position - b.position)[0] : undefined;
  useSeo(
    item
      ? listingSeo(item, category(item.category_id).name, photoUrl(firstPhoto?.path))
      : { title: 'Annonce introuvable', noindex: true, pending: item === undefined },
  );

  if (item === undefined) return <Loading />;
  if (item === null)
    return (
      <Screen edges={[]}>
        <Empty title={tr('Cette annonce n’est plus disponible')} body={tr('Elle a peut-être été vendue ou retirée.')} action={<Button label={tr('Retour aux annonces')} onPress={() => router.replace('/')} />} />
      </Screen>
    );

  const mine = item.seller_id === userId;
  const photos = [...item.listing_photos].sort((a, b) => a.position - b.position);
  const wide = width >= 900;
  const cat = category(item.category_id);

  async function contact() {
    if (!userId) return router.push('/connexion');
    setBusy(true);
    setError('');
    const { data: existing } = await supabase.from('conversations').select('id').eq('listing_id', item!.id).eq('buyer_id', userId).maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data, error: err } = await supabase
        .from('conversations')
        .insert({ listing_id: item!.id, seller_id: item!.seller_id })
        .select('id')
        .single();
      if (err) setError(friendlyError(err));
      convId = data?.id;
    }
    setBusy(false);
    if (convId) router.push({ pathname: '/conversation/[id]', params: { id: convId, draft: tr('Bonjour, est-ce encore disponible ?') } });
  }

  const gallery = (
    <View style={{ gap: space.sm }}>
      <ListingImage uri={photoUrl(photos[photoIndex]?.path)} categoryId={item.category_id} style={styles.hero} iconSize={80} />
      {photos.length > 1 ? (
        <ScrollView horizontal contentContainerStyle={{ gap: space.sm }}>
          {photos.map((p, i) => (
            <Pressable key={p.path} onPress={() => setPhotoIndex(i)} style={{ opacity: i === photoIndex ? 1 : 0.6 }}>
              <ListingImage uri={photoUrl(p.path)} categoryId={item.category_id} style={styles.mini} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  const facts: [string, string][] = [
    [tr('Quantité'), item.quantity],
    [tr('Ville'), item.city],
    [tr('Format'), item.spec || '—'],
    [tr('Publiée'), `${timeAgo(item.created_at)} · ${tr(item.views === 1 ? '{n} vue' : '{n} vues', { n: item.views })}`],
  ];

  const summary = (
    <View style={{ gap: space.md }}>
      <Card>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Tag label={conditionLabel(item.condition)} tone={item.condition === 'neuf' ? 'ok' : item.condition === 'surplus' ? 'accent' : 'neutral'} />
          <Tag label={tr(cat.name)} />
          {item.status !== 'active' ? <Tag label={item.status === 'vendue' ? tr('Vendue') : tr('Retirée')} tone="accent" /> : null}
        </View>
        <H1 style={{ fontSize: 26 }}>{item.title}</H1>
        <Text style={{ fontSize: 28, fontWeight: '800', color: t.text }}>
          {money(item.price_cents)} <Text style={{ fontSize: 14, color: t.muted, fontWeight: '500' }}>{tr(item.price_unit)}</Text>
        </Text>
        <View style={[styles.facts, { borderColor: t.line }]}>
          {facts.map(([k, v]) => (
            <View key={k} style={{ width: '50%', paddingVertical: 6 }}>
              <Text style={{ color: t.muted, fontSize: 12 }}>{k}</Text>
              <Text style={{ color: t.text, fontWeight: '500' }}>{v}</Text>
            </View>
          ))}
        </View>
        {mine ? (
          <Notice icon="person-outline">{tr('C’est votre annonce. Gérez-la dans l’onglet Compte.')}</Notice>
        ) : (
          <Button label={tr('Contacter le vendeur')} icon="chatbubble-outline" loading={busy} onPress={contact} disabled={item.status !== 'active'} />
        )}
        {error ? <P style={{ color: t.danger }}>{error}</P> : null}
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button
            style={{ flex: 1 }}
            kind="secondary"
            icon={favorites.ids.has(item.id) ? 'heart' : 'heart-outline'}
            label={favorites.ids.has(item.id) ? tr('Sauvegardée') : tr('Sauvegarder')}
            onPress={() => favorites.toggle(item.id)}
          />
          <Button
            style={{ flex: 1 }}
            kind="secondary"
            icon="share-outline"
            label={tr('Partager')}
            onPress={() => Share.share({ message: tr('{title} · {price} sur Bâtiplace', { title: item.title, price: money(item.price_cents) }) }).catch(() => {})}
          />
        </View>
      </Card>

      {item.seller ? (
        <Link href={{ pathname: '/vendeur/[id]', params: { id: item.seller.id } }} asChild>
          <Pressable>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={item.seller.display_name} uri={item.seller.avatar_url} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: t.text, fontWeight: '700' }}>{item.seller.display_name || tr('Membre Bâtiplace')}</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>
                  {sellerTypeLabel(item.seller.seller_type)}
                  {item.seller.city ? ` · ${item.seller.city}` : ''}
                </Text>
                {rating ? (
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Stars value={rating.average} />
                    <Text style={{ color: t.muted, fontSize: 12 }}>({rating.count})</Text>
                  </View>
                ) : (
                  <Text style={{ color: t.muted, fontSize: 12 }}>{tr('Nouveau vendeur')}</Text>
                )}
                {item.seller.rbq_verified && item.seller.rbq_license ? (
                  <Text style={{ color: t.ok, fontSize: 12, fontWeight: '600' }}>{tr('Licence RBQ {n} vérifiée', { n: item.seller.rbq_license })}</Text>
                ) : null}
              </View>
              <Icon name="chevron-forward" color={t.muted} />
            </Card>
          </Pressable>
        </Link>
      ) : null}

      <Notice icon="shield-checkmark-outline" tone="ok">
        {tr('Aucune commission Bâtiplace. Vous payez le vendeur directement. Inspectez l’article avant de payer.')}
      </Notice>
      {!mine ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => (userId ? setReporting(true) : router.push('/connexion'))}
          style={{ flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'center', padding: space.sm }}>
          <Icon name="flag-outline" size={16} color={t.muted} />
          <Text style={{ color: t.muted, fontWeight: '600' }}>{tr('Signaler l’annonce ou bloquer le vendeur')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: item.title }} />
      {!mine ? (
        <ReportSheet
          visible={reporting}
          onClose={() => setReporting(false)}
          userId={item.seller_id}
          userName={item.seller?.display_name}
          listingId={item.id}
        />
      ) : null}
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: space.xl, alignItems: 'flex-start' }}>
        <View style={{ flex: wide ? 1.4 : undefined, width: wide ? undefined : '100%', gap: space.lg }}>
          {gallery}
          {!wide ? summary : null}
          <Card>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 18 }}>{tr('Description')}</Text>
            <P>{item.description || tr('Aucune description.')}</P>
          </Card>
        </View>
        {wide ? <View style={{ flex: 1 }}>{summary}</View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg },
  mini: { width: 64, height: 64, borderRadius: radius.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: space.sm },
});
