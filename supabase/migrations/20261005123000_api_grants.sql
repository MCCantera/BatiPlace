-- Les nouveaux projets Supabase n'accordent plus de droits par défaut aux rôles
-- de l'API : on les donne explicitement, table par table. Les politiques RLS
-- du schéma initial filtrent ensuite les lignes.

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

grant select on public.categories to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.listings to anon, authenticated;
grant delete on public.listings to authenticated;
grant select on public.listing_photos to anon, authenticated;
grant insert, delete on public.listing_photos to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select on public.seller_ratings to anon, authenticated;

-- Fonctions : PUBLIC peut tout exécuter par défaut, on restreint.
revoke execute on all functions in schema public from public, anon;
grant execute on function public.search_listings(double precision, double precision, double precision, text, text[], public.listing_condition[], boolean, text, int, int) to anon, authenticated;
grant execute on function public.increment_listing_view(uuid) to anon, authenticated;
grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on all functions in schema public to service_role;
