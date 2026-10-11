import { Link, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, H1, H2, P, Screen } from '@/components/ui';
import { CATEGORIES } from '@/lib/catalog';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { space, useTheme } from '@/lib/theme';

// The page Google shows for « marketplace construction » : what Bâtiplace is, in plain words, with a FAQ.
const CONTENT = {
  fr: {
    h1: 'Le marketplace de la construction au Québec',
    intro:
      'Bâtiplace est un marketplace où particuliers, entrepreneurs et fournisseurs achètent et vendent des matériaux de construction, des surplus de chantier, des outils, des équipements et de la machinerie, neufs ou usagés, partout au Québec. La publication est gratuite et il n’y a aucune commission sur les ventes.',
    whatTitle: 'Ce qu’on trouve sur Bâtiplace',
    whatBody:
      'Bois et matériaux, surplus de chantier, outils électriques et manuels, échafauds et équipements, machinerie, plomberie, électricité, portes et fenêtres, revêtements de sol et de murs.',
    whoTitle: 'Pour qui ?',
    who: [
      ['Particuliers', 'Vendez les restes de vos rénovations et trouvez des matériaux à bon prix près de chez vous.'],
      ['Entrepreneurs', 'Écoulez vos surplus de chantier au lieu de les jeter, et achetez l’outillage dont vous avez besoin.'],
      ['Fournisseurs et quincailleries', 'Faites connaître vos fins de série, vos retours et vos équipements à des acheteurs de votre région.'],
    ],
    howTitle: 'Comment ça marche',
    how: [
      'Publiez une annonce gratuite avec photos, prix et ville.',
      'Les acheteurs près de chez vous la trouvent grâce à la recherche par distance.',
      'Vous discutez dans la messagerie Bâtiplace, sans partager votre numéro.',
      'Vous vous entendez sur la remise en main propre. Bâtiplace ne prend aucune commission.',
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      ['Est-ce gratuit de vendre sur Bâtiplace ?', 'Oui. Vos 5 annonces actives sont gratuites et aucune commission n’est prélevée sur les ventes. Bâtiplace Illimité (9,99 $ par mois) permet de publier sans limite.'],
      ['Où Bâtiplace est-il offert ?', 'Partout au Québec : Montréal, Laval, Québec, Gatineau, Longueuil, Sherbrooke, Trois-Rivières, Saguenay et toutes les autres municipalités.'],
      ['Peut-on vendre des matériaux usagés ou des surplus de chantier ?', 'Oui. Bâtiplace accepte les matériaux neufs, usagés et les surplus de chantier, ce qui évite qu’ils finissent au conteneur.'],
    ],
    browse: 'Voir les annonces',
    post: 'Publier une annonce gratuite',
    contractors: 'Trouver un entrepreneur',
    partners: 'Rabais chez nos partenaires',
  },
  en: {
    h1: 'The construction marketplace in Québec',
    intro:
      'Bâtiplace is a marketplace where individuals, contractors and suppliers buy and sell building materials, job site surplus, tools, equipment and machinery, new or used, everywhere in Québec. Posting is free and there is no commission on sales.',
    whatTitle: 'What you’ll find on Bâtiplace',
    whatBody:
      'Lumber and materials, job site surplus, power and hand tools, scaffolding and equipment, machinery, plumbing, electrical, doors and windows, floor and wall coverings.',
    whoTitle: 'Who is it for?',
    who: [
      ['Individuals', 'Sell what’s left from your renovations and find materials at a good price near you.'],
      ['Contractors', 'Sell your job site surplus instead of throwing it away, and buy the tools you need.'],
      ['Suppliers and hardware stores', 'Show your end-of-line items, returns and equipment to buyers in your area.'],
    ],
    howTitle: 'How it works',
    how: [
      'Post a free listing with photos, price and city.',
      'Buyers near you find it with distance search.',
      'You chat in Bâtiplace messages without sharing your phone number.',
      'You agree on the pickup. Bâtiplace takes no commission.',
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      ['Is it free to sell on Bâtiplace?', 'Yes. Your 5 active listings are free and no commission is taken on sales. Bâtiplace Unlimited ($9.99 a month) lets you post without limit.'],
      ['Where is Bâtiplace available?', 'Everywhere in Québec: Montréal, Laval, Québec City, Gatineau, Longueuil, Sherbrooke, Trois-Rivières, Saguenay and every other municipality.'],
      ['Can I sell used materials or job site surplus?', 'Yes. Bâtiplace accepts new and used materials and job site surplus, which keeps them out of the dumpster.'],
    ],
    browse: 'See listings',
    post: 'Post a free listing',
    contractors: 'Find a contractor',
    partners: 'Partner discounts',
  },
};

export default function MarketplaceScreen() {
  const t = useTheme();
  const { lang } = useI18n();
  const c = CONTENT[lang];
  const fr = CONTENT.fr;
  useSeo({
    title: 'Marketplace de la construction au Québec : matériaux, outils et surplus de chantier',
    description: fr.intro,
    path: '/marketplace-construction',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: fr.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  });

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.lg, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: space.sm }}>
          <H1>{c.h1}</H1>
          <P>{c.intro}</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Button label={c.browse} onPress={() => router.push('/')} />
            <Button kind="secondary" label={c.post} onPress={() => router.push('/publier')} />
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <H2>{c.whatTitle}</H2>
          <P muted>{c.whatBody}</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map((cat) => (
              <View key={cat.id} style={{ backgroundColor: cat.tint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: cat.ink, fontWeight: '600', fontSize: 13 }}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <H2>{c.whoTitle}</H2>
          {c.who.map(([who, body]) => (
            <Card key={who} style={{ gap: 4 }}>
              <Text role="heading" aria-level={3} style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
                {who}
              </Text>
              <P muted>{body}</P>
            </Card>
          ))}
        </View>

        <View style={{ gap: space.sm }}>
          <H2>{c.howTitle}</H2>
          {c.how.map((step, i) => (
            <View key={step} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
              <Text style={{ color: t.accent, fontWeight: '800', fontSize: 16, width: 22 }}>{i + 1}.</Text>
              <P style={{ flex: 1 }}>{step}</P>
            </View>
          ))}
        </View>

        <View style={{ gap: space.sm }}>
          <H2>{c.faqTitle}</H2>
          {c.faq.map(([q, a]) => (
            <View key={q} style={{ gap: 4 }}>
              <Text role="heading" aria-level={3} style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
                {q}
              </Text>
              <P muted>{a}</P>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          <Link href="/entrepreneurs" style={{ color: t.accent, fontWeight: '600' }}>
            {c.contractors}
          </Link>
          <Link href="/partenaires" style={{ color: t.accent, fontWeight: '600' }}>
            {c.partners}
          </Link>
        </View>
      </View>
    </Screen>
  );
}
