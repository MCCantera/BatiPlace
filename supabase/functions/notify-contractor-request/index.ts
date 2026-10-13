// Envoie un courriel à Bâtiplace pour chaque nouvelle demande de partenariat (table contractor_requests).
// Appelée par le déclencheur notify_contractor_request avec { id } ; relit la ligne elle-même et
// n'envoie qu'une fois (notified_at), donc un appel externe ne peut rien envoyer de plus.
// Secret requis : RESEND_API_KEY (compte Resend ouvert avec l'adresse NOTIFY_TO).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const NOTIFY_TO = 'info.batiplace@gmail.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== 'string' || !UUID.test(id)) return new Response('Bad request', { status: 400 });
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return new Response('RESEND_API_KEY missing', { status: 500 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: r } = await admin.from('contractor_requests').select('*').eq('id', id).is('notified_at', null).maybeSingle();
  if (!r) return new Response('nothing to send');

  const lines = [
    `Entreprise : ${r.company_name}`,
    `Contact : ${r.contact_name}`,
    `Courriel : ${r.email}`,
    `Téléphone : ${r.phone || '—'}`,
    `Ville : ${r.city || '—'}`,
    `Licence RBQ : ${r.rbq_license || '—'}`,
    `Spécialités : ${r.specialties || '—'}`,
    `Site Web : ${r.website || '—'}`,
    '',
    r.message || '(aucun message)',
    '',
    'Pour l’afficher sur Bâtiplace : Supabase > Table Editor > contractor_requests > cochez « approved ».',
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Bâtiplace <onboarding@resend.dev>',
      to: [NOTIFY_TO],
      reply_to: r.email,
      subject: `Nouvelle demande de partenariat : ${r.company_name}`,
      text: lines.join('\n'),
    }),
  });
  if (!res.ok) return new Response(`Resend ${res.status}: ${await res.text()}`, { status: 502 });

  await admin.from('contractor_requests').update({ notified_at: new Date().toISOString() }).eq('id', id);
  return new Response('sent');
});
