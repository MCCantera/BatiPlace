import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, Field, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { ReportReason } from '@/lib/database.types';
import { useI18n } from '@/lib/i18n';
import { REPORT_REASONS, blockUser, blockedIds, sendReport, unblockUser } from '@/lib/moderation';
import { friendlyError } from '@/lib/supabase';
import { radius, space, useTheme } from '@/lib/theme';

// Fenêtre « Signaler / Bloquer » pour une annonce, un membre ou une conversation.
export function ReportSheet({
  visible,
  onClose,
  userId: target,
  userName,
  listingId,
  conversationId,
  onBlockChange,
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  listingId?: string;
  conversationId?: string;
  onBlockChange?: (blocked: boolean) => void;
}) {
  const t = useTheme();
  const { tr } = useI18n();
  const { userId } = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !userId) return;
    blockedIds(userId).then((ids) => setBlocked(ids.has(target)));
  }, [visible, userId, target]);

  function close() {
    setReason(null);
    setDetails('');
    setSent(false);
    setError('');
    onClose();
  }

  async function report() {
    if (!reason) return setError(tr('Choisissez une raison.'));
    setBusy(true);
    setError('');
    const { error: err } = await sendReport({
      reason,
      details: details.trim(),
      listing_id: listingId ?? null,
      reported_user_id: target,
      conversation_id: conversationId ?? null,
    });
    setBusy(false);
    if (err) return setError(friendlyError(err));
    setSent(true);
  }

  async function toggleBlock() {
    if (!userId) return;
    setBusy(true);
    setError('');
    const { error: err } = blocked ? await unblockUser(userId, target) : await blockUser(target);
    setBusy(false);
    if (err) return setError(friendlyError(err));
    setBlocked(!blocked);
    onBlockChange?.(!blocked);
  }

  const name = userName || tr('ce membre');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={[styles.sheet, { backgroundColor: t.surface }]}>
          <ScrollView contentContainerStyle={{ gap: space.md }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text }}>
              {listingId ? tr('Signaler l’annonce') : tr('Signaler ou bloquer')}
            </Text>
            {sent ? (
              <Notice tone="ok" icon="checkmark-circle-outline">
                {tr('Merci. Notre équipe examine chaque signalement sous 24 h et retire le contenu qui enfreint nos conditions.')}
              </Notice>
            ) : (
              <>
                <Text style={{ color: t.muted }}>{tr('Pourquoi signalez-vous ce contenu ?')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {REPORT_REASONS.map((r) => (
                    <Chip key={r.id} label={tr(r.label)} selected={reason === r.id} onPress={() => setReason(r.id)} />
                  ))}
                </View>
                <Field
                  label={tr('Détails (facultatif)')}
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  maxLength={1000}
                  placeholder={tr('Expliquez ce qui ne va pas')}
                />
                <Button kind="danger" icon="flag-outline" label={tr('Envoyer le signalement')} loading={busy} onPress={report} />
              </>
            )}
            <View style={[styles.divider, { backgroundColor: t.line }]} />
            <Text style={{ color: t.muted }}>
              {blocked
                ? tr('Vous avez bloqué {name}. Vous ne voyez plus ses annonces et ne recevez plus ses messages.', { name })
                : tr('Bloquer {name} masque ses annonces et empêche tout nouveau message entre vous.', { name })}
            </Text>
            <Button
              kind="secondary"
              icon={blocked ? 'lock-open-outline' : 'ban-outline'}
              label={blocked ? tr('Débloquer') : tr('Bloquer ce membre')}
              loading={busy}
              onPress={toggleBlock}
            />
            {error ? <Text style={{ color: t.danger }}>{error}</Text> : null}
            <Button kind="secondary" label={tr('Fermer')} onPress={close} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: space.lg },
  sheet: { borderRadius: radius.lg, padding: space.lg, width: '100%', maxWidth: 460, maxHeight: '90%', alignSelf: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.xs },
});
