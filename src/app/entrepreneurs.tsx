import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { CityField } from '@/components/city-field';
import { Avatar, Button, Card, Empty, H1, Icon, Loading, Notice, P, Screen, Stars, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/lib/database.types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { space, useTheme } from '@/lib/theme';

type Rating = { seller_id: string; average: number; count: number };

/** Directory of sellers whose profile says they are contractors. */
export default function ContractorsScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { userId } = useAuth();
  const [city, setCity] = useState('');
  const [people, setPeople] = useState<Profile[] | null>(null);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!isSupabaseConfigured) return setPeople([]);
      setPeople(null);
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('seller_type', 'entrepreneur')
        .order('rbq_verified', { ascending: false })
        .order('display_name')
        .limit(200);
      if (city) query = query.eq('city', city);
      query.then(async ({ data, error: err }) => {
        setError(err ? 'Impossible de charger les entrepreneurs. Vérifiez votre connexion.' : '');
        const rows = data ?? [];
        setPeople(rows);
        if (!rows.length) return;
        const { data: r } = await supabase
          .from('seller_ratings')
          .select('seller_id, average, count')
          .in(
            'seller_id',
            rows.map((p) => p.id),
          );
        setRatings(Object.fromEntries((r ?? []).map((x) => [x.seller_id, x])));
      });
    }, [city]),
  );

  const columns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  return (
    <Screen edges={[]}>
      <View style={{ gap: space.sm }}>
        <H1>Vous cherchez un entrepreneur ?</H1>
        <P muted>
          Trouvez un entrepreneur près de chez vous pour vos travaux. Les profils avec une licence RBQ vérifiée apparaissent en premier.
        </P>
      </View>

      <CityField
        pickOnly
        value={city}
        onChange={setCity}
        placeholder="Filtrer par ville (facultatif)"
      />
      {city ? (
        <Pressable onPress={() => setCity('')} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ color: t.accent, fontWeight: '600' }}>Voir toutes les villes</Text>
        </Pressable>
      ) : null}

      {error ? <Notice tone="danger">{error}</Notice> : null}

      {people === null ? (
        <Loading />
      ) : people.length === 0 ? (
        <Empty
          title={city ? `Aucun entrepreneur inscrit à ${city} pour l’instant` : 'Aucun entrepreneur inscrit pour l’instant'}
          body="Les entrepreneurs qui s’inscrivent sur Bâtiplace apparaîtront ici."
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {people.map((p) => {
            const r = ratings[p.id];
            return (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/vendeur/${p.id}`)}
                style={({ pressed }) => [{ width: columns === 1 ? '100%' : `${100 / columns - 2}%`, flexGrow: 1 }, pressed && { opacity: 0.85 }]}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <Avatar name={p.display_name} size={52} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text numberOfLines={1} style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>
                      {p.display_name}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      {p.rbq_verified ? <Tag label="Licence RBQ vérifiée" tone="ok" /> : null}
                      {p.city ? <Tag label={p.city} /> : null}
                    </View>
                    {r && r.count ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Stars value={r.average} />
                        <Text style={{ color: t.muted, fontSize: 13 }}>({r.count})</Text>
                      </View>
                    ) : null}
                  </View>
                  <Icon name="chevron-forward" color={t.muted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <Card style={{ gap: space.sm, backgroundColor: t.surface2 }}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>Vous êtes entrepreneur ?</Text>
        <P muted>Inscrivez-vous gratuitement et choisissez « Entrepreneur » dans votre profil pour apparaître dans cette liste.</P>
        <Button
          kind="secondary"
          icon="person-add-outline"
          label={userId ? 'Modifier mon profil' : 'Créer mon compte'}
          onPress={() => router.push(userId ? '/profil' : '/connexion')}
        />
      </Card>
    </Screen>
  );
}
