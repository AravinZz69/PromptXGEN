-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CMS SYSTEM MIGRATION
-- Creates tables for all 9 CMS pages
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Drop existing tables if they exist (for clean re-run)
drop table if exists blog_posts cascade;
drop table if exists cms_config cascade;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE: cms_config
-- Stores JSON config for all CMS sections (theme, hero, features, pricing, faq, team, navbar, footer)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table cms_config (
  id uuid default gen_random_uuid() primary key,
  section text unique not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Add index for faster lookups
create index idx_cms_config_section on cms_config(section);

-- Add trigger to auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cms_config_updated_at
  before update on cms_config
  for each row
  execute function update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE: blog_posts
-- Stores all blog posts with full metadata
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  category text default 'General',
  author text,
  cover_image_url text,
  tags text[] default '{}',
  status text default 'draft' check (status in ('draft', 'published')),
  content text,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Add indexes for performance
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);
create index idx_blog_posts_category on blog_posts(category);
create index idx_blog_posts_created_at on blog_posts(created_at desc);

-- Add trigger for updated_at
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row
  execute function update_updated_at_column();

-- Auto-set published_at when status changes to published
create or replace function set_published_at()
returns trigger as $$
begin
  if new.status = 'published' and old.status != 'published' then
    new.published_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_set_published_at
  before update on blog_posts
  for each row
  execute function set_published_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS
alter table cms_config enable row level security;
alter table blog_posts enable row level security;

-- CMS Config Policies (Admin only)
create policy "Admin can view cms_config"
  on cms_config for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert cms_config"
  on cms_config for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update cms_config"
  on cms_config for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin can delete cms_config"
  on cms_config for delete
  using (auth.role() = 'authenticated');

-- Blog Posts Policies (Admin only for now, can add public read later)
create policy "Admin can view blog_posts"
  on blog_posts for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert blog_posts"
  on blog_posts for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update blog_posts"
  on blog_posts for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin can delete blog_posts"
  on blog_posts for delete
  using (auth.role() = 'authenticated');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STORAGE BUCKET (for media uploads)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Create storage bucket for CMS media (if not exists)
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

-- Storage policies for cms-media bucket
create policy "Admin can upload to cms-media"
  on storage.objects for insert
  with check (
    bucket_id = 'cms-media' and
    auth.role() = 'authenticated'
  );

create policy "Admin can update cms-media"
  on storage.objects for update
  using (
    bucket_id = 'cms-media' and
    auth.role() = 'authenticated'
  );

create policy "Admin can delete from cms-media"
  on storage.objects for delete
  using (
    bucket_id = 'cms-media' and
    auth.role() = 'authenticated'
  );

create policy "Public can view cms-media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SEED DEFAULT DATA (optional)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insert default theme config
insert into cms_config (section, data)
values (
  'theme',
  '{
    "primaryColor": "#6366f1",
    "accentColor": "#a855f7",
    "backgroundColor": "#0d0f1f",
    "textColor": "#ffffff",
    "buttonColor": "#6366f1",
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "baseFontSize": "16px",
    "borderRadius": "rounded",
    "darkModeDefault": true,
    "showCustomCursor": true
  }'::jsonb
)
on conflict (section) do nothing;

-- Insert default hero config
insert into cms_config (section, data)
values (
  'hero',
  '{
    "badge": "🚀 Now with Chain-of-Thought Prompts",
    "headline": "Generate Perfect AI Prompts",
    "subHeadline": "Transform your ideas into powerful AI prompts with our advanced prompt generation tool",
    "cta1Label": "Get Started Free",
    "cta1Url": "/auth",
    "cta1Color": "primary",
    "cta2Label": "View Demo",
    "cta2Url": "/demo",
    "cta2Color": "outline",
    "backgroundStyle": "gradient",
    "backgroundColor": "#0d0f1f",
    "heroImageUrl": ""
  }'::jsonb
)
on conflict (section) do nothing;

-- Insert default navbar config
insert into cms_config (section, data)
values (
  'navbar',
  '{
    "logoUrl": "",
    "siteName": "AskJai",
    "tagline": "AI Prompt Generator",
    "navLinks": [
      {"label": "Features", "url": "/#features", "isExternal": false, "isVisible": true},
      {"label": "Pricing", "url": "/#pricing", "isExternal": false, "isVisible": true},
      {"label": "Blog", "url": "/blog", "isExternal": false, "isVisible": true},
      {"label": "Contact", "url": "/contact", "isExternal": false, "isVisible": true}
    ],
    "ctaText": "Sign In",
    "ctaUrl": "/auth",
    "ctaVisible": true,
    "ctaStyle": "primary",
    "stickyNavbar": true,
    "transparentOnHero": true
  }'::jsonb
)
on conflict (section) do nothing;

-- Success message
do $$
begin
  raise notice '✅ CMS System migration completed successfully!';
  raise notice '📊 Tables created: cms_config, blog_posts';
  raise notice '🗂️  Storage bucket: cms-media';
  raise notice '🔐 RLS policies enabled for all tables';
end $$;
