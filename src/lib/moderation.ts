// Signalement et blocage des membres (règle 1.2 d'Apple sur le contenu des utilisateurs).
// Les signalements arrivent dans la table reports ; mc les traite sous 24 h.
import type { ReportInsert, ReportReason } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'fraude', label: 'Arnaque ou fraude' },
  { id: 'inapproprie', label: 'Contenu offensant ou inapproprié' },
  { id: 'interdit', label: 'Article interdit ou dangereux' },
  { id: 'harcelement', label: 'Harcèlement ou propos abusifs' },
  { id: 'autre', label: 'Autre' },
];

export async function sendReport(report: ReportInsert) {
  return supabase.from('reports').insert(report);
}

export async function blockUser(userId: string) {
  const { error } = await supabase.from('blocks').insert({ blocked_id: userId });
  // Déjà bloqué : pas une erreur pour la personne.
  return { error: error && error.code !== '23505' ? error : null };
}

export async function unblockUser(me: string, userId: string) {
  return supabase.from('blocks').delete().eq('blocker_id', me).eq('blocked_id', userId);
}

export async function blockedIds(me: string): Promise<Set<string>> {
  const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', me);
  return new Set((data ?? []).map((b) => b.blocked_id));
}

export async function isBlockedBetween(a: string, b: string) {
  const { data } = await supabase.rpc('is_blocked_between', { a, b });
  return Boolean(data);
}
