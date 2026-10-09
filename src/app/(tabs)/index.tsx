import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityField } from '@/components/city-field';
import { LanguageToggle } from '@/components/language-toggle';
import { ListingCard } from '@/components/listing-card';
import { Button, Chip, Empty, Icon, Loading, P } from '@/components/ui';
import { CATEGORIES, CITY_NAMES, CONDITIONS, category, conditionLabel, money } from '@/lib/catalog';
import type { ListingCondition, SearchResult } from '@/lib/database.types';
import { useFavorites } from '@/lib/favorites';
import { tr, useI18n } from '@/lib/i18n';
import { useOrigin } from '@/lib/location';
import { useSeo } from '@/lib/seo';
import { parseSmartQuery, type SmartQuery } from '@/lib/smart-search';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

const RADII = [10, 25, 50, 100, 250, 1500];
const SORTS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'distance', label: 'Plus proches' },
  { id: 'recent', label: 'Plus récentes' },
  { id: 'prix', label: 'Prix croissant' },
];

// Rangée de filtres : défile à l'horizontale sur mobile, passe à la ligne sur ordinateur.
function ChipRow({ wide, gap = space.sm, children }: { wide: boolean; gap?: number; children: React.ReactNode }) {
  return wide ? (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>{children}</View>
  ) : (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap }}>
      {children}
    </ScrollView>
  );
}

export default function ExploreScreen() {
  useSeo({ path: '/' });
  const t = useTheme();
  const { tr } = useI18n();
  const { width } = useWindowDimensions();
  const { origin, radiusKm, setRadiusKm, setCity, useDeviceLocation } = useOrigin();
  const favorites = useFavorites();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [conds, setConds] = useState<ListingCondition[]>([]);
  const [proOnly, setProOnly] = useState<boolean | null>(null);
  const [sort, setSort] = useState('pertinence');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState(false);
  const [smart, setSmart] = useState<SmartQuery | null>(null);
  const [fallback, setFallback] = useState(false);

  // Search assistant: understands « je cherche de la céramique neuve à Laval » and sets the filters.
  const runSearch = () => {
    const text = q.trim();
    if (!text) return clearSearch();
    const parsed = parseSmartQuery(text);
    setSmart(parsed);
    if (parsed.city) setCity(parsed.city);
    // Filters set by the previous sentence are replaced; ones picked by hand stay.
    if (parsed.condition) setConds([parsed.condition]);
    else if (smart?.condition) setConds([]);
    if (parsed.proOnly !== undefined) setProOnly(parsed.proOnly);
    else if (smart?.proOnly !== undefined) setProOnly(null);
    setQuery(parsed.keywords.join(' '));
  };

  const clearSearch = () => {
    setQ('');
    setQuery('');
    setSmart(null);
  };

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setResults([]);
      return;
    }
    setError('');
    const args = {
      lat: origin.lat,
      lng: origin.lng,
      radius_km: radiusKm,
      q: query || null,
      categories: cats.length ? cats : null,
      conditions: conds.length ? conds : null,
      pro_only: proOnly,
      sort,
    };
    let { data, error: err } = await supabase.rpc('search_listings', args);
    // No listing mentions the words: show the matching categories instead (« céramique » → Revêtements).
    const fallbackCats = smart && query && !cats.length ? smart.categories : [];
    const useFallback = !err && !data?.length && fallbackCats.length > 0;
    if (useFallback) ({ data, error: err } = await supabase.rpc('search_listings', { ...args, q: null, categories: fallbackCats }));
    if (err) setError(tr('Impossible de charger les annonces. Vérifiez votre connexion.'));
    const max = smart?.maxPriceCents;
    setFallback(useFallback);
    setResults((data ?? []).filter((l) => !max || l.price_cents <= max));
  }, [origin, radiusKm, query, cats, conds, proOnly, sort, smart, tr]);

  useEffect(() => {
    load();
  }, [load]);

  // Sur ordinateur, la page prend toute la largeur.
  const wide = width >= 1000;
  const columns = width >= 1700 ? 6 : width >= 1400 ? 5 : wide ? 4 : width >= 720 ? 3 : 2;
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const header = (
    <View style={{ gap: space.md, paddingBottom: space.md }}>
      <View style={styles.brandRow}>
        <View style={[styles.mark, { backgroundColor: t.accent }]}>
          <Icon name="home" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: t.text, letterSpacing: -0.8, lineHeight: 38 }}>
            Bâti<Text style={{ color: t.brand }}>place</Text>
          </Text>
          <Text style={{ fontSize: 15, color: t.muted }}>{tr('Le marketplace de la construction au Québec')}</Text>
        </View>
        <LanguageToggle />
      </View>

      <View style={[styles.hero, { backgroundColor: t.accentSoft }]}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: t.text, letterSpacing: -0.4 }}>
          {tr('Le surplus des uns,')} <Text style={{ color: t.accent }}>{tr('le chantier des autres.')}</Text>
        </Text>
        <P muted>
          {tr(
            'Achetez et vendez matériaux, outils et équipements neufs ou usagés, entre voisins, particuliers et professionnels, partout au Québec. Publication gratuite, zéro commission.',
          )}
        </P>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/partenaires')}
          style={({ pressed }) => [styles.partners, { backgroundColor: t.surface }, pressed && { opacity: 0.85 }]}>
          <Icon name="pricetags-outline" size={18} color={t.accent} />
          <Text style={{ color: t.text, fontWeight: '700', flexShrink: 1 }}>{tr('Rabais exclusifs chez nos partenaires')}</Text>
          <Icon name="chevron-forward" size={16} color={t.muted} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/entrepreneurs')}
        style={({ pressed }) => [styles.contractors, { backgroundColor: t.brand }, pressed && { opacity: 0.9 }]}>
        <Icon name="construct-outline" size={26} color={t.brandText} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: t.brandText, fontWeight: '800', fontSize: 17 }}>{tr('Vous cherchez un entrepreneur ?')}</Text>
          <Text style={{ color: t.brandText, opacity: 0.85 }}>{tr('Trouvez un pro près de chez vous pour vos travaux.')}</Text>
        </View>
        <Icon name="chevron-forward" color={t.brandText} />
      </Pressable>

      <View style={[styles.search, { backgroundColor: t.surface, borderColor: t.line }]}>
        <Icon name="sparkles" color={t.accent} />
        <TextInput
          value={q}
          onChangeText={(v) => {
            setQ(v);
            if (!v.trim()) clearSearch();
          }}
          onSubmitEditing={runSearch}
          placeholder={tr('Ex. : je cherche de la céramique à Laval')}
          placeholderTextColor={t.muted}
          style={{ flex: 1, minWidth: 0, fontSize: 16, color: t.text, paddingVertical: 8 }}
          returnKeyType="search"
          accessibilityLabel={tr('Rechercher')}
        />
        <Pressable
          accessibilityRole="button"
          onPress={runSearch}
          style={({ pressed }) => [styles.searchBtn, { backgroundColor: t.accent }, pressed && { opacity: 0.85 }]}>
          <Icon name="search" size={16} color={t.accentText} />
          <Text style={{ color: t.accentText, fontWeight: '700', fontSize: 15 }}>{tr('Rechercher')}</Text>
        </Pressable>
      </View>

      {smart ? (
        <View style={[styles.assistant, { backgroundColor: t.surface2 }]}>
          <Icon name="sparkles" size={18} color={t.accent} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={{ color: t.text, fontWeight: '600' }}>{assistantSummary(smart, origin.label)}</Text>
            {fallback ? (
              <Text style={{ color: t.muted, fontSize: 13 }}>
                {tr('Aucune annonce ne mentionne « {words} » pour l’instant. Voici les annonces de {cats}.', {
                  words: smart.keywords.join(' '),
                  cats: smart.categories.map((c) => tr(category(c).name)).join(', '),
                })}
              </Text>
            ) : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={tr('Effacer la recherche')} onPress={clearSearch} hitSlop={8}>
            <Icon name="close" size={18} color={t.muted} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        <Pressable onPress={() => setPicker(true)} style={[styles.locBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <Icon name={origin.fromDevice ? 'navigate' : 'location-outline'} color={t.brand} />
          <Text style={{ color: t.text, fontWeight: '600' }}>{origin.label}</Text>
          <Icon name="chevron-down" size={14} color={t.muted} />
        </Pressable>
        <ChipRow wide={wide}>
          {RADII.map((r) => (
            <Chip key={r} label={r >= 1500 ? tr('Tout le Québec') : `${r} km`} selected={radiusKm === r} onPress={() => setRadiusKm(r)} />
          ))}
        </ChipRow>
      </View>

      <ChipRow wide={wide}>
        <Chip label={tr('Tout')} selected={cats.length === 0} onPress={() => setCats([])} />
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={tr(c.name)} dot={c.ink} selected={cats.includes(c.id)} onPress={() => setCats(toggle(cats, c.id))} />
        ))}
      </ChipRow>

      <ChipRow wide={wide}>
        {CONDITIONS.map((c) => (
          <Chip key={c.id} label={tr(c.label)} selected={conds.includes(c.id)} onPress={() => setConds(toggle(conds, c.id))} />
        ))}
        <Chip label={tr('Particuliers')} selected={proOnly === false} onPress={() => setProOnly(proOnly === false ? null : false)} />
        <Chip label={tr('Professionnels')} selected={proOnly === true} onPress={() => setProOnly(proOnly === true ? null : true)} />
      </ChipRow>

      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text numberOfLines={1} style={{ color: t.text, fontWeight: '700', flexShrink: 0 }}>
          {results ? tr(results.length > 1 ? '{n} annonces' : '{n} annonce', { n: results.length }) : ' '}
        </Text>
        <ChipRow wide={wide} gap={space.xs}>
          {SORTS.map((s) => (
            <Pressable key={s.id} onPress={() => setSort(s.id)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: sort === s.id ? t.accent : t.muted, fontWeight: sort === s.id ? '700' : '500', fontSize: 13 }}>{tr(s.label)}</Text>
            </Pressable>
          ))}
        </ChipRow>
      </View>
      {error ? <P style={{ color: t.danger }}>{error}</P> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        key={columns}
        data={results ?? []}
        numColumns={columns}
        keyExtractor={(l) => l.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: wide ? space.xxl : space.lg, gap: space.md, width: '100%' }}
        columnWrapperStyle={{ gap: space.md }}
        refreshing={false}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / columns }}>
            <ListingCard listing={item} favorite={favorites.ids.has(item.id)} onToggleFavorite={() => favorites.toggle(item.id)} />
          </View>
        )}
        ListEmptyComponent={
          results === null ? (
            <Loading />
          ) : (
            <Empty
              title={isSupabaseConfigured ? tr('Aucune annonce ne correspond') : tr('Base de données pas encore branchée')}
              body={
                isSupabaseConfigured
                  ? tr('Élargissez le rayon ou retirez un filtre. Ou soyez le premier à publier ici.')
                  : tr('Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY dans .env.')
              }
              action={<Button label={tr('Publier une annonce')} icon="add" onPress={() => router.push('/publier')} />}
            />
          )
        }
      />

      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setPicker(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: t.surface }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text }}>{tr('Rechercher autour de')}</Text>
            <Button
              label={tr('Utiliser ma position')}
              icon="navigate"
              kind="brand"
              onPress={async () => {
                const ok = await useDeviceLocation();
                if (ok) setPicker(false);
              }}
            />
            <CityField
              pickOnly
              value=""
              onChange={(c) => {
                if (!c) return;
                setCity(c);
                setPicker(false);
              }}
            />
            <Text style={{ color: t.muted, fontSize: 13, fontWeight: '600' }}>{tr('Grandes villes')}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {CITY_NAMES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCity(c);
                    setPicker(false);
                  }}
                  style={[styles.cityRow, { borderColor: t.line }]}>
                  <Text style={{ color: t.text, fontSize: 16, fontWeight: origin.label === c ? '700' : '400' }}>{c}</Text>
                  {origin.label === c ? <Icon name="checkmark" color={t.accent} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function assistantSummary(s: SmartQuery, place: string) {
  const parts = [
    s.keywords.length ? tr('Je cherche « {words} »', { words: s.keywords.join(' ') }) : tr('Je cherche des annonces'),
    tr('autour de {place}', { place }),
  ];
  if (s.condition) parts.push(conditionLabel(s.condition).toLowerCase());
  if (s.proOnly === true) parts.push(tr('chez les professionnels'));
  if (s.proOnly === false) parts.push(tr('chez les particuliers'));
  if (s.maxPriceCents) parts.push(tr('{price} maximum', { price: money(s.maxPriceCents) }));
  return parts.join(', ') + '.';
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  mark: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  hero: { borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  contractors: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.lg, paddingHorizontal: space.lg, paddingVertical: space.md },
  partners: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, marginTop: space.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.pill, paddingLeft: space.lg, paddingRight: 5, paddingVertical: 5 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  assistant: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, borderRadius: radius.md, padding: space.md },
  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: space.lg },
  sheet: { borderRadius: radius.lg, padding: space.lg, gap: space.md, width: '100%', maxWidth: 440, alignSelf: 'center' },
  cityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
