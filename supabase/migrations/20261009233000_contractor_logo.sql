-- Logo affiché sur la page Entrepreneurs (URL publique, ajoutée par Bâtiplace).
alter table public.contractor_requests
  add column logo_url text not null default '' check (char_length(logo_url) <= 500);
grant select (logo_url) on public.contractor_requests to anon, authenticated;
