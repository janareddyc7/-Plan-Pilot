create table if not exists public.appointments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_name text not null check (length(provider_name) between 2 and 160),
  provider_address text not null default '',
  provider_phone text not null default '',
  appointment_date date not null,
  appointment_time time not null,
  status text not null check (status in ('planned', 'requested', 'confirmed')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_user_date_idx on public.appointments(user_id, appointment_date);
alter table public.appointments enable row level security;
create policy "Owners manage appointments" on public.appointments for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
