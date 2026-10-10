import { Linking, Text, View } from 'react-native';

import { Card, H1, H2, P, Screen } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/catalog';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { space, useTheme } from '@/lib/theme';

const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

// French source text, translated at render with tr() (English in src/lib/i18n/en/moderation.ts).
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Le service',
    body: [
      'Bâtiplace met en relation des particuliers, des entrepreneurs et des fournisseurs qui achètent et vendent des matériaux, des outils et des équipements au Québec. Bâtiplace n’est pas partie aux transactions : l’acheteur et le vendeur s’entendent directement sur le prix, le paiement et la remise de l’article.',
      'Vous devez avoir 18 ans ou plus et fournir des renseignements exacts pour créer un compte.',
    ],
  },
  {
    title: 'Contenu interdit : tolérance zéro',
    body: [
      'Bâtiplace ne tolère aucun contenu répréhensible ni aucun comportement abusif. Il est interdit de publier ou d’envoyer : des propos haineux, violents, sexuels, harcelants ou discriminatoires ; des arnaques, de fausses annonces ou des articles volés ; des articles illégaux, dangereux ou rappelés ; des coordonnées ou des renseignements d’autrui sans leur consentement.',
      'Chaque annonce et chaque membre peut être signalé avec le bouton « Signaler ». Vous pouvez aussi bloquer un membre : ses annonces sont masquées et il ne peut plus vous écrire.',
      'Notre équipe examine les signalements dans les 24 heures. Le contenu qui enfreint ces conditions est retiré et le compte fautif est suspendu ou supprimé.',
    ],
  },
  {
    title: 'Vos annonces',
    body: [
      'Vous êtes responsable de vos annonces et de vos messages. Vous garantissez avoir le droit de vendre les articles publiés et que les photos et descriptions sont exactes. Vous accordez à Bâtiplace le droit d’afficher ce contenu pour faire fonctionner le service.',
    ],
  },
  {
    title: 'Abonnement Bâtiplace Illimité',
    body: [
      'La publication est gratuite jusqu’à 5 annonces actives. L’abonnement Bâtiplace Illimité permet de publier sans limite. Il est mensuel, se renouvelle automatiquement et est facturé à votre compte App Store ou Google Play. Vous pouvez l’annuler en tout temps dans les réglages de votre téléphone, au moins 24 h avant la fin de la période en cours.',
      'Sur iPhone, l’achat est aussi régi par le contrat de licence standard d’Apple (EULA).',
    ],
  },
  {
    title: 'Responsabilité',
    body: [
      'Bâtiplace ne garantit pas la qualité, la sécurité ni la légalité des articles annoncés. Inspectez l’article avant de payer et ne payez jamais d’avance une personne que vous ne connaissez pas.',
    ],
  },
  {
    title: 'Suppression du compte',
    body: [
      'Vous pouvez supprimer votre compte en tout temps dans Compte, puis Modifier le profil. Bâtiplace peut suspendre un compte qui enfreint ces conditions.',
    ],
  },
];

export default function TermsScreen() {
  useSeo({ title: 'Conditions d’utilisation', description: 'Conditions d’utilisation de Bâtiplace, le marketplace de la construction au Québec.', path: '/conditions' });
  const t = useTheme();
  const { tr } = useI18n();
  return (
    <Screen edges={[]}>
      <H1>{tr('Conditions d’utilisation')}</H1>
      <P muted>{tr('Dernière mise à jour : 10 octobre 2026')}</P>
      {SECTIONS.map((s) => (
        <Card key={s.title} style={{ gap: space.sm }}>
          <H2>{tr(s.title)}</H2>
          {s.body.map((b) => (
            <P key={b}>{tr(b)}</P>
          ))}
        </Card>
      ))}
      <Card style={{ gap: space.sm }}>
        <Text onPress={() => Linking.openURL(APPLE_EULA_URL)} style={{ color: t.accent, fontWeight: '600', fontSize: 15 }}>
          {tr('Contrat de licence standard d’Apple (EULA)')}
        </Text>
        {CONTACT_EMAIL ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <P>{tr('Questions : ')}</P>
            <Text onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={{ color: t.accent, fontWeight: '600', fontSize: 15 }}>
              {CONTACT_EMAIL}
            </Text>
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}
