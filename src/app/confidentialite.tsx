import { Linking, Text, View } from 'react-native';

import { Card, H1, H2, P, Screen } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/catalog';
import { useSeo } from '@/lib/seo';
import { space, useTheme } from '@/lib/theme';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Renseignements que nous recueillons',
    body: [
      'Compte : votre adresse courriel, votre nom affiché, votre type de vendeur, votre ville et, si vous l’indiquez, votre licence RBQ.',
      'Annonces : le titre, la description, le prix, les photos et la ville que vous publiez. Ces renseignements sont publics.',
      'Messages : les conversations avec les autres membres, visibles seulement par les deux participants.',
      'Position : si vous l’autorisez, votre position sert à afficher les annonces près de vous. Elle reste sur votre appareil et n’est pas enregistrée dans votre compte.',
      'Abonnement : l’achat se fait par l’App Store ou Google Play. Nous recevons seulement l’état de votre abonnement, jamais vos renseignements de paiement.',
    ],
  },
  {
    title: 'Utilisation',
    body: [
      'Ces renseignements servent uniquement à faire fonctionner Bâtiplace : afficher les annonces, permettre les échanges entre membres, appliquer votre forfait et assurer la sécurité du service. Nous ne vendons pas vos renseignements et n’affichons pas de publicité ciblée.',
    ],
  },
  {
    title: 'Hébergement et fournisseurs',
    body: [
      'Les données sont hébergées par Supabase dans un centre de données au Canada (région de Montréal). Le site Web est servi par Vercel. Les abonnements sont gérés par Apple, Google et RevenueCat.',
    ],
  },
  {
    title: 'Conservation et suppression',
    body: [
      'Vos renseignements sont conservés tant que votre compte existe. Vous pouvez supprimer votre compte en tout temps dans Compte, puis Modifier le profil : vos annonces, photos, messages et renseignements sont alors effacés.',
    ],
  },
  {
    title: 'Vos droits',
    body: [
      'Conformément à la Loi 25 du Québec, vous pouvez demander l’accès à vos renseignements, leur correction ou leur suppression.',
    ],
  },
];

export default function PrivacyScreen() {
  useSeo({ title: 'Politique de confidentialité', description: 'Comment Bâtiplace recueille, utilise et protège vos renseignements personnels.', path: '/confidentialite' });
  const t = useTheme();
  return (
    <Screen edges={[]}>
      <H1>Politique de confidentialité</H1>
      <P muted>Dernière mise à jour : 9 octobre 2026</P>
      {SECTIONS.map((s) => (
        <Card key={s.title} style={{ gap: space.sm }}>
          <H2>{s.title}</H2>
          {s.body.map((b) => (
            <P key={b}>{b}</P>
          ))}
        </Card>
      ))}
      {CONTACT_EMAIL ? (
        <Card style={{ gap: space.sm }}>
          <H2>Nous joindre</H2>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <P>Responsable de la protection des renseignements personnels : </P>
            <Text onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={{ color: t.accent, fontWeight: '600', fontSize: 15 }}>
              {CONTACT_EMAIL}
            </Text>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
