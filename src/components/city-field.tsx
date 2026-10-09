import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui';
import { findCity, searchCities } from '@/lib/catalog';
import { useI18n } from '@/lib/i18n';
import { radius, space, useTheme } from '@/lib/theme';

/**
 * Text field where the person types a Québec city and picks it from suggestions.
 * `value` is the chosen city name, or '' while what is typed matches no city.
 */
export function CityField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  pickOnly,
}: {
  label?: string;
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Only report a city once it is picked from the list, not while typing an exact name. */
  pickOnly?: boolean;
}) {
  const t = useTheme();
  const { tr } = useI18n();
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const [picked, setPicked] = useState(!!value);

  useEffect(() => {
    if (value && findCity(text) !== value) {
      setText(value);
      setPicked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const suggestions = focused && text.trim() && !picked ? searchCities(text) : [];
  const unknown = !pickOnly && !focused && text.trim() !== '' && !value;

  const pick = (city: string) => {
    setText(city);
    setPicked(true);
    onChange(city);
  };

  return (
    <View style={{ gap: space.xs }}>
      {label ? <Text style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>{label}</Text> : null}
      <View style={[styles.box, { borderColor: focused ? t.brand : t.line, backgroundColor: t.surface }]}>
        <Icon name="location-outline" color={t.muted} />
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            setPicked(false);
            // Clearing the field also clears a city picked from the list.
            if (!pickOnly) onChange(findCity(v) ?? '');
            else if (!v.trim() && value) onChange('');
          }}
          onFocus={() => setFocused(true)}
          // Leave time for a tap on a suggestion before the list disappears.
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onSubmitEditing={() => suggestions[0] && pick(suggestions[0])}
          placeholder={placeholder ?? tr('Tapez une ville du Québec')}
          placeholderTextColor={t.muted}
          autoCorrect={false}
          autoCapitalize="words"
          autoFocus={autoFocus}
          returnKeyType="done"
          style={[{ flex: 1, minWidth: 0, fontSize: 16, color: t.text, paddingVertical: 12 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
        />
        {value ? <Icon name="checkmark-circle" color={t.ok} /> : null}
      </View>
      {suggestions.length ? (
        <View style={[styles.list, { borderColor: t.line, backgroundColor: t.surface }]}>
          {suggestions.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => pick(c)}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.line },
                pressed && { backgroundColor: t.surface2 },
              ]}>
              <Text style={{ color: t.text, fontSize: 16 }}>{c}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {focused && text.trim() && !picked && !suggestions.length ? (
        <Text style={{ color: t.muted, fontSize: 13 }}>{tr('Aucune ville du Québec ne correspond.')}</Text>
      ) : null}
      {unknown ? <Text style={{ color: t.danger, fontSize: 13 }}>{tr('Choisissez une ville dans la liste.')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md },
  list: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  row: { paddingHorizontal: space.md, paddingVertical: 12 },
});
