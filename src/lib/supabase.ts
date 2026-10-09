import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from './database.types';
import { tr } from './i18n';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createClient<Database>(url || 'http://localhost', key || 'missing', {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export const PHOTO_BUCKET = 'listing-photos';

export function photoUrl(path: string | null | undefined) {
  if (!path) return null;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Turns a Supabase/Postgres error into a sentence a person can act on. */
export function friendlyError(error: { message?: string; hint?: string } | null | undefined) {
  if (!error) return '';
  if (error.message?.includes('LIMITE_GRATUITE')) {
    return tr('Le forfait gratuit permet 5 annonces actives. Passez à Bâtiplace Illimité pour publier sans limite.');
  }
  if (error.message?.includes('Invalid login credentials')) return tr('Courriel ou mot de passe incorrect.');
  if (error.message?.includes('User already registered')) return tr('Un compte existe déjà avec ce courriel.');
  if (error.message?.includes('Email not confirmed')) return tr('Confirmez votre courriel avec le lien reçu, puis reconnectez-vous.');
  if (error.message?.includes('Password should be')) return tr('Le mot de passe doit contenir au moins 6 caractères.');
  return error.message ?? tr('Une erreur est survenue. Réessayez.');
}
