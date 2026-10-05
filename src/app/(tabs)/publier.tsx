import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RequireAuth } from '@/components/require-auth';
import { Button, Card, Chip, Field, H1, H2, Icon, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { CATEGORIES, CITIES, CITY_NAMES, CONDITIONS, FREE_LISTING_LIMIT, PRICE_UNITS, SUBSCRIPTION_PRICE, pointWkt } from '@/lib/catalog';
import type { ListingCondition } from '@/lib/database.types';
import { useOrigin } from '@/lib/location';
import { PHOTO_BUCKET, friendlyError, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

const MAX_PHOTOS = 8;

export default function PublishScreen() {
  return (
    <RequireAuth title="Publier une annonce" reason="La publication est gratuite. Il faut seulement un compte pour que les acheteurs puissent vous écrire.">
      <PublishForm />
    </RequireAuth>
  );
}

function PublishForm() {
  const t = useTheme();
  const { userId, subscribed, profile } = useAuth();
  const { origin } = useOrigin();
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>(CATEGORIES[0].id);
  const [condition, setCondition] = useState<ListingCondition>('usage');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [spec, setSpec] = useState('');
  const [city, setCity] = useState(profile?.city && CITIES[profile.city] ? profile.city : origin.fromDevice ? 'Montréal' : origin.label);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'active')
        .then(({ count }) => setActiveCount(count ?? 0));
    }, [userId]),
  );

  const atLimit = !subscribed && activeCount !== null && activeCount >= FREE_LISTING_LIMIT;

  async function pickPhotos() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets].slice(0, MAX_PHOTOS));
  }

  async function submit() {
    setError('');
    const cents = Math.round(parseFloat(price.replace(',', '.').replace(/\s/g, '')) * 100);
    if (title.trim().length < 3) return setError('Donnez un titre d’au moins 3 caractères.');
    if (!Number.isFinite(cents) || cents < 0) return setError('Indiquez un prix valide, par exemple 180 ou 3,50.');
    const coords = city === 'Ma position' && origin.fromDevice ? origin : CITIES[city];
    if (!coords) return setError('Choisissez une ville.');

    setBusy(true);
    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        condition,
        price_cents: cents,
        price_unit: unit,
        quantity: quantity.trim() || '1',
        spec: spec.trim(),
        city: city === 'Ma position' ? profile?.city || 'Québec' : city,
        location: pointWkt(coords.lat, coords.lng),
      })
      .select('id')
      .single();

    if (insertError || !listing) {
      setBusy(false);
      return setError(friendlyError(insertError));
    }

    for (const [i, asset] of photos.entries()) {
      const ext = asset.mimeType?.split('/')[1] ?? 'jpg';
      const path = `${userId}/${listing.id}/${i}-${Date.now()}.${ext}`;
      const body = await (await fetch(asset.uri)).arrayBuffer();
      const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, body, { contentType: asset.mimeType ?? 'image/jpeg' });
      if (!upErr) await supabase.from('listing_photos').insert({ listing_id: listing.id, path, position: i });
    }

    setBusy(false);
    setTitle('');
    setPrice('');
    setSpec('');
    setDescription('');
    setPhotos([]);
    router.push({ pathname: '/annonce/[id]', params: { id: listing.id } });
  }

  return (
    <Screen>
      <H1>Publier une annonce</H1>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 200, gap: 6 }}>
          {subscribed ? (
            <Text style={{ color: t.text, fontWeight: '700' }}>Bâtiplace Illimité : annonces illimitées</Text>
          ) : (
            <>
              <Text style={{ color: t.text, fontWeight: '700' }}>
                {activeCount ?? '…'} / {FREE_LISTING_LIMIT} annonces actives gratuites
              </Text>
              <View style={[styles.meter, { backgroundColor: t.surface2 }]}>
                <View style={{ width: `${Math.min(100, ((activeCount ?? 0) / FREE_LISTING_LIMIT) * 100)}%`, height: '100%', backgroundColor: t.accent }} />
              </View>
            </>
          )}
        </View>
        {!subscribed ? <Button small kind="secondary" label={`Illimité · ${SUBSCRIPTION_PRICE}/mois`} onPress={() => router.push('/abonnement')} /> : null}
      </Card>

      {atLimit ? (
        <Card>
          <H2>Vous avez atteint {FREE_LISTING_LIMIT} annonces actives</H2>
          <P muted>Retirez une annonce vendue dans votre compte, ou passez à Bâtiplace Illimité pour publier sans limite.</P>
          <Button label="Voir l’abonnement" onPress={() => router.push('/abonnement')} />
        </Card>
      ) : (
        <Card style={{ gap: space.lg }}>
          <Field label="Titre" value={title} onChangeText={setTitle} maxLength={100} placeholder="Ex. 12 boîtes de céramique 12×24 restantes" />

          <View style={{ gap: space.sm }}>
            <Text style={[styles.label, { color: t.text }]}>Photos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {photos.map((p, i) => (
                <Pressable key={p.uri} onPress={() => setPhotos(photos.filter((_, j) => j !== i))} accessibilityLabel="Retirer la photo">
                  <Image source={{ uri: p.uri }} style={styles.thumb} />
                </Pressable>
              ))}
              {photos.length < MAX_PHOTOS ? (
                <Pressable onPress={pickPhotos} style={[styles.thumb, styles.addPhoto, { borderColor: t.line }]}>
                  <Icon name="camera-outline" size={24} color={t.muted} />
                  <Text style={{ color: t.muted, fontSize: 12 }}>Ajouter</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={{ gap: space.sm }}>
            <Text style={[styles.label, { color: t.text }]}>Catégorie</Text>
            <View style={styles.wrap}>
              {CATEGORIES.map((c) => (
                <Chip key={c.id} label={c.name} dot={c.ink} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
            </View>
          </View>

          <View style={{ gap: space.sm }}>
            <Text style={[styles.label, { color: t.text }]}>État</Text>
            <View style={styles.wrap}>
              {CONDITIONS.map((c) => (
                <Chip key={c.id} label={c.label} selected={condition === c.id} onPress={() => setCondition(c.id)} />
              ))}
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Field label="Prix ($)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0" />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Field label="Quantité" value={quantity} onChangeText={setQuantity} placeholder="Ex. 40 panneaux" />
            </View>
          </View>

          <View style={{ gap: space.sm }}>
            <Text style={[styles.label, { color: t.text }]}>Le prix est pour</Text>
            <View style={styles.wrap}>
              {PRICE_UNITS.map((u) => (
                <Chip key={u || 'total'} label={u || 'Prix total'} selected={unit === u} onPress={() => setUnit(u)} />
              ))}
            </View>
          </View>

          <Field label="Format ou dimensions" value={spec} onChangeText={setSpec} maxLength={80} placeholder="Ex. 4′ × 8′ × ½″" />

          <View style={{ gap: space.sm }}>
            <Text style={[styles.label, { color: t.text }]}>Ville</Text>
            <View style={styles.wrap}>
              {CITY_NAMES.map((c) => (
                <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />
              ))}
            </View>
          </View>

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={4000}
            placeholder="État, provenance, ramassage ou livraison…"
          />

          {error ? <Notice icon="alert-circle-outline" tone="danger">{error}</Notice> : null}
          {error.includes('forfait gratuit') ? <Button kind="secondary" label="Voir l’abonnement" onPress={() => router.push('/abonnement')} /> : null}
          <Button label="Publier gratuitement" icon="checkmark" loading={busy} onPress={submit} />
          <P muted style={{ fontSize: 13 }}>Aucune commission : l’acheteur vous paie directement.</P>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', fontSize: 14 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  twoCols: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  meter: { height: 8, borderRadius: 4, overflow: 'hidden' },
  thumb: { width: 76, height: 76, borderRadius: radius.sm },
  addPhoto: { borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 2 },
});
