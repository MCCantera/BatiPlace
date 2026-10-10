import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { PARTNER_COLUMNS, PartnerCard } from '@/components/partner-card';
import { Card, Empty, H1, Loading, Notice, P, Screen } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import type { Partner } from '@/lib/database.types';
import { useSeo } from '@/lib/seo';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

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
              <PartnerCard partner={p} stretch={columns > 1} linked />
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
