import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Text, View, useWindowDimensions } from 'react-native';

import { Avatar, Button, Card, Empty, H1, Icon, Loading, Notice, P, Screen, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import type { Partner } from '@/lib/database.types';
import { useSeo } from '@/lib/seo';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

// promo_code is not readable by the public; it comes from partner_promo_code() for subscribers.
const PARTNER_COLUMNS = 'id, name, offer, description, category, city, address, website, phone, email, logo_url, active, sort_order, created_at';

export default function PartnersScreen() {
  useSeo({ title: 'Partenaires : rabais exclusifs pour les abonnés', description: 'Rabais exclusifs chez des quincailleries, fournisseurs et commerces du Québec pour les abonnés Bâtiplace et LOKA.', path: '/partenaires' });
  const t = useTheme();
  const { tr } = useI18n();
  const { width } = useWindowDimensions();
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isSupabaseConfigured) return setPartners([]);
      supabase
        .from('partners')
        .select(PARTNER_COLUMNS)
        .order('sort_order')
        .order('name')
        .then(({ data, error: err }) => {
          setError(!!err);
          setPartners((data as Partner[] | null) ?? []);
        });
    }, []),
  );

  const columns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm }}>
        <H1>{tr('Partenaires')}</H1>
        <P muted>{tr('Des rabais exclusifs chez nos marchands partenaires, réservés aux abonnés Bâtiplace Illimité et LOKA.')}</P>
      </View>

      {error ? <Notice tone="danger">{tr('Impossible de charger les partenaires. Vérifiez votre connexion.')}</Notice> : null}

      {partners === null ? (
        <Loading />
      ) : partners.length === 0 ? (
        <Empty
          title={tr('Nos premiers partenaires arrivent bientôt')}
          body={tr('Nous discutons avec des quincailleries, centres de rénovation et fournisseurs du Québec. Leurs rabais exclusifs apparaîtront ici.')}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {partners.map((p) => (
            <View key={p.id} style={{ width: columns === 1 ? '100%' : `${100 / columns - 2}%`, flexGrow: 1 }}>
              <PartnerCard partner={p} />
            </View>
          ))}
        </View>
      )}

      <Card style={{ gap: space.sm, backgroundColor: t.surface2 }}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{tr('Comment profiter d’un rabais')}</Text>
        <P muted>{tr('Abonnés Bâtiplace Illimité : connectez-vous pour afficher le code du partenaire, ou présentez votre abonnement en magasin.')}</P>
        <P muted>{tr('Abonnés LOKA : présentez votre abonnement LOKA actif en magasin.')}</P>
      </Card>
    </Screen>
  );
}

function PartnerCard({ partner: p }: { partner: Partner }) {
  const t = useTheme();
  const { tr } = useI18n();
  const { userId, subscribed } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  async function showCode() {
    setLoadingCode(true);
    const { data } = await supabase.rpc('partner_promo_code', { partner: p.id });
    setCode(data ?? '');
    setLoadingCode(false);
  }

  const website = p.website && !/^https?:\/\//.test(p.website) ? `https://${p.website}` : p.website;
  const place = [p.address, p.city].filter(Boolean).join(', ');

  return (
    <Card style={{ gap: space.md, height: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        {p.logo_url ? (
          <Image source={{ uri: p.logo_url }} contentFit="contain" style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#fff' }} />
        ) : (
          <Avatar name={p.name} size={56} />
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: t.text, fontWeight: '800', fontSize: 18 }}>{p.name}</Text>
          {p.category ? <Tag label={p.category} /> : null}
        </View>
      </View>

      <Text style={{ color: t.accent, fontWeight: '800', fontSize: 20 }}>{p.offer}</Text>
      {p.description ? <P muted>{p.description}</P> : null}

      {place ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="location-outline" size={16} color={t.muted} />
          <Text style={{ color: t.muted, flex: 1 }}>{place}</Text>
        </View>
      ) : null}

      <View style={{ gap: space.sm, marginTop: 'auto' }}>
        {subscribed ? (
          code === null ? (
            <Button kind="brand" icon="pricetag-outline" label={tr('Obtenir mon rabais')} loading={loadingCode} onPress={showCode} />
          ) : code ? (
            <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: t.accent, borderRadius: radius.md, padding: space.md, alignItems: 'center', gap: 4 }}>
              <Text style={{ color: t.muted, fontSize: 13 }}>{tr('Votre code')}</Text>
              <Text selectable style={{ color: t.text, fontWeight: '800', fontSize: 22, letterSpacing: 1 }}>
                {code}
              </Text>
            </View>
          ) : (
            <Notice icon="storefront-outline">{tr('Présentez votre abonnement Bâtiplace Illimité en magasin pour obtenir le rabais.')}</Notice>
          )
        ) : (
          <Button
            kind="secondary"
            icon="lock-closed-outline"
            label={userId ? tr('Réservé aux abonnés') : tr('Connectez-vous pour en profiter')}
            onPress={() => router.push(userId ? '/abonnement' : '/connexion')}
          />
        )}
        {p.phone ? (
          <Button kind="secondary" icon="call-outline" label={p.phone} onPress={() => Linking.openURL(`tel:${p.phone.replace(/[^\d+]/g, '')}`)} />
        ) : null}
        {p.email ? <Button kind="secondary" icon="mail-outline" label={p.email} onPress={() => Linking.openURL(`mailto:${p.email}`)} /> : null}
        {website ? <Button kind="secondary" icon="open-outline" label={tr('Site Web')} onPress={() => Linking.openURL(website)} /> : null}
      </View>
    </Card>
  );
}
