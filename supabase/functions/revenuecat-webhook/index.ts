// Reçoit les événements RevenueCat (App Store / Google Play) et met à jour
// public.subscriptions. L'app_user_id RevenueCat est l'id Supabase du compte.
// Dans RevenueCat, réglez l'en-tête Authorization sur la valeur du secret
// REVENUECAT_WEBHOOK_SECRET (supabase secrets set REVENUECAT_WEBHOOK_SECRET=...).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ENTITLEMENT = 'illimite';
const ACTIVE_EVENTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT']);
const ENDED_EVENTS = new Set(['EXPIRATION', 'SUBSCRIPTION_PAUSED']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret || req.headers.get('Authorization') !== secret) return new Response('Unauthorized', { status: 401 });

  const { event } = await req.json();
  if (!event) return new Response('No event', { status: 400 });
  if (event.entitlement_ids && !event.entitlement_ids.includes(ENTITLEMENT)) return new Response('ignored');

  // A transfer moves the entitlement between app user ids.
  const userIds: string[] = event.type === 'TRANSFER' ? [...(event.transferred_from ?? []), ...(event.transferred_to ?? [])] : [event.app_user_id];
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  for (const uid of userIds.filter((u) => UUID.test(u))) {
    let isActive: boolean | null = null;
    if (event.type === 'TRANSFER') isActive = (event.transferred_to ?? []).includes(uid);
    else if (ACTIVE_EVENTS.has(event.type)) isActive = true;
    else if (ENDED_EVENTS.has(event.type)) isActive = false;
    // CANCELLATION / BILLING_ISSUE keep access until expiration_at_ms.
    else if (event.type === 'CANCELLATION' || event.type === 'BILLING_ISSUE') isActive = true;
    if (isActive === null) continue;

    const { error } = await admin.from('subscriptions').upsert({
      user_id: uid,
      is_active: isActive,
      store: event.store ?? null,
      product_id: event.product_id ?? null,
      expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
    if (error && !error.message.includes('foreign key')) return new Response(error.message, { status: 500 });
  }
  return new Response('ok');
});
