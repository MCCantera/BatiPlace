import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { Button, Card, H1, Icon, Notice, P, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { FREE_LISTING_LIMIT, SUBSCRIPTION_PRICE } from '@/lib/catalog';
import { buySubscription, purchasesAvailable, restorePurchases, storeName } from '@/lib/purchases';
import { space, useTheme } from '@/lib/theme';

const PERKS = [
  'Annonces illimitées',
  'Valable dans l’application et sur le site Web',
  'Badge Pro et licence RBQ affichée',
  'Statistiques de vues et de messages',
  'Toujours 0 % de commission sur vos ventes',
];

export default function SubscriptionScreen() {
  const t = useTheme();
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
        setMessage('Merci ! Votre abonnement est actif.');
      } else if (outcome === 'unavailable') {
        setMessage('L’abonnement n’est pas encore offert dans cette version de l’application.');
      }
    } catch {
      setMessage('L’achat n’a pas pu être complété. Aucun montant n’a été facturé.');
    }
    setBusy(false);
  }

  async function restore() {
    setBusy(true);
    const ok = await restorePurchases().catch(() => false);
    setBusy(false);
    if (ok) setTimeout(refresh, 3000);
    setMessage(ok ? 'Abonnement restauré.' : `Aucun abonnement trouvé sur ce compte ${storeName}.`);
  }

  return (
    <Screen edges={[]}>
      <H1>Bâtiplace Illimité</H1>
      <P muted>
        Le forfait gratuit permet {FREE_LISTING_LIMIT} annonces actives. Avec Illimité, publiez autant que vous voulez.
      </P>
      <Card style={{ gap: space.md }}>
        <Text style={{ fontSize: 40, fontWeight: '800', color: t.text }}>
          {SUBSCRIPTION_PRICE} <Text style={{ fontSize: 16, fontWeight: '500', color: t.muted }}>/ mois, taxes en sus</Text>
        </Text>
        {PERKS.map((p) => (
          <View key={p} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Icon name="checkmark-circle" color={t.ok} />
            <Text style={{ color: t.text, fontSize: 15 }}>{p}</Text>
          </View>
        ))}
      </Card>

      {subscribed ? (
        <Notice tone="ok" icon="checkmark-circle-outline">
          Votre abonnement est actif. Pour l’annuler ou le modifier, ouvrez les réglages d’abonnement de votre téléphone ({storeName}).
        </Notice>
      ) : Platform.OS === 'web' ? (
        <Notice icon="phone-portrait-outline">
          L’abonnement s’achète dans l’application Bâtiplace sur iPhone ou Android, avec votre compte App Store ou Google Play. Connectez-vous ensuite ici avec le même compte : vos annonces illimitées fonctionnent aussi sur le site Web.
        </Notice>
      ) : (
        <View style={{ gap: space.sm }}>
          <Button label={`S’abonner avec ${storeName}`} icon="card-outline" loading={busy} onPress={subscribe} disabled={!purchasesAvailable} />
          <Button kind="secondary" label="Restaurer un achat" onPress={restore} disabled={busy || !purchasesAvailable} />
          <P muted style={{ fontSize: 12 }}>
            Abonnement mensuel renouvelé automatiquement, facturé à votre compte {storeName}. Annulable en tout temps dans les réglages de votre téléphone, au moins 24 h avant la fin de la période en cours.
          </P>
        </View>
      )}
      {message ? <Notice>{message}</Notice> : null}
    </Screen>
  );
}
