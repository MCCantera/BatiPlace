import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { Avatar, Button, Card, Empty, H1, H2, ListingImage, Loading, P, Screen, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { FREE_LISTING_LIMIT, money, sellerTypeLabel, subscriptionPrice, timeAgo } from '@/lib/catalog';
import type { Listing, ListingStatus } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { friendlyError, photoUrl, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

type MyListing = Pick<Listing, 'id' | 'title' | 'price_cents' | 'price_unit' | 'status' | 'views' | 'created_at' | 'category_id'> & {
  listing_photos: { path: string; position: number }[];
};

const STATUS_LABEL: Record<ListingStatus, string> = { active: 'Active', vendue: 'Vendue', retiree: 'Retirée' };

export default function AccountScreen() {
  useSeo({ title: 'Mon compte', noindex: true });
  const { userId } = useAuth();
  return userId ? <Account /> : <SignedOut />;
}

/** Language row, shown at the top of the account screen whether or not the user is signed in. */
function LanguageRow() {
  const t = useTheme();
  const { tr } = useI18n();
  return (
    <View style={[styles.langRow, { backgroundColor: t.surface, borderColor: t.line }]}>
      <Text style={{ color: t.text, fontWeight: '600', fontSize: 15 }}>{tr('Langue')}</Text>
      <LanguageToggle />
    </View>
  );
}

/** Same prompt as RequireAuth, plus the language row so visitors can switch before signing in. */
function SignedOut() {
  const { tr } = useI18n();
  return (
    <Screen>
      <H1>{tr('Mon compte')}</H1>
      <LanguageRow />
      <Empty
        title={tr('Connectez-vous pour continuer')}
        body={tr('Gérez vos annonces, votre profil vendeur et votre abonnement.')}
        action={<Button label={tr('Se connecter ou créer un compte')} onPress={() => router.push('/connexion')} />}
      />
    </Screen>
  );
}

function Account() {
  const t = useTheme();
  const { tr } = useI18n();
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
  const name = profile?.display_name || tr('Mon compte');

  return (
    <Screen>
      <LanguageRow />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' }}>
        <Avatar name={name} uri={profile?.avatar_url} size={64} />
        <View style={{ flex: 1, minWidth: 180, gap: 4 }}>
          <H1 style={{ fontSize: 24 }}>{name}</H1>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {profile ? <Tag label={sellerTypeLabel(profile.seller_type)} tone={profile.seller_type === 'particulier' ? 'neutral' : 'brand'} /> : null}
            {profile?.city ? <Tag label={profile.city} /> : null}
          </View>
        </View>
        <Link href="/profil" asChild>
          <Button small kind="secondary" label={tr('Modifier le profil')} icon="create-outline" />
        </Link>
      </Card>

      <Card>
        <H2>{subscribed ? tr('Bâtiplace Illimité') : tr('Forfait gratuit')}</H2>
        <P muted>
          {subscribed
            ? tr('Annonces illimitées sur le Web et dans l’application.')
            : tr('{n} / {max} annonces actives. Passez à Illimité pour {price} par mois.', { n: active, max: FREE_LISTING_LIMIT, price: subscriptionPrice() })}
        </P>
        <Button kind={subscribed ? 'secondary' : 'primary'} label={subscribed ? tr('Gérer l’abonnement') : tr('Voir l’abonnement')} onPress={() => router.push('/abonnement')} />
        <Button kind="secondary" icon="pricetags-outline" label={tr('Rabais partenaires')} onPress={() => router.push('/partenaires')} />
      </Card>

      <H2>{tr('Mes annonces')}</H2>
      {error ? <P style={{ color: t.danger }}>{error}</P> : null}
      {listings === null ? (
        <Loading />
      ) : listings.length === 0 ? (
        <Empty title={tr('Aucune annonce')} body={tr('Vos {n} premières annonces sont gratuites.', { n: FREE_LISTING_LIMIT })} action={<Button label={tr('Publier')} icon="add" onPress={() => router.push('/publier')} />} />
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
                    {money(l.price_cents)} {tr(l.price_unit)} · {tr(l.views > 1 ? '{n} vues' : '{n} vue', { n: l.views })} · {timeAgo(l.created_at)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    <Tag label={tr(STATUS_LABEL[l.status])} tone={l.status === 'active' ? 'ok' : 'neutral'} />
                  </View>
                </View>
                <View style={{ gap: 6 }}>
                  {l.status === 'active' ? (
                    <>
                      <Button small kind="secondary" label={tr('Vendue')} onPress={() => setStatus(l.id, 'vendue')} />
                      <Button small kind="danger" label={tr('Retirer')} onPress={() => setStatus(l.id, 'retiree')} />
                    </>
                  ) : (
                    <Button small kind="secondary" label={tr('Réactiver')} onPress={() => setStatus(l.id, 'active')} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Button kind="secondary" label={tr('Se déconnecter')} icon="log-out-outline" onPress={signOut} />
        <Button kind="secondary" small label={tr('Politique de confidentialité')} icon="shield-checkmark-outline" onPress={() => router.push('/confidentialite')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderWidth: 1, borderRadius: radius.lg },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, borderWidth: 1, borderRadius: radius.lg },
});
