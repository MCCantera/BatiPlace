import { Pressable, Text } from 'react-native';

import { useI18n } from '@/lib/i18n';
import { radius, useTheme } from '@/lib/theme';

/** FR / EN switch. Shows the language you can switch to. */
export function LanguageToggle() {
  const t = useTheme();
  const { lang, setLang } = useI18n();
  const next = lang === 'fr' ? 'en' : 'fr';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={next === 'en' ? 'Switch to English' : 'Passer en français'}
      onPress={() => setLang(next)}
      hitSlop={8}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: t.line,
        backgroundColor: t.surface,
        borderRadius: radius.pill,
        paddingHorizontal: 12,
        paddingVertical: 6,
        opacity: pressed ? 0.8 : 1,
      })}>
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 14 }}>{next === 'en' ? 'English' : 'Français'}</Text>
    </Pressable>
  );
}
