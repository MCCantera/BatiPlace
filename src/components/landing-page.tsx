import { Link, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, H1, H2, P, Screen } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { space, useTheme } from '@/lib/theme';

export type LandingContent = {
  h1: string;
  intro: string;
  sections: { title: string; body: string; items?: string[] }[];
  faq: [string, string][];
  browse: string;
  post: string;
};

/**
 * A page written for one Google search (« outils usagés », « matériel usagé »…): real text about what people
 * find on Bâtiplace, a FAQ marked up as FAQPage, and links to the listings. The French version is what Google indexes.
 */
export function LandingPage({ seo, content }: { seo: { title: string; path: string }; content: { fr: LandingContent; en: LandingContent } }) {
  const t = useTheme();
  const { lang } = useI18n();
  const c = content[lang];
  useSeo({
    ...seo,
    description: content.fr.intro,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.fr.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
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

        {c.sections.map((s) => (
          <View key={s.title} style={{ gap: space.sm }}>
            <H2>{s.title}</H2>
            <P muted>{s.body}</P>
            {s.items?.map((item) => (
              <View key={item} style={{ flexDirection: 'row', gap: space.sm }}>
                <Text style={{ color: t.accent, fontWeight: '800' }}>•</Text>
                <P style={{ flex: 1 }}>{item}</P>
              </View>
            ))}
          </View>
        ))}

        <View style={{ gap: space.sm }}>
          <H2>{lang === 'en' ? 'Frequently asked questions' : 'Questions fréquentes'}</H2>
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
          <Link href="/marketplace-construction" style={{ color: t.accent, fontWeight: '600' }}>
            {lang === 'en' ? 'The construction marketplace in Québec' : 'Le marketplace de la construction au Québec'}
          </Link>
          <Link href="/outils-usages" style={{ color: t.accent, fontWeight: '600' }}>
            {lang === 'en' ? 'Used tools' : 'Outils usagés'}
          </Link>
          <Link href="/materiaux-usages" style={{ color: t.accent, fontWeight: '600' }}>
            {lang === 'en' ? 'Used materials' : 'Matériaux usagés'}
          </Link>
        </View>
      </View>
    </Screen>
  );
}
