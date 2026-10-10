import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';

import { Button, Card, H1, Icon, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { FREE_LISTING_LIMIT, subscriptionPrice } from '@/lib/catalog';
import { useI18n } from '@/lib/i18n';
import { buySubscription, purchasesAvailable, restorePurchases, storeName } from '@/lib/purchases';
import { useSeo } from '@/lib/seo';
import { space, useTheme } from '@/lib/theme';

// Apple's standard licence agreement, required next to an auto-renewable subscription.
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const PERKS = [
  'Annonces illimitées',
  'Valable dans l’application et sur le site Web',
  'Badge Pro et licence RBQ affichée',
  'Statistiques de vues et de messages',
  'Rabais exclusifs chez nos partenaires',
  'Toujours 0 % de commission sur vos ventes',
];

export default function SubscriptionScreen() {
  useSeo({ title: 'Bâtiplace Illimité : annonces illimitées à 9,99 $/mois', description: 'Publiez autant d’annonces que vous voulez sur Bâtiplace pour 9,99 $ par mois. Les 5 premières annonces actives restent gratuites, sans commission.', path: '/abonnement' });
  const t = useTheme();
  const { tr } = useI18n();
  const store = tr(storeName);
  const { userId, subscribed, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function subscribe() {
    if (!userId) return router.push('/connexion');
    setBusy(true);
    setMessage('');
    try {
      const outcome = await buySubscription();
      if (outcome === 'subscribed') {
        // Le webhook met la base à jour en quelques secondes.
        setTimeout(refresh, 3000);
        setMessage(tr('Merci ! Votre abonnement est actif.'));
      } else if (outcome === 'unavailable') {
        setMessage(tr('L’abonnement n’est pas encore offert dans cette version de l’application.'));
      }
    } catch {
      setMessage(tr('L’achat n’a pas pu être complété. Aucun montant n’a été facturé.'));
    }
    setBusy(false);
  }

  async function restore() {
    setBusy(true);
    const ok = await restorePurchases().catch(() => false);
    setBusy(false);
    if (ok) setTimeout(refresh, 3000);
    setMessage(ok ? tr('Abonnement restauré.') : tr('Aucun abonnement trouvé sur ce compte {store}.', { store }));
  }

  return (
    <Screen edges={[]}>
      <H1>{tr('Bâtiplace Illimité')}</H1>
      <P muted>
        {tr('Le forfait gratuit permet {n} annonces actives. Avec Illimité, publiez autant que vous voulez.', { n: FREE_LISTING_LIMIT })}
      </P>
      <Card style={{ gap: space.md }}>
        <Text style={{ fontSize: 40, fontWeight: '800', color: t.text }}>
          {subscriptionPrice()} <Text style={{ fontSize: 16, fontWeight: '500', color: t.muted }}>{tr('/ mois, taxes en sus')}</Text>
        </Text>
        <Text style={{ color: t.muted, fontSize: 14 }}>{tr('Durée : 1 mois, renouvelé automatiquement')}</Text>
        {PERKS.map((p) => (
          <View key={p} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Icon name="checkmark-circle" color={t.ok} />
            <Text style={{ color: t.text, fontSize: 15 }}>{tr(p)}</Text>
          </View>
        ))}
      </Card>

      {subscribed ? (
        <Notice tone="ok" icon="checkmark-circle-outline">
          {tr('Votre abonnement est actif. Pour l’annuler ou le modifier, ouvrez les réglages d’abonnement de votre téléphone ({store}).', { store })}
        </Notice>
      ) : Platform.OS === 'web' ? (
        <Notice icon="phone-portrait-outline">
          {tr('L’abonnement s’achète dans l’application Bâtiplace sur iPhone ou Android, avec votre compte App Store ou Google Play. Connectez-vous ensuite ici avec le même compte : vos annonces illimitées fonctionnent aussi sur le site Web.')}
        </Notice>
      ) : (
        <View style={{ gap: space.sm }}>
          <Button label={tr('S’abonner avec {store}', { store })} icon="card-outline" loading={busy} onPress={subscribe} disabled={!purchasesAvailable} />
          <Button kind="secondary" label={tr('Restaurer un achat')} onPress={restore} disabled={busy || !purchasesAvailable} />
          <P muted style={{ fontSize: 12 }}>
            {tr('Abonnement mensuel renouvelé automatiquement, facturé à votre compte {store}. Annulable en tout temps dans les réglages de votre téléphone, au moins 24 h avant la fin de la période en cours.', { store })}
          </P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            <Text onPress={() => router.push('/conditions')} style={{ color: t.accent, fontSize: 12, fontWeight: '600' }}>
              {tr('Conditions d’utilisation')}
            </Text>
            <Text onPress={() => Linking.openURL(TERMS_URL)} style={{ color: t.accent, fontSize: 12, fontWeight: '600' }}>
              {tr('Contrat de licence d’Apple (EULA)')}
            </Text>
            <Text onPress={() => router.push('/confidentialite')} style={{ color: t.accent, fontSize: 12, fontWeight: '600' }}>
              {tr('Politique de confidentialité')}
            </Text>
          </View>
        </View>
      )}
      {message ? <Notice>{message}</Notice> : null}
    </Screen>
  );
}
