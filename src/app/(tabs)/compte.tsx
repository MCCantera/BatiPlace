import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RequireAuth } from '@/components/require-auth';
import { Avatar, Button, Card, Empty, H1, H2, ListingImage, Loading, P, Screen, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { FREE_LISTING_LIMIT, SUBSCRIPTION_PRICE, money, sellerTypeLabel, timeAgo } from '@/lib/catalog';
import type { Listing, ListingStatus } from '@/lib/database.types';
import { useSeo } from '@/lib/seo';
import { friendlyError, photoUrl, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

type MyListing = Pick<Listing, 'id' | 'title' | 'price_cents' | 'price_unit' | 'status' | 'views' | 'created_at' | 'category_id'> & {
  listing_photos: { path: string; position: number }[];
};

const STATUS_LABEL: Record<ListingStatus, string> = { active: 'Active', vendue: 'Vendue', retiree: 'Retirée' };

export default function AccountScreen() {
  useSeo({ title: 'Mon compte', noindex: true });
  return (
    <RequireAuth title="Mon compte" reason="Gérez vos annonces, votre profil vendeur et votre abonnement.">
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const t = useTheme();
  const { userId, profile, subscribed, signOut } = useAuth();
  const [listings, setListings] = useState<MyListing[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('listings')
      .select('id, title, price_cents, price_unit, status, views, created_at, category_id, listing_photos(path, position)')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    setListings((data ?? []) as unknown as MyListing[]);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function setStatus(id: string, status: ListingStatus) {
    setError('');
    const { error: err } = await supabase.from('listings').update({ status }).eq('id', id);
    if (err) setError(friendlyError(err));
    load();
  }

  const active = (listings ?? []).filter((l) => l.status === 'active').length;
  const name = profile?.display_name || 'Mon compte';

  return (
    <Screen>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' }}>
        <Avatar name={name} size={64} />
        <View style={{ flex: 1, minWidth: 180, gap: 4 }}>
          <H1 style={{ fontSize: 24 }}>{name}</H1>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {profile ? <Tag label={sellerTypeLabel(profile.seller_type)} tone={profile.seller_type === 'particulier' ? 'neutral' : 'brand'} /> : null}
            {profile?.city ? <Tag label={profile.city} /> : null}
          </View>
        </View>
        <Link href="/profil" asChild>
          <Button small kind="secondary" label="Modifier le profil" icon="create-outline" />
        </Link>
      </Card>

      <Card>
        <H2>{subscribed ? 'Bâtiplace Illimité' : 'Forfait gratuit'}</H2>
        <P muted>
          {subscribed
            ? 'Annonces illimitées sur le Web et dans l’application.'
            : `${active} / ${FREE_LISTING_LIMIT} annonces actives. Passez à Illimité pour ${SUBSCRIPTION_PRICE} par mois.`}
        </P>
        <Button kind={subscribed ? 'secondary' : 'primary'} label={subscribed ? 'Gérer l’abonnement' : 'Voir l’abonnement'} onPress={() => router.push('/abonnement')} />
        <Button kind="secondary" icon="pricetags-outline" label="Rabais partenaires" onPress={() => router.push('/partenaires')} />
      </Card>

      <H2>Mes annonces</H2>
      {error ? <P style={{ color: t.danger }}>{error}</P> : null}
      {listings === null ? (
        <Loading />
      ) : listings.length === 0 ? (
        <Empty title="Aucune annonce" body="Votre première annonce est gratuite." action={<Button label="Publier" icon="add" onPress={() => router.push('/publier')} />} />
      ) : (
        <View style={{ gap: space.sm }}>
          {listings.map((l) => {
            const photo = [...l.listing_photos].sort((a, b) => a.position - b.position)[0]?.path;
            return (
              <View key={l.id} style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
                <ListingImage uri={photoUrl(photo)} categoryId={l.category_id} style={styles.thumb} iconSize={26} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Link href={{ pathname: '/annonce/[id]', params: { id: l.id } }} asChild>
                    <Pressable>
                      <Text numberOfLines={1} style={{ color: t.text, fontWeight: '700' }}>{l.title}</Text>
                    </Pressable>
                  </Link>
                  <Text style={{ color: t.muted, fontSize: 13 }}>
                    {money(l.price_cents)} {l.price_unit} · {l.views} vues · {timeAgo(l.created_at)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    <Tag label={STATUS_LABEL[l.status]} tone={l.status === 'active' ? 'ok' : 'neutral'} />
                  </View>
                </View>
                <View style={{ gap: 6 }}>
                  {l.status === 'active' ? (
                    <>
                      <Button small kind="secondary" label="Vendue" onPress={() => setStatus(l.id, 'vendue')} />
                      <Button small kind="danger" label="Retirer" onPress={() => setStatus(l.id, 'retiree')} />
                    </>
                  ) : (
                    <Button small kind="secondary" label="Réactiver" onPress={() => setStatus(l.id, 'active')} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Button kind="secondary" label="Se déconnecter" icon="log-out-outline" onPress={signOut} />
        <Button kind="secondary" small label="Politique de confidentialité" icon="shield-checkmark-outline" onPress={() => router.push('/confidentialite')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderWidth: 1, borderRadius: radius.lg },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
});
