import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Avatar, Button, Card, Chip, Field, H2, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { CityField } from '@/components/city-field';
import { SELLER_TYPES } from '@/lib/catalog';
import type { SellerType } from '@/lib/database.types';
import { useSeo } from '@/lib/seo';
import { PHOTO_BUCKET, friendlyError, photoUrl, supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

export default function ProfileScreen() {
  useSeo({ title: 'Mon profil', noindex: true });
  const t = useTheme();
  const { userId, profile, refresh, signOut } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<SellerType>('particulier');
  const [city, setCity] = useState('');
  const [rbq, setRbq] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name);
    setType(profile.seller_type);
    setCity(profile.city ?? '');
    setRbq(profile.rbq_license ?? '');
  }, [profile]);

  if (!userId) return null;

  async function save() {
    setBusy(true);
    setError('');
    setMessage('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ display_name: name.trim(), seller_type: type, city: city || null, rbq_license: rbq.trim() || null })
      .eq('id', userId!);
    setBusy(false);
    if (err) return setError(friendlyError(err));
    await refresh();
    setMessage('Profil enregistré.');
  }

  /** Uploads the photo right away (in the user's own storage folder) and saves its URL on the profile. */
  async function setPhoto(asset: ImagePicker.ImagePickerAsset | null) {
    setPhotoBusy(true);
    setError('');
    setMessage('');
    let avatarUrl: string | null = null;
    if (asset) {
      const contentType = asset.mimeType ?? 'image/jpeg';
      const path = `${userId}/avatar/${Date.now()}.${contentType.split('/')[1] ?? 'jpg'}`;
      const body = await (await fetch(asset.uri)).arrayBuffer();
      const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, body, { contentType });
      if (upErr) {
        setPhotoBusy(false);
        return setError('La photo n’a pas pu être envoyée. Essayez une image JPEG ou PNG de moins de 8 Mo.');
      }
      avatarUrl = photoUrl(path);
    }
    const { error: err } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId!);
    if (err) {
      setPhotoBusy(false);
      return setError(friendlyError(err));
    }
    // Remove the previous photo from storage.
    const marker = `/${PHOTO_BUCKET}/`;
    const old = profile?.avatar_url;
    if (old?.includes(marker)) await supabase.storage.from(PHOTO_BUCKET).remove([old.slice(old.indexOf(marker) + marker.length)]);
    await refresh();
    setPhotoBusy(false);
    setMessage(asset ? 'Photo de profil enregistrée.' : 'Photo de profil retirée.');
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!res.canceled && res.assets[0]) await setPhoto(res.assets[0]);
  }

  async function deleteAccount() {
    setBusy(true);
    const { error: err } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    setBusy(false);
    if (err) return setError('La suppression n’a pas pu être faite. Réessayez ou écrivez-nous.');
    await signOut();
    router.replace('/');
  }

  return (
    <Screen edges={[]}>
      <Card style={{ gap: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' }}>
          <Avatar name={name || 'Membre'} uri={profile?.avatar_url} size={80} />
          <View style={{ flex: 1, minWidth: 180, gap: space.sm }}>
            <Button kind="secondary" icon="camera-outline" label={profile?.avatar_url ? 'Changer la photo' : 'Ajouter une photo'} loading={photoBusy} onPress={pickPhoto} />
            {profile?.avatar_url && !photoBusy ? (
              <Button kind="secondary" icon="trash-outline" label="Retirer la photo" onPress={() => setPhoto(null)} />
            ) : null}
          </View>
        </View>
        <Field label="Nom affiché" value={name} onChangeText={setName} maxLength={80} />
        <View style={{ gap: space.sm }}>
          <Text style={{ color: t.text, fontWeight: '600' }}>Je vends en tant que</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SELLER_TYPES.map((s) => (
              <Chip key={s.id} label={s.label} selected={type === s.id} onPress={() => setType(s.id)} />
            ))}
          </View>
        </View>
        {type !== 'particulier' ? (
          <Field
            label="Numéro de licence RBQ"
            value={rbq}
            onChangeText={setRbq}
            placeholder="0000-0000-00"
            hint="Nous vérifions la licence auprès de la Régie du bâtiment avant d’afficher le badge."
          />
        ) : null}
        <CityField label="Ville" value={city} onChange={setCity} />
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {message ? <Notice tone="ok" icon="checkmark-circle-outline">{message}</Notice> : null}
        <Button label="Enregistrer" loading={busy} onPress={save} />
      </Card>

      <Card>
        <H2>Supprimer mon compte</H2>
        <P muted>Vos annonces, messages et évaluations seront supprimés définitivement. Un abonnement en cours doit être annulé dans les réglages de votre téléphone.</P>
        {confirmDelete ? (
          <View style={{ gap: space.sm }}>
            <Notice tone="danger" icon="warning-outline">Cette action est définitive.</Notice>
            <Button kind="danger" label="Oui, supprimer définitivement" loading={busy} onPress={deleteAccount} />
            <Button kind="secondary" label="Annuler" onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <Button kind="danger" label="Supprimer mon compte" onPress={() => setConfirmDelete(true)} />
        )}
      </Card>
    </Screen>
  );
}
