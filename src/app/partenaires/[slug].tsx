import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { PARTNER_COLUMNS, PartnerCard } from '@/components/partner-card';
import { Empty, H1, Loading, P, Screen } from '@/components/ui';
import type { Partner } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { partnerSeo, slugify, useSeo } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

/** One partner's page: what Google shows when someone searches the partner's name. api/partenaire.js pre-fills its tags. */
export default function PartnerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const t = useTheme();
  const { tr } = useI18n();
  const [partner, setPartner] = useState<Partner | null | undefined>(undefined);

  useEffect(() => {
    // Only a handful of partners: match the slug here rather than storing it.
    supabase
      .from('partners')
      .select(PARTNER_COLUMNS)
      .then(({ data }) => setPartner(((data as Partner[] | null) ?? []).find((p) => slugify(p.name) === slug) ?? null));
  }, [slug]);

  useSeo(partner ? partnerSeo(partner) : { title: 'Partenaire introuvable', noindex: true, pending: partner === undefined });

  if (partner === undefined) return <Loading />;
  if (partner === null)
    return (
      <Screen edges={[]}>
        <Empty title={tr('Ce partenaire n’est plus disponible')} />
      </Screen>
    );

  const what = [partner.category, partner.city].filter(Boolean).join(' · ');

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <H1>{partner.name}</H1>
        {what ? <P muted>{what}</P> : null}
        <PartnerCard partner={partner} stretch={false} />
        <P muted>
          {tr('{name} est partenaire de Bâtiplace, le marketplace de la construction au Québec. Les abonnés Bâtiplace Illimité et LOKA profitent de : {offer}.', {
            name: partner.name,
            offer: partner.offer,
          })}
        </P>
        <Link href="/partenaires" style={{ color: t.accent, fontWeight: '600' }}>
          {tr('Voir tous les partenaires')}
        </Link>
      </View>
    </Screen>
  );
}
