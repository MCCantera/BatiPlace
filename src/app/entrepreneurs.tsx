import { Image } from 'expo-image';
import { Linking, Text, View } from 'react-native';

import { Button, Card, H1, P, Screen } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { radius, space, useTheme } from '@/lib/theme';

// Bâtiplace's contractor partner: the section sends visitors to RenoGo.
const RENOGO_URL = 'https://renogo.ca';

export default function ContractorsScreen() {
  useSeo({ title: 'Trouver un entrepreneur en construction au Québec', description: 'Trouvez un entrepreneur pour vos travaux de construction et de rénovation partout au Québec avec RenoGo, partenaire de Bâtiplace.', path: '/entrepreneurs' });
  const t = useTheme();
  const { tr } = useI18n();

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm }}>
        <H1>{tr('Vous cherchez un entrepreneur ?')}</H1>
        <P muted>{tr('Bâtiplace s’associe à RenoGo pour vous aider à trouver un pro près de chez vous pour vos travaux.')}</P>
      </View>

      <Card style={{ gap: space.md, alignItems: 'stretch' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: radius.md, padding: space.md, alignItems: 'center' }}>
          <Image
            source={require('@/assets/images/renogo.png')}
            contentFit="contain"
            accessibilityLabel="RenoGo"
            style={{ width: '100%', maxWidth: 320, aspectRatio: 800 / 189 }}
          />
        </View>
        <Text style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>{tr('Trouvez votre entrepreneur avec RenoGo')}</Text>
        <P muted>{tr('Trouvez un entrepreneur pour vos travaux de construction ou de rénovation, partout au Québec.')}</P>
        <Button kind="brand" icon="open-outline" label={tr('Aller sur RenoGo')} onPress={() => Linking.openURL(RENOGO_URL)} />
      </Card>

      <Card style={{ gap: space.sm, backgroundColor: t.surface2 }}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{tr('Vous êtes entrepreneur ?')}</Text>
        <P muted>{tr('Faites-vous connaître auprès de nouveaux clients sur RenoGo.')}</P>
        <Button kind="secondary" icon="open-outline" label={tr('S’inscrire sur RenoGo')} onPress={() => Linking.openURL(RENOGO_URL)} />
      </Card>
    </Screen>
  );
}
