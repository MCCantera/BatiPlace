import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { category } from '@/lib/catalog';
import { MAX_WIDTH, radius, space, useTheme } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 18, color }: { name: IconName; size?: number; color?: string }) {
  const t = useTheme();
  return <Ionicons name={name} size={size} color={color ?? t.text} />;
}

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const inner = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.h1, { color: t.text }, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.h2, { color: t.text }, style]}>{children}</Text>;
}

export function P({
  children,
  muted,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.p, { color: muted ? t.muted : t.text }, style]}>
      {children}
    </Text>
  );
}

type ButtonKind = 'primary' | 'brand' | 'secondary' | 'danger';

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  loading,
  small,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = { primary: t.accent, brand: t.brand, secondary: t.surface, danger: t.surface }[kind];
  const fg = { primary: t.accentText, brand: t.brandText, secondary: t.text, danger: t.danger }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: kind === 'secondary' || kind === 'danger' ? t.line : bg },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={small ? 15 : 18} color={fg} /> : null}
      <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  dot,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dot?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? t.brand : t.surface, borderColor: selected ? t.brand : t.line },
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text style={{ color: selected ? t.brandText : t.text, fontWeight: '500', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'accent' | 'brand' }) {
  const t = useTheme();
  const bg = { neutral: t.surface2, ok: t.okSoft, accent: t.accentSoft, brand: t.brand }[tone];
  const fg = { neutral: t.muted, ok: t.ok, accent: t.text, brand: t.brandText }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.muted}
        {...props}
        style={[
          styles.input,
          { borderColor: t.line, backgroundColor: t.surface, color: t.text },
          props.multiline && { minHeight: 100, textAlignVertical: 'top' },
          props.style,
        ]}
      />
      {hint ? <Text style={{ color: t.muted, fontSize: 12 }}>{hint}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }, style]}>{children}</View>;
}

export function Notice({ children, icon = 'information-circle-outline', tone = 'neutral' }: { children: ReactNode; icon?: IconName; tone?: 'neutral' | 'ok' | 'danger' }) {
  const t = useTheme();
  const bg = { neutral: t.surface2, ok: t.okSoft, danger: t.accentSoft }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={tone === 'danger' ? t.danger : t.text} />
      <Text style={{ color: t.text, flex: 1, fontSize: 14, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.empty, { borderColor: t.line, backgroundColor: t.surface }]}>
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>{title}</Text>
      {body ? <P muted style={{ textAlign: 'center' }}>{body}</P> : null}
      {action}
    </View>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ padding: space.xxl, alignItems: 'center' }}>
      <ActivityIndicator color={t.accent} />
    </View>
  );
}

/** Photo of a listing, or its category illustration when there is none. */
export function ListingImage({
  uri,
  categoryId,
  style,
  iconSize = 44,
}: {
  uri: string | null;
  categoryId: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}) {
  const c = category(categoryId);
  return (
    <View style={[{ backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : (
        <Ionicons name={c.icon as IconName} size={iconSize} color={c.ink} />
      )}
    </View>
  );
}

export function Avatar({ name, size = 44, color }: { name: string; size?: number; color?: string }) {
  const t = useTheme();
  const initials =
    name
      .split(/[\s-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? t.brand, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const t = useTheme();
  const n = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={i <= n ? 'star' : 'star-outline'} size={size} color={i <= n ? t.accent : t.line} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.lg },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  p: { fontSize: 15, lineHeight: 22 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.pill, borderWidth: 1 },
  buttonSmall: { paddingVertical: 7, paddingHorizontal: 14 },
  buttonText: { fontWeight: '700', fontSize: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  tag: { paddingVertical: 2, paddingHorizontal: 9, borderRadius: radius.pill, alignSelf: 'flex-start' },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  notice: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: space.xl, gap: space.sm, alignItems: 'center' },
});
