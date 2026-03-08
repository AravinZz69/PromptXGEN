-- ══════════════════════════════════════════════════════════════════════════════
-- ADMIN PORTAL FEATURES - COMPLETE MIGRATION
-- ══════════════════════════════════════════════════════════════════════════════
-- Features: Templates, History, Payment Gateways, Auth Config, User Profiles
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop existing triggers and functions first (only if tables exist)
do $$ 
begin
  -- Drop triggers only if their tables exist
  if exists (select 1 from information_schema.tables where table_name = 'templates') then
    drop trigger if exists templates_updated_at_trigger on templates;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'chat_history') then
    drop trigger if exists chat_history_updated_at_trigger on chat_history;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'payment_gateways') then
    drop trigger if exists payment_gateways_updated_at_trigger on payment_gateways;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'auth_config') then
    drop trigger if exists auth_config_updated_at_trigger on auth_config;
  end if;
end $$;

-- Drop functions (these can be dropped safely)
drop function if exists update_templates_updated_at();
drop function if exists update_chat_history_updated_at();
drop function if exists update_payment_gateways_updated_at();
drop function if exists update_auth_config_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TEMPLATES TABLE
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now()
);

-- Add columns if missing (safe for existing tables)
alter table templates add column if not exists title text;
alter table templates add column if not exists description text;
alter table templates add column if not exists category text;
alter table templates add column if not exists subcategory text;
alter table templates add column if not exists icon text default '📝';
alter table templates add column if not exists prompt_template text;
alter table templates add column if not exists variables jsonb default '[]'::jsonb;
alter table templates add column if not exists tags text[] default '{}';
alter table templates add column if not exists role text default 'both';
alter table templates add column if not exists difficulty text default 'beginner';
alter table templates add column if not exists is_pro boolean default false;
alter table templates add column if not exists is_visible boolean default true;
alter table templates add column if not exists is_featured boolean default false;
alter table templates add column if not exists usage_count integer default 0;
alter table templates add column if not exists updated_at timestamptz default now();

-- Add check constraints if they don't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'templates_role_check'
  ) then
    alter table templates 
      add constraint templates_role_check 
      check (role in ('student','teacher','both'));
  end if;
  
  if not exists (
    select 1 from pg_constraint 
    where conname = 'templates_difficulty_check'
  ) then
    alter table templates 
      add constraint templates_difficulty_check 
      check (difficulty in ('beginner','intermediate','advanced'));
  end if;
end $$;

-- Indexes for templates
create index if not exists idx_templates_category on templates(category);
create index if not exists idx_templates_role on templates(role);
create index if not exists idx_templates_visibility on templates(is_visible);
create index if not exists idx_templates_featured on templates(is_featured);
create index if not exists idx_templates_created_at on templates(created_at desc);

-- Auto-update updated_at for templates
create or replace function update_templates_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger templates_updated_at_trigger
  before update on templates
  for each row
  execute function update_templates_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. USER AUTH PROVIDERS (extend profiles table)
-- ══════════════════════════════════════════════════════════════════════════════

alter table profiles add column if not exists
  auth_providers text[] default '{}';
alter table profiles add column if not exists
  phone text;
alter table profiles add column if not exists
  phone_verified boolean default false;
alter table profiles add column if not exists
  is_enabled boolean default true;
alter table profiles add column if not exists
  is_verified boolean default false;
alter table profiles add column if not exists
  last_sign_in timestamptz;
alter table profiles add column if not exists
  sign_in_count integer default 0;

-- Index for user lookups
create index if not exists idx_profiles_is_enabled on profiles(is_enabled);
create index if not exists idx_profiles_last_sign_in on profiles(last_sign_in desc);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. PROMPT HISTORY (basic, advanced, CoT, template prompts)
-- ══════════════════════════════════════════════════════════════════════════════

-- Create table if it doesn't exist
create table if not exists prompt_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Add columns if missing (safe for existing tables)
alter table prompt_history add column if not exists user_email text;
alter table prompt_history add column if not exists type text;
alter table prompt_history add column if not exists input_text text;
alter table prompt_history add column if not exists output_text text;
alter table prompt_history add column if not exists model text default 'llama-3.3-70b-versatile';
alter table prompt_history add column if not exists credits_used integer default 1;
alter table prompt_history add column if not exists template_id uuid;
alter table prompt_history add column if not exists is_flagged boolean default false;
alter table prompt_history add column if not exists flag_reason text;

-- Add check constraint and foreign key if they don't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'prompt_history_type_check'
  ) then
    alter table prompt_history 
      add constraint prompt_history_type_check 
      check (type in ('basic','advanced','cot','template'));
  end if;
  
  -- Note: Foreign key to templates added after templates table exists
  if not exists (
    select 1 from pg_constraint 
    where conname = 'prompt_history_template_id_fkey'
  ) then
    alter table prompt_history 
      add constraint prompt_history_template_id_fkey 
      foreign key (template_id) references templates(id) on delete set null;
  end if;
end $$;

-- Indexes for prompt history
create index if not exists idx_prompt_history_user_id on prompt_history(user_id);
create index if not exists idx_prompt_history_user_email on prompt_history(user_email);
create index if not exists idx_prompt_history_type on prompt_history(type);
create index if not exists idx_prompt_history_flagged on prompt_history(is_flagged);
create index if not exists idx_prompt_history_created_at on prompt_history(created_at desc);
create index if not exists idx_prompt_history_template_id on prompt_history(template_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. CHAT HISTORY (generative AI chat sessions)
-- ══════════════════════════════════════════════════════════════════════════════

-- Create table if it doesn't exist
create table if not exists chat_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now()
);

-- Add columns if missing (safe for existing tables)
alter table chat_history add column if not exists user_id uuid;
alter table chat_history add column if not exists user_email text;
alter table chat_history add column if not exists session_id uuid default gen_random_uuid();
alter table chat_history add column if not exists messages jsonb default '[]'::jsonb;
alter table chat_history add column if not exists model text default 'llama-3.3-70b-versatile';
alter table chat_history add column if not exists total_messages integer default 0;
alter table chat_history add column if not exists credits_used integer default 0;
alter table chat_history add column if not exists is_flagged boolean default false;
alter table chat_history add column if not exists flag_reason text;
alter table chat_history add column if not exists updated_at timestamptz default now();

-- Add foreign key if it doesn't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'chat_history_user_id_fkey'
  ) then
    alter table chat_history 
      add constraint chat_history_user_id_fkey 
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- Indexes for chat history
create index if not exists idx_chat_history_user_id on chat_history(user_id);
create index if not exists idx_chat_history_user_email on chat_history(user_email);
create index if not exists idx_chat_history_session_id on chat_history(session_id);
create index if not exists idx_chat_history_flagged on chat_history(is_flagged);
create index if not exists idx_chat_history_created_at on chat_history(created_at desc);

-- Auto-update updated_at for chat history
create or replace function update_chat_history_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger chat_history_updated_at_trigger
  before update on chat_history
  for each row
  execute function update_chat_history_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. PAYMENT GATEWAYS & TRANSACTIONS
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists payment_gateways (
  id uuid default gen_random_uuid() primary key,
  name text,
  created_at timestamptz default now()
);

-- Add unique constraint if it doesn't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'payment_gateways_name_key'
  ) then
    alter table payment_gateways 
      add constraint payment_gateways_name_key unique (name);
  end if;
end $$;

-- Add columns if missing
alter table payment_gateways add column if not exists display_name text;
alter table payment_gateways add column if not exists is_enabled boolean default false;
alter table payment_gateways add column if not exists is_test_mode boolean default true;
alter table payment_gateways add column if not exists config jsonb default '{}'::jsonb;
alter table payment_gateways add column if not exists webhook_url text;
alter table payment_gateways add column if not exists supported_currencies text[] default '{INR,USD}';
alter table payment_gateways add column if not exists updated_at timestamptz default now();

create table if not exists payment_transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now()
);

-- Add columns if missing (safe for existing tables)
alter table payment_transactions add column if not exists user_id uuid;
alter table payment_transactions add column if not exists user_email text;
alter table payment_transactions add column if not exists gateway text;
alter table payment_transactions add column if not exists gateway_order_id text;
alter table payment_transactions add column if not exists gateway_payment_id text;
alter table payment_transactions add column if not exists amount numeric;
alter table payment_transactions add column if not exists currency text default 'INR';
alter table payment_transactions add column if not exists plan text;
alter table payment_transactions add column if not exists status text default 'pending';
alter table payment_transactions add column if not exists metadata jsonb default '{}'::jsonb;

-- Add constraints if they don't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'payment_transactions_user_id_fkey'
  ) then
    alter table payment_transactions 
      add constraint payment_transactions_user_id_fkey 
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
  
  if not exists (
    select 1 from pg_constraint 
    where conname = 'payment_transactions_status_check'
  ) then
    alter table payment_transactions 
      add constraint payment_transactions_status_check 
      check (status in ('pending','success','failed','refunded'));
  end if;
end $$;

-- Indexes for payment tables
create index if not exists idx_payment_gateways_name on payment_gateways(name);
create index if not exists idx_payment_transactions_user_id on payment_transactions(user_id);
create index if not exists idx_payment_transactions_gateway on payment_transactions(gateway);
create index if not exists idx_payment_transactions_status on payment_transactions(status);
create index if not exists idx_payment_transactions_created_at on payment_transactions(created_at desc);

-- Auto-update updated_at for payment gateways
create or replace function update_payment_gateways_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payment_gateways_updated_at_trigger
  before update on payment_gateways
  for each row
  execute function update_payment_gateways_updated_at();

-- Insert default payment gateways (safe upsert)
insert into payment_gateways 
  (name, display_name, supported_currencies) values
  ('razorpay', 'Razorpay', '{INR,USD}'),
  ('paypal', 'PayPal', '{USD,EUR,GBP}'),
  ('stripe', 'Stripe', '{USD,EUR,GBP,INR}')
on conflict (name) do update set
  display_name = excluded.display_name,
  supported_currencies = excluded.supported_currencies;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. AUTH CONFIG (email, phone, google, github settings)
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists auth_config (
  id uuid default gen_random_uuid() primary key,
  provider text
);

-- Add unique constraint if it doesn't exist
do $$ 
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'auth_config_provider_key'
  ) then
    alter table auth_config 
      add constraint auth_config_provider_key unique (provider);
  end if;
end $$;

-- Add columns if missing
alter table auth_config add column if not exists is_enabled boolean default false;
alter table auth_config add column if not exists config jsonb default '{}'::jsonb;
alter table auth_config add column if not exists updated_at timestamptz default now();

-- Auto-update updated_at for auth config
create or replace function update_auth_config_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger auth_config_updated_at_trigger
  before update on auth_config
  for each row
  execute function update_auth_config_updated_at();

-- Insert default auth providers (safe upsert)
insert into auth_config (provider, is_enabled, config) values
  ('email', true, '{"allow_registrations": true, "require_verification": true, "min_password_length": 8}'::jsonb),
  ('phone', false, '{"otp_length": 6, "otp_expiry_minutes": 10}'::jsonb),
  ('google', true, '{}'::jsonb),
  ('github', true, '{}'::jsonb)
on conflict (provider) do update set
  config = excluded.config;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table templates enable row level security;
alter table prompt_history enable row level security;
alter table chat_history enable row level security;
alter table payment_gateways enable row level security;
alter table payment_transactions enable row level security;
alter table auth_config enable row level security;

-- TEMPLATES POLICIES
drop policy if exists "Public read visible templates" on templates;
create policy "Public read visible templates" on templates
  for select using (is_visible = true);

drop policy if exists "Admin all templates" on templates;
create policy "Admin all templates" on templates
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- PROMPT HISTORY POLICIES
drop policy if exists "Admin all prompt_history" on prompt_history;
create policy "Admin all prompt_history" on prompt_history
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Users own prompt_history" on prompt_history;
create policy "Users own prompt_history" on prompt_history
  for select using (auth.uid() = user_id);

-- CHAT HISTORY POLICIES
drop policy if exists "Admin all chat_history" on chat_history;
create policy "Admin all chat_history" on chat_history
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Users own chat_history" on chat_history;
create policy "Users own chat_history" on chat_history
  for select using (auth.uid() = user_id);

-- PAYMENT GATEWAYS POLICIES
drop policy if exists "Admin all payment_gateways" on payment_gateways;
create policy "Admin all payment_gateways" on payment_gateways
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Public read payment_gateways" on payment_gateways;
create policy "Public read payment_gateways" on payment_gateways
  for select using (is_enabled = true);

-- PAYMENT TRANSACTIONS POLICIES
drop policy if exists "Admin all payment_transactions" on payment_transactions;
create policy "Admin all payment_transactions" on payment_transactions
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Users own payment_transactions" on payment_transactions;
create policy "Users own payment_transactions" on payment_transactions
  for select using (auth.uid() = user_id);

-- AUTH CONFIG POLICIES
drop policy if exists "Admin all auth_config" on auth_config;
create policy "Admin all auth_config" on auth_config
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Public read auth_config" on auth_config;
create policy "Public read auth_config" on auth_config
  for select using (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. SEED DATA (sample templates for testing)
-- ══════════════════════════════════════════════════════════════════════════════

insert into templates (title, description, category, subcategory, icon, prompt_template, variables, tags, role, difficulty, is_visible, is_featured) values
  (
    'Essay Topic Generator',
    'Generate creative essay topics for any subject',
    'K12',
    'Writing',
    '✍️',
    'Generate 5 interesting essay topics about {{subject}} for {{grade_level}} students. Topics should be engaging and age-appropriate.',
    '[{"name": "subject", "label": "Subject", "type": "text", "required": true}, {"name": "grade_level", "label": "Grade Level", "type": "text", "required": true}]'::jsonb,
    '{education,writing,essays,K12}',
    'both',
    'beginner',
    true,
    true
  ),
  (
    'Code Review Assistant',
    'Get detailed code review and improvement suggestions',
    'Coding',
    'Code Review',
    '🔍',
    'Review the following {{language}} code and provide:\n1. Potential bugs or issues\n2. Performance improvements\n3. Best practices violations\n4. Security concerns\n\nCode:\n{{code}}',
    '[{"name": "language", "label": "Programming Language", "type": "text", "required": true}, {"name": "code", "label": "Code to Review", "type": "text", "required": true}]'::jsonb,
    '{coding,review,debugging,programming}',
    'both',
    'intermediate',
    true,
    true
  ),
  (
    'JEE Physics Problem Solver',
    'Step-by-step solutions for JEE physics problems',
    'JEE-NEET',
    'Physics',
    '⚛️',
    'Solve this JEE Physics problem step by step:\n\n{{problem}}\n\nProvide:\n1. Concept explanation\n2. Formula identification\n3. Step-by-step solution\n4. Final answer with units',
    '[{"name": "problem", "label": "Physics Problem", "type": "text", "required": true}]'::jsonb,
    '{jee,physics,problem-solving,exam-prep}',
    'student',
    'advanced',
    true,
    false
  )
on conflict do nothing;

-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ══════════════════════════════════════════════════════════════════════════════
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor or via CLI
-- 2. Verify tables created: templates, prompt_history, chat_history, 
--    payment_gateways, payment_transactions, auth_config
-- 3. Verify profiles table has new columns
-- 4. Test RLS policies work correctly for admin users
-- ══════════════════════════════════════════════════════════════════════════════
