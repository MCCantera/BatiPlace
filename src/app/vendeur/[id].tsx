import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { Avatar, Button, Card, Empty, Field, H1, H2, Icon, Loading, Notice, P, Screen, Stars, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { sellerTypeLabel } from '@/lib/catalog';
import type { Listing, Profile, Review } from '@/lib/database.types';
import { useFavorites } from '@/lib/favorites';
import { friendlyError, supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

type SellerListing = Pick<Listing, 'id' | 'title' | 'price_cents' | 'price_unit' | 'city' | 'condition' | 'category_id' | 'spec'> & {
  listing_photos: { path: string; position: number }[];
};
type ReviewRow = Review & { author: { display_name: string } | null };

export default function SellerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { userId } = useAuth();
  const favorites = useFavorites();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [stars, setStars] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, author:profiles!reviews_author_id_fkey(display_name)')
      .eq('seller_id', id)
      .order('created_at', { ascending: false });
    setReviews((data ?? []) as unknown as ReviewRow[]);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    supabase.from('profiles').select('*').eq('id', id).maybeSingle().then(({ data }) => setProfile(data));
    supabase
      .from('listings')
      .select('id, title, price_cents, price_unit, city, condition, category_id, spec, listing_photos(path, position)')
      .eq('seller_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => setListings((data ?? []) as unknown as SellerListing[]));
    loadReviews();
  }, [id, loadReviews]);

  if (profile === undefined) return <Loading />;
  if (profile === null) return <Screen edges={[]}><Empty title="Ce profil n’existe plus" /></Screen>;

  const average = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const columns = width >= 1000 ? 3 : 2;
  const canReview = Boolean(userId) && userId !== profile.id && !reviews.some((r) => r.author_id === userId);

  async function sendReview() {
    setError('');
    if (!stars) return setError('Choisissez une note de 1 à 5 étoiles.');
    const { error: err } = await supabase.from('reviews').insert({ seller_id: profile!.id, rating: stars, body: body.trim() });
    if (err) {
      return setError(
        err.message.includes('row-level security')
          ? 'Vous pouvez évaluer un vendeur après lui avoir écrit au sujet d’une annonce.'
          : friendlyError(err),
      );
    }
    setSent(true);
    loadReviews();
  }

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: profile.display_name || 'Vendeur' }} />
      <Card style={{ flexDirection: 'row', gap: space.lg, alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar name={profile.display_name} size={72} />
        <View style={{ flex: 1, minWidth: 200, gap: 4 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Tag label={sellerTypeLabel(profile.seller_type)} tone={profile.seller_type === 'particulier' ? 'neutral' : 'brand'} />
          </View>
          <H1 style={{ fontSize: 26 }}>{profile.display_name || 'Membre Bâtiplace'}</H1>
          <P muted>
            {profile.city ? `${profile.city} · ` : ''}Membre depuis {new Date(profile.created_at).getFullYear()}
          </P>
          {profile.rbq_verified && profile.rbq_license ? (
            <Text style={{ color: t.ok, fontWeight: '600' }}>Licence RBQ {profile.rbq_license} vérifiée</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: t.text }}>{reviews.length ? average.toFixed(1) : '—'}</Text>
          <Stars value={average} />
          <Text style={{ color: t.muted, fontSize: 12 }}>{reviews.length} évaluation{reviews.length > 1 ? 's' : ''}</Text>
        </View>
      </Card>

      <H2>Annonces ({listings.length})</H2>
      {listings.length === 0 ? (
        <Empty title="Aucune annonce active" />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {listings.map((l) => (
            <View key={l.id} style={{ width: `${100 / columns - 3}%`, flexGrow: 1 }}>
              <ListingCard
                listing={{ ...l, photo_path: [...l.listing_photos].sort((a, b) => a.position - b.position)[0]?.path ?? null, seller_type: profile.seller_type }}
                favorite={favorites.ids.has(l.id)}
                onToggleFavorite={() => favorites.toggle(l.id)}
              />
            </View>
          ))}
        </View>
      )}

      <H2>Évaluations</H2>
      <Card>
        {reviews.length === 0 ? <P muted>Pas encore d’évaluation.</P> : null}
        {reviews.map((r) => (
          <View key={r.id} style={{ gap: 4, paddingBottom: space.md, borderBottomWidth: 1, borderColor: t.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: t.text, fontWeight: '700' }}>{r.author?.display_name ?? 'Membre'}</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-CA')}</Text>
            </View>
            <Stars value={r.rating} />
            {r.body ? <P>{r.body}</P> : null}
          </View>
        ))}

        {sent ? <Notice tone="ok" icon="checkmark-circle-outline">Merci, votre évaluation est publiée.</Notice> : null}
        {canReview && !sent ? (
          <View style={{ gap: space.md }}>
            <Text style={{ color: t.text, fontWeight: '700' }}>Vous avez fait affaire avec ce vendeur ?</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setStars(n)} accessibilityLabel={`${n} étoile${n > 1 ? 's' : ''}`} hitSlop={6}>
                  <Icon name={n <= stars ? 'star' : 'star-outline'} size={30} color={n <= stars ? t.accent : t.line} />
                </Pressable>
              ))}
            </View>
            <Field label="Votre commentaire" value={body} onChangeText={setBody} multiline maxLength={1000} placeholder="État de l’article, ponctualité, communication…" />
            {error ? <P style={{ color: t.danger }}>{error}</P> : null}
            <Button kind="brand" label="Publier l’évaluation" onPress={sendReview} />
          </View>
        ) : null}
        {!userId ? <Button kind="secondary" label="Se connecter pour évaluer" onPress={() => router.push('/connexion')} /> : null}
      </Card>
    </Screen>
  );
}
