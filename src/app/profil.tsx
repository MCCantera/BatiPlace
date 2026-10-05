import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Chip, Field, H2, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { CITY_NAMES, SELLER_TYPES } from '@/lib/catalog';
import type { SellerType } from '@/lib/database.types';
import { friendlyError, supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

export default function ProfileScreen() {
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
        <View style={{ gap: space.sm }}>
          <Text style={{ color: t.text, fontWeight: '600' }}>Ville</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {CITY_NAMES.map((c) => (
              <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />
            ))}
          </View>
        </View>
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
