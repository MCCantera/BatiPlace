import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, Icon, Loading } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { CONVERSATION_SELECT, type ConversationRow } from '@/lib/conversations';
import type { Message } from '@/lib/database.types';
import { locale, useI18n } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { friendlyError, supabase } from '@/lib/supabase';
import { MAX_WIDTH, radius, space, useTheme } from '@/lib/theme';

const QUICK_REPLIES = ['Est-ce encore disponible ?', 'Quel est votre meilleur prix ?', 'Livrez-vous ?', 'Je peux passer demain.'];

export default function ConversationScreen() {
  useSeo({ title: 'Conversation', noindex: true });
  const { id, draft } = useLocalSearchParams<{ id: string; draft?: string }>();
  const t = useTheme();
  const { tr } = useI18n();
  const { userId } = useAuth();
  const [conv, setConv] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const markRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', id).neq('sender_id', userId).is('read_at', null);
  }, [id, userId]);

  useEffect(() => {
    if (!id) return;
    supabase.from('conversations').select(CONVERSATION_SELECT).eq('id', id).maybeSingle().then(({ data }) => setConv(data as unknown as ConversationRow));
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at')
      .then(({ data }) => {
        setMessages(data ?? []);
        if (!data?.length && draft) setText(draft);
        markRead();
      });

    const channel = supabase
      .channel(`conversation:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev && !prev.some((x) => x.id === m.id) ? [...prev, m] : prev));
        if (m.sender_id !== userId) markRead();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, draft, userId, markRead]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setError('');
    setText('');
    const { data, error: err } = await supabase.from('messages').insert({ conversation_id: id, body }).select('*').single();
    if (err) {
      setText(body);
      return setError(friendlyError(err));
    }
    setMessages((prev) => (prev && !prev.some((x) => x.id === data.id) ? [...prev, data] : prev));
  }

  const other = conv ? (conv.buyer_id === userId ? conv.seller : conv.buyer) : null;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ title: other?.display_name || tr('Conversation') }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.column}>
          {conv?.listing ? (
            <Link href={{ pathname: '/annonce/[id]', params: { id: conv.listing.id } }} asChild>
              <Pressable style={[styles.listing, { backgroundColor: t.surface, borderColor: t.line }]}>
                <Icon name="pricetag-outline" color={t.brand} />
                <Text numberOfLines={1} style={{ flex: 1, color: t.text, fontWeight: '600' }}>{conv.listing.title}</Text>
                <Icon name="chevron-forward" color={t.muted} />
              </Pressable>
            </Link>
          ) : null}

          {messages === null ? (
            <Loading />
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={{ padding: space.lg, gap: space.sm }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              renderItem={({ item }) => {
                const mine = item.sender_id === userId;
                return (
                  <View style={[styles.bubble, mine ? { alignSelf: 'flex-end', backgroundColor: t.accent, borderBottomRightRadius: 6 } : { alignSelf: 'flex-start', backgroundColor: t.surface2 }]}>
                    <Text style={{ color: mine ? t.accentText : t.text, fontSize: 15 }}>{item.body}</Text>
                    <Text style={{ color: mine ? t.accentText : t.muted, fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                      {new Date(item.created_at).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={{ color: t.muted, textAlign: 'center', marginTop: space.xl }}>{tr('Écrivez votre premier message.')}</Text>}
            />
          )}

          <View style={{ paddingHorizontal: space.md, gap: space.sm }}>
            <FlatList
              horizontal
              data={QUICK_REPLIES}
              keyExtractor={(q) => q}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: space.sm }}
              renderItem={({ item }) => <Chip label={tr(item)} onPress={() => setText(tr(item))} />}
            />
            {error ? <Text style={{ color: t.danger }}>{error}</Text> : null}
            <View style={[styles.compose, { borderColor: t.line, backgroundColor: t.surface }]}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={tr('Écrire un message…')}
                placeholderTextColor={t.muted}
                style={{ flex: 1, color: t.text, fontSize: 16, paddingVertical: 10 }}
                multiline
                maxLength={2000}
                onSubmitEditing={send}
                accessibilityLabel={tr('Message')}
              />
              <Pressable onPress={send} accessibilityLabel={tr('Envoyer')} style={[styles.send, { backgroundColor: t.accent }]}>
                <Icon name="send" size={16} color={t.accentText} />
              </Pressable>
            </View>
            <Text style={{ color: t.muted, fontSize: 12, textAlign: 'center', marginBottom: space.sm }}>
              {tr('Ne payez jamais avant d’avoir vu l’article.')}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  listing: { flexDirection: 'row', alignItems: 'center', gap: space.sm, margin: space.md, marginBottom: 0, padding: space.md, borderWidth: 1, borderRadius: radius.md },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  compose: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, borderWidth: 1, borderRadius: 24, paddingLeft: space.lg, paddingRight: 6, paddingVertical: 4 },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
