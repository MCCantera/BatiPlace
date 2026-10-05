import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Chip, Field, H1, Notice, P, Screen } from '@/components/ui';
import { friendlyError, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { space } from '@/lib/theme';

export default function SignInScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit() {
    setError('');
    setInfo('');
    if (!email.includes('@')) return setError('Entrez une adresse courriel valide.');
    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères.');
    setBusy(true);
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (err) return setError(friendlyError(err));
      router.back();
    } else {
      if (name.trim().length < 2) {
        setBusy(false);
        return setError('Indiquez votre nom ou celui de votre entreprise.');
      }
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      });
      setBusy(false);
      if (err) return setError(friendlyError(err));
      if (data.session) router.back();
      else setInfo('Compte créé. Ouvrez le courriel de confirmation que nous venons d’envoyer, puis connectez-vous.');
    }
  }

  async function forgot() {
    setError('');
    if (!email.includes('@')) return setError('Entrez votre courriel ci-dessus, puis touchez « Mot de passe oublié ».');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (err) return setError(friendlyError(err));
    setInfo('Si un compte existe pour ce courriel, un lien de réinitialisation vient d’être envoyé.');
  }

  return (
    <Screen edges={[]}>
      <H1>{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</H1>
      <P muted>Un seul compte pour le site Web et l’application.</P>
      {!isSupabaseConfigured ? <Notice tone="danger">La base de données n’est pas encore branchée.</Notice> : null}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip label="J’ai un compte" selected={mode === 'login'} onPress={() => setMode('login')} />
        <Chip label="Nouveau compte" selected={mode === 'signup'} onPress={() => setMode('signup')} />
      </View>
      <Card style={{ gap: space.lg }}>
        {mode === 'signup' ? (
          <Field label="Nom ou entreprise" value={name} onChangeText={setName} autoComplete="name" placeholder="Ex. Julie Tremblay ou Rénovations Gagnon" />
        ) : null}
        <Field label="Courriel" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="vous@exemple.com" />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          hint={mode === 'signup' ? 'Au moins 6 caractères.' : undefined}
          onSubmitEditing={submit}
        />
        {error ? <Notice tone="danger" icon="alert-circle-outline">{error}</Notice> : null}
        {info ? <Notice tone="ok" icon="mail-outline">{info}</Notice> : null}
        <Button label={mode === 'login' ? 'Se connecter' : 'Créer mon compte'} loading={busy} onPress={submit} />
        {mode === 'login' ? <Button kind="secondary" label="Mot de passe oublié" onPress={forgot} /> : null}
      </Card>
      <P muted style={{ fontSize: 13 }}>
        En créant un compte, vous acceptez les conditions d’utilisation et la politique de confidentialité de Bâtiplace.
      </P>
    </Screen>
  );
}
