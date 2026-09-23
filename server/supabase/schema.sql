create extension if not exists pgcrypto;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  title text not null check (char_length(title) between 1 and 160),
  date date not null,
  time time,
  tag text not null default 'Important' check (tag in ('Important', 'Personal', 'Teaching', 'Work')),
  notes text not null default '',
  repeat text not null default 'None' check (repeat in ('None', 'Weekly', 'Monthly', 'Yearly')),
  done boolean not null default false,
  telegram_enabled boolean not null default true,
  telegram_last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminders add column if not exists telegram_enabled boolean not null default true;
alter table public.reminders add column if not exists telegram_last_notified_at timestamptz;

create index if not exists reminders_workspace_date_idx on public.reminders (workspace_id, date, time);

alter table public.reminders enable row level security;

drop policy if exists "Service role manages reminders" on public.reminders;
create policy "Service role manages reminders"
  on public.reminders
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.set_reminders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reminders_updated_at on public.reminders;
create trigger reminders_updated_at
before update on public.reminders
for each row execute function public.set_reminders_updated_at();
