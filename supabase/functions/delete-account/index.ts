// Supprime le compte de la personne connectée (exigé par l'App Store).
// Les annonces, messages, favoris et évaluations suivent par ON DELETE CASCADE.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

  const url = Deno.env.get('SUPABASE_URL')!;
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data.user) return new Response('Unauthorized', { status: 401, headers: cors });
  const uid = data.user.id;

  // Retirer les photos du stockage avant de supprimer le compte.
  const { data: folders } = await admin.storage.from('listing-photos').list(uid, { limit: 1000 });
  for (const folder of folders ?? []) {
    const { data: files } = await admin.storage.from('listing-photos').list(`${uid}/${folder.name}`, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${uid}/${folder.name}/${f.name}`);
    if (paths.length) await admin.storage.from('listing-photos').remove(paths);
  }

  const { error: delError } = await admin.auth.admin.deleteUser(uid);
  if (delError) return new Response(delError.message, { status: 500, headers: cors });
  return new Response(JSON.stringify({ deleted: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});
