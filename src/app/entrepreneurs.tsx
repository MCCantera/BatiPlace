import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { CityField } from '@/components/city-field';
import { Avatar, Button, Card, Empty, H1, Loading, Notice, P, Screen, Tag } from '@/components/ui';
import type { Contractor } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

// Only public columns: contact name, email and message of a request stay private.
const CONTRACTOR_COLUMNS = 'id, company_name, phone, city, rbq_license, specialties, website, logo_url, approved, rbq_verified, sort_order, created_at';

/** Contractors approved by Bâtiplace after a partnership request. */
export default function ContractorsScreen() {
  useSeo({ title: 'Trouver un entrepreneur en construction au Québec', description: 'Entrepreneurs partenaires de Bâtiplace, vérifiés et avec licence RBQ, pour vos travaux de construction et de rénovation partout au Québec.', path: '/entrepreneurs' });
  const t = useTheme();
  const { tr } = useI18n();
  const { width } = useWindowDimensions();
  const [city, setCity] = useState('');
  const [contractors, setContractors] = useState<Contractor[] | null>(null);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isSupabaseConfigured) return setContractors([]);
      setContractors(null);
      let query = supabase
        .from('contractor_requests')
        .select(CONTRACTOR_COLUMNS)
        .order('sort_order')
        .order('rbq_verified', { ascending: false })
        .order('company_name');
      if (city) query = query.eq('city', city);
      query.then(({ data, error: err }) => {
        setError(!!err);
        setContractors((data as Contractor[] | null) ?? []);
      });
    }, [city]),
  );

  const columns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm }}>
        <H1>{tr('Vous cherchez un entrepreneur ?')}</H1>
        <P muted>{tr('Des entrepreneurs partenaires de Bâtiplace, près de chez vous, pour vos travaux.')}</P>
      </View>

      <CityField pickOnly value={city} onChange={setCity} placeholder={tr('Filtrer par ville (facultatif)')} />
      {city ? (
        <Pressable onPress={() => setCity('')} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ color: t.accent, fontWeight: '600' }}>{tr('Voir toutes les villes')}</Text>
        </Pressable>
      ) : null}

      {error ? <Notice tone="danger">{tr('Impossible de charger les entrepreneurs. Vérifiez votre connexion.')}</Notice> : null}

      {contractors === null ? (
        <Loading />
      ) : contractors.length === 0 ? (
        <Empty
          title={city ? tr('Aucun entrepreneur partenaire à {city} pour l’instant', { city }) : tr('Nos premiers entrepreneurs partenaires arrivent bientôt')}
          body={tr('Les entrepreneurs approuvés par Bâtiplace apparaîtront ici.')}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {contractors.map((c) => (
            <View key={c.id} style={{ width: columns === 1 ? '100%' : `${100 / columns - 2}%`, flexGrow: 1 }}>
              <ContractorCard contractor={c} />
            </View>
          ))}
        </View>
      )}

      <Card style={{ gap: space.sm, backgroundColor: t.surface2 }}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{tr('Vous êtes entrepreneur ?')}</Text>
        <P muted>{tr('Envoyez-nous une demande de partenariat pour apparaître sur cette page.')}</P>
        <Button kind="primary" icon="send-outline" label={tr('Demander un partenariat')} onPress={() => router.push('/devenir-partenaire')} />
      </Card>
    </Screen>
  );
}

function ContractorCard({ contractor: c }: { contractor: Contractor }) {
  const t = useTheme();
  const { tr } = useI18n();
  const website = c.website && !/^https?:\/\//.test(c.website) ? `https://${c.website}` : c.website;
  return (
    <Card style={{ gap: space.md, height: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        {c.logo_url ? (
          <Image source={{ uri: c.logo_url }} contentFit="contain" style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: '#fff' }} />
        ) : (
          <Avatar name={c.company_name} size={52} />
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>{c.company_name}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {c.rbq_verified ? <Tag label={tr('Licence RBQ vérifiée')} tone="ok" /> : null}
            {c.city ? <Tag label={c.city} /> : null}
          </View>
        </View>
      </View>
      {c.specialties ? <P muted>{c.specialties}</P> : null}
      {c.rbq_license ? <Text style={{ color: t.muted, fontSize: 13 }}>{tr('Licence RBQ {n}', { n: c.rbq_license })}</Text> : null}
      <View style={{ gap: space.sm, marginTop: 'auto' }}>
        {c.phone ? (
          <Button kind="brand" icon="call-outline" label={c.phone} onPress={() => Linking.openURL(`tel:${c.phone.replace(/[^\d+]/g, '')}`)} />
        ) : null}
        {website ? <Button kind="secondary" icon="open-outline" label={tr('Site Web')} onPress={() => Linking.openURL(website)} /> : null}
      </View>
    </Card>
  );
}
