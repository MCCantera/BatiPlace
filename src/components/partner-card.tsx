import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Avatar, Button, Card, Icon, Notice, P, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { Partner } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { slugify } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

// promo_code is not readable by the public; it comes from partner_promo_code() for subscribers.
export const PARTNER_COLUMNS = 'id, name, offer, description, category, city, address, website, phone, email, logo_url, active, sort_order, created_at';

/** `linked`: the name opens the partner's own page (a real link Google can follow). */
export function PartnerCard({ partner: p, stretch, linked }: { partner: Partner; stretch: boolean; linked?: boolean }) {
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
    // Same height for cards side by side; a single column must not stretch (on iOS 100% fills the screen).
    <Card style={{ gap: space.md, height: stretch ? '100%' : undefined }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        {p.logo_url ? (
          <Image source={{ uri: p.logo_url }} contentFit="contain" style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#fff' }} />
        ) : (
          <Avatar name={p.name} size={56} />
        )}
        <View style={{ flex: 1, gap: 4 }}>
          {linked ? (
            <Link href={{ pathname: '/partenaires/[slug]', params: { slug: slugify(p.name) } }} style={{ color: t.text, fontWeight: '800', fontSize: 18, textDecorationLine: 'underline' }}>
              {p.name}
            </Link>
          ) : (
            <Text style={{ color: t.text, fontWeight: '800', fontSize: 18 }}>{p.name}</Text>
          )}
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
