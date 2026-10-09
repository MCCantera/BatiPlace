import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CityField } from '@/components/city-field';
import { Button, Card, Field, H1, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { space } from '@/lib/theme';

/** Partnership request from a contractor who wants to be listed on the Entrepreneurs page. */
export default function ContractorRequestScreen() {
  useSeo({ title: 'Devenir entrepreneur partenaire', description: 'Entrepreneurs en construction : demandez à apparaître sur Bâtiplace, le marketplace de la construction au Québec.', path: '/devenir-partenaire' });
  const { tr } = useI18n();
  const { session, profile } = useAuth();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState(profile?.display_name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(profile?.city ?? '');
  const [rbq, setRbq] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    setError('');
    if (company.trim().length < 2) return setError(tr('Indiquez le nom de votre entreprise.'));
    if (contact.trim().length < 2) return setError(tr('Indiquez votre nom.'));
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(tr('Indiquez une adresse courriel valide.'));
    if (!city) return setError(tr('Choisissez votre ville dans la liste.'));

    setBusy(true);
    // No .select() after insert: requests are not readable by the public until approved.
    const { error: err } = await supabase.from('contractor_requests').insert({
      company_name: company.trim(),
      contact_name: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city,
      rbq_license: rbq.trim(),
      specialties: specialties.trim(),
      website: website.trim(),
      message: message.trim(),
    });
    setBusy(false);
    if (err) return setError(tr('La demande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.'));
    setSent(true);
  }

  if (sent) {
    return (
      <Screen edges={[]}>
        <H1>{tr('Demande envoyée')}</H1>
        <Notice tone="ok" icon="checkmark-circle-outline">
          {tr('Merci ! Nous examinons votre demande de partenariat et vous écrivons à {email}. Une fois approuvée, votre entreprise apparaîtra sur la page Entrepreneurs.', { email: email.trim() })}
        </Notice>
        <Button label={tr('Retour aux entrepreneurs')} kind="secondary" onPress={() => router.replace('/entrepreneurs')} />
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm }}>
        <H1>{tr('Devenir entrepreneur partenaire')}</H1>
        <P muted>
          {tr('Envoyez-nous votre demande pour apparaître sur la page Entrepreneurs de Bâtiplace. Nous vérifions chaque entreprise, et sa licence RBQ, avant de l’afficher.')}
        </P>
      </View>

      <Card style={{ gap: space.lg }}>
        <Field label={tr('Nom de l’entreprise')} value={company} onChangeText={setCompany} maxLength={100} placeholder={tr('Ex. Rénovations Tremblay inc.')} />
        <Field label={tr('Votre nom')} value={contact} onChangeText={setContact} maxLength={100} autoComplete="name" />
        <Field
          label={tr('Courriel')}
          value={email}
          onChangeText={setEmail}
          maxLength={200}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          hint={tr('Pour vous répondre. Il n’est pas affiché sur le site.')}
        />
        <Field
          label={tr('Téléphone')}
          value={phone}
          onChangeText={setPhone}
          maxLength={40}
          keyboardType="phone-pad"
          autoComplete="tel"
          hint={tr('Affiché sur votre fiche une fois approuvée, pour que les clients vous appellent.')}
        />
        <CityField label={tr('Ville')} value={city} onChange={setCity} />
        <Field label={tr('Licence RBQ')} value={rbq} onChangeText={setRbq} maxLength={20} placeholder="0000-0000-00" />
        <Field
          label={tr('Spécialités')}
          value={specialties}
          onChangeText={setSpecialties}
          maxLength={200}
          placeholder={tr('Ex. rénovation de cuisine, toiture, électricité')}
        />
        <Field label={tr('Site Web (facultatif)')} value={website} onChangeText={setWebsite} maxLength={300} autoCapitalize="none" keyboardType="url" />
        <Field label={tr('Message (facultatif)')} value={message} onChangeText={setMessage} maxLength={2000} multiline placeholder={tr('Parlez-nous de votre entreprise.')} />

        {error ? <Notice tone="danger">{error}</Notice> : null}
        <Button label={tr('Envoyer ma demande')} icon="send-outline" loading={busy} onPress={submit} />
      </Card>
    </Screen>
  );
}
