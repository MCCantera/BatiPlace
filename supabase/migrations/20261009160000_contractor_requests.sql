-- Entrepreneurs affichés sur le site : ils envoient une demande de partenariat
-- par le formulaire, mc l'examine dans Supabase (table contractor_requests) et
-- coche « approved » pour l'afficher sur la page Entrepreneurs.

create table public.contractor_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) between 2 and 100),
  contact_name text not null check (char_length(contact_name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 200 and email like '%_@_%'),
  phone text not null default '' check (char_length(phone) <= 40),
  city text not null default '' check (char_length(city) <= 80),
  rbq_license text not null default '' check (char_length(rbq_license) <= 20),
  specialties text not null default '' check (char_length(specialties) <= 200),
  website text not null default '' check (char_length(website) <= 300),
  message text not null default '' check (char_length(message) <= 2000),
  approved boolean not null default false,
  rbq_verified boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contractor_requests enable row level security;

-- Tout le monde peut envoyer une demande, jamais déjà approuvée.
create policy "Envoyer une demande" on public.contractor_requests
  for insert to anon, authenticated with check (not approved and not rbq_verified and sort_order = 0);
-- Le public ne voit que les entrepreneurs approuvés.
create policy "Voir les entrepreneurs approuvés" on public.contractor_requests
  for select to anon, authenticated using (approved);

grant insert (company_name, contact_name, email, phone, city, rbq_license, specialties, website, message)
  on public.contractor_requests to anon, authenticated;
-- Nom du contact, courriel et message restent privés.
grant select (id, company_name, phone, city, rbq_license, specialties, website, approved, rbq_verified, sort_order, created_at)
  on public.contractor_requests to anon, authenticated;
grant all on public.contractor_requests to service_role;
