import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RequireAuth } from '@/components/require-auth';
import { Avatar, Empty, H1, Icon, Loading, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/catalog';
import { CONVERSATION_SELECT, type ConversationRow } from '@/lib/conversations';
import { useI18n } from '@/lib/i18n';
import { blockedIds } from '@/lib/moderation';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

type Summary = { last: string; mine: boolean; unread: number };

export default function MessagesScreen() {
  useSeo({ title: 'Messages', noindex: true });
  const { tr } = useI18n();
  return (
    <RequireAuth title={tr('Messages')} reason={tr('Écrivez aux vendeurs et répondez aux acheteurs, sans partager votre numéro.')}>
      <Inbox />
    </RequireAuth>
  );
}

function Inbox() {
  const t = useTheme();
  const { tr } = useI18n();
  const { userId } = useAuth();
  const [rows, setRows] = useState<ConversationRow[] | null>(null);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const { data } = await supabase.from('conversations').select(CONVERSATION_SELECT).order('last_message_at', { ascending: false });
        const blocked = userId ? await blockedIds(userId) : new Set<string>();
        const convs = ((data ?? []) as unknown as ConversationRow[]).filter((c) => !blocked.has(c.buyer_id) && !blocked.has(c.seller_id));
        const ids = convs.map((c) => c.id);
        const next: Record<string, Summary> = {};
        if (ids.length) {
          const { data: msgs } = await supabase
            .from('messages')
            .select('conversation_id, body, sender_id, read_at, created_at')
            .in('conversation_id', ids)
            .order('created_at', { ascending: false })
            .limit(1000);
          for (const m of msgs ?? []) {
            const s = (next[m.conversation_id] ??= { last: m.body, mine: m.sender_id === userId, unread: 0 });
            if (m.sender_id !== userId && !m.read_at) s.unread += 1;
          }
        }
        if (active) {
          setRows(convs);
          setSummaries(next);
        }
      })();
      return () => {
        active = false;
      };
    }, [userId]),
  );

  return (
    <Screen>
      <H1>{tr('Messages')}</H1>
      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty title={tr('Aucune conversation')} body={tr('Touchez « Contacter le vendeur » sur une annonce pour démarrer une conversation.')} />
      ) : (
        <View style={[styles.list, { borderColor: t.line, backgroundColor: t.surface }]}>
          {rows.map((c, i) => {
            const other = c.buyer_id === userId ? c.seller : c.buyer;
            const s = summaries[c.id];
            // Plain Pressable + router: Link asChild on the web lost the row layout (and crashed with a style array).
            return (
              <Pressable
                key={c.id}
                accessibilityRole="link"
                onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: c.id } })}
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: t.line, backgroundColor: pressed ? t.surface2 : t.surface },
                  i === rows.length - 1 && { borderBottomWidth: 0 },
                ]}>
                <Avatar name={other?.display_name ?? '?'} uri={other?.avatar_url} size={48} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm }}>
                    <Text numberOfLines={1} style={{ color: t.text, fontWeight: s?.unread ? '800' : '700', fontSize: 16, flex: 1 }}>
                      {other?.display_name || tr('Membre Bâtiplace')}
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 12 }}>{timeAgo(c.last_message_at)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="pricetag-outline" size={13} color={t.brand} />
                    <Text numberOfLines={1} style={{ color: t.brand, fontSize: 13, fontWeight: '600', flexShrink: 1 }}>
                      {c.listing?.title ?? tr('Annonce retirée')}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={{ color: s?.unread ? t.text : t.muted, fontSize: 14, fontWeight: s?.unread ? '600' : '400' }}>
                    {s ? `${s.mine ? tr('Vous : ') : ''}${s.last}` : tr('Pas encore de message')}
                  </Text>
                </View>
                {s?.unread ? (
                  <View style={[styles.badge, { backgroundColor: t.accent }]}>
                    <Text style={{ color: t.accentText, fontSize: 12, fontWeight: '700' }}>{s.unread}</Text>
                  </View>
                ) : (
                  <Icon name="chevron-forward" size={18} color={t.muted} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden', width: '100%', maxWidth: 760 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
