-- Foundation only. Apply once with Supabase SQL Editor or `supabase db push`.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 filename text not null,
 storage_path text not null unique,
 extraction_status text not null default 'pending' check (extraction_status in ('pending','extracted','failed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 check (split_part(storage_path,'/',1) = user_id::text)
);
create table public.dental_plans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 rules jsonb not null check (jsonb_typeof(rules) = 'object'),
 source_document_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key (source_document_id,user_id) references public.documents(id,user_id)
);
create table public.scenarios (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null,
 name text not null,
 snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key (plan_id,user_id) references public.dental_plans(id,user_id) on delete cascade
);
create table public.procedures (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null,
 scenario_id uuid,
 details jsonb not null check (jsonb_typeof(details) = 'object'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key (plan_id,user_id) references public.dental_plans(id,user_id) on delete cascade,
 foreign key (scenario_id,user_id) references public.scenarios(id,user_id) on delete cascade
);
create index documents_owner on public.documents(user_id);
create index plans_owner on public.dental_plans(user_id);
create index scenarios_owner_plan on public.scenarios(user_id,plan_id);
create index procedures_owner_plan on public.procedures(user_id,plan_id);
create index procedures_scenario on public.procedures(scenario_id,user_id);
create index plans_source on public.dental_plans(source_document_id,user_id);

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger documents_updated before update on public.documents for each row execute function public.touch_updated_at();
create trigger plans_updated before update on public.dental_plans for each row execute function public.touch_updated_at();
create trigger scenarios_updated before update on public.scenarios for each row execute function public.touch_updated_at();
create trigger procedures_updated before update on public.procedures for each row execute function public.touch_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id) values(new.id) on conflict(id) do nothing; return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.dental_plans enable row level security;
alter table public.scenarios enable row level security;
alter table public.procedures enable row level security;
create policy profiles_owner on public.profiles for all to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy documents_owner on public.documents for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy plans_owner on public.dental_plans for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy scenarios_owner on public.scenarios for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy procedures_owner on public.procedures for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.profiles,public.documents,public.dental_plans,public.scenarios,public.procedures from anon;
grant select,insert,update,delete on public.profiles,public.documents,public.dental_plans,public.scenarios,public.procedures to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('plan-documents','plan-documents',false,10485760,array['application/pdf']);
create policy private_document_read on storage.objects for select to authenticated using (bucket_id='plan-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_document_insert on storage.objects for insert to authenticated with check (bucket_id='plan-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_document_update on storage.objects for update to authenticated using (bucket_id='plan-documents' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='plan-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_document_delete on storage.objects for delete to authenticated using (bucket_id='plan-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
