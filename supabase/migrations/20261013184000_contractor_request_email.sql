-- Courriel à info.batiplace@gmail.com pour chaque nouvelle demande de partenariat
-- (fonction Edge notify-contractor-request, envoi par Resend).
alter table public.contractor_requests add column notified_at timestamptz;

create extension if not exists pg_net with schema extensions;

create function public.notify_contractor_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://gvzroqbummpzgvzubazq.supabase.co/functions/v1/notify-contractor-request',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$;
revoke execute on function public.notify_contractor_request() from public, anon, authenticated;

create trigger notify_contractor_request
  after insert on public.contractor_requests
  for each row execute function public.notify_contractor_request();
