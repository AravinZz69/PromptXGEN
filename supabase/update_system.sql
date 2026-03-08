-- ============================================
-- AskJai Update System Tables
-- ============================================

-- Stores this app installation info
create table if not exists app_meta (
  id uuid default gen_random_uuid() primary key,
  current_version text not null default '1.0.0',
  product_name text default 'AskJai',
  license_key text,
  owner_email text,
  installed_at timestamptz default now(),
  last_checked_at timestamptz,
  last_updated_at timestamptz,
  update_channel text default 'stable',
  auto_check_enabled boolean default true
);

insert into app_meta (current_version, product_name)
values ('1.0.0', 'AskJai')
on conflict do nothing;

-- Stores notifications received from update server
create table if not exists update_inbox (
  id uuid default gen_random_uuid() primary key,
  version text not null unique,
  title text,
  type text default 'feature',
  changelog jsonb default '[]',
  download_url text,
  changelog_url text,
  size_mb numeric,
  is_critical boolean default false,
  released_at text,
  min_app_version text,
  is_read boolean default false,
  is_installed boolean default false,
  is_dismissed boolean default false,
  received_at timestamptz default now(),
  installed_at timestamptz
);

-- RLS
alter table app_meta enable row level security;
alter table update_inbox enable row level security;

create policy "admin_app_meta" on app_meta
  for all using (auth.role() = 'authenticated');

create policy "admin_update_inbox" on update_inbox
  for all using (auth.role() = 'authenticated');
