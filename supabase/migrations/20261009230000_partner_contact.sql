-- Téléphone et courriel du partenaire, affichés sur sa fiche.
alter table public.partners
  add column phone text not null default '' check (char_length(phone) <= 40),
  add column email text not null default '' check (char_length(email) <= 200);

grant select (phone, email) on public.partners to anon, authenticated;
