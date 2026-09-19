-- =====================================================================
-- Ivy B. Buncaras — Portfolio: Blog + Library + Comments schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- POSTS (blog / discussion) ----------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,              -- Markdown
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- COMMENTS ----------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  name text not null,
  body text not null,
  approved boolean not null default false,   -- comments are held for your approval
  created_at timestamptz not null default now()
);

-- ---------- BOOKS (library) ----------
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  shelf text not null default 'To read',     -- e.g. Favorite / Reading now / To read
  rating int default 0,                      -- 0-5
  description text,
  cover_url text,
  file_url text,                             -- optional PDF / document link
  link_url text,                             -- optional external link (Goodreads, etc.)
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- PROJECTS ----------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Web',      -- drives the filter buttons
  description text,
  tags text[] default '{}',                  -- small chips, e.g. {Python,Supabase}
  cover_url text,
  link_url text,                             -- GitHub repo / live link
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- RESEARCH (preprints / publications) ----------
create table if not exists research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text not null default 'ResearchGate', -- ResearchGate / SSRN / etc.
  description text,
  cover_url text,
  file_url text,                              -- optional uploaded PDF
  link_url text,                              -- optional external link
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY ----------
alter table posts enable row level security;
alter table comments enable row level security;
alter table books enable row level security;

-- Public can read only published posts
create policy "public read published posts" on posts
  for select using (published = true);
-- Any logged-in user (i.e. you — see IMPORTANT note below) can do everything
create policy "admin full access posts" on posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Public can read only approved comments
create policy "public read approved comments" on comments
  for select using (approved = true);
-- Anyone can submit a comment (it stays hidden until you approve it)
create policy "public insert comments" on comments
  for insert with check (true);
-- Only you can read pending comments, approve, or delete
create policy "admin manage comments" on comments
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Books are public to read
create policy "public read books" on books
  for select using (true);
-- Only you can add/edit/delete books
create policy "admin write books" on books
  for insert with check (auth.uid() is not null);
create policy "admin update books" on books
  for update using (auth.uid() is not null);
create policy "admin delete books" on books
  for delete using (auth.uid() is not null);

-- Projects are public to read
alter table projects enable row level security;
create policy "public read projects" on projects
  for select using (true);
create policy "admin write projects" on projects
  for insert with check (auth.uid() is not null);
create policy "admin update projects" on projects
  for update using (auth.uid() is not null);
create policy "admin delete projects" on projects
  for delete using (auth.uid() is not null);

-- Research is public to read
alter table research enable row level security;
create policy "public read research" on research
  for select using (true);
create policy "admin write research" on research
  for insert with check (auth.uid() is not null);
create policy "admin update research" on research
  for update using (auth.uid() is not null);
create policy "admin delete research" on research
  for delete using (auth.uid() is not null);

-- =====================================================================
-- IMPORTANT — this makes "any logged-in user" effectively "only you":
--   1. Go to Authentication → Providers → Email and make sure "Allow
--      new users to sign up" is turned OFF.
--   2. Go to Authentication → Users → Add user, and create exactly one
--      account for yourself (your email + a password).
-- With sign-ups closed and only your account existing, "auth.uid() is
-- not null" can only ever be true for you.
-- =====================================================================

-- ---------- STORAGE (book covers, post covers, PDF uploads) ----------
-- Run this after the SQL above. Then, separately, in the dashboard:
--   Storage → Create bucket → name it "uploads" → toggle "Public bucket" ON.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "public read uploads" on storage.objects
  for select using (bucket_id = 'uploads');
create policy "admin upload files" on storage.objects
  for insert with check (bucket_id = 'uploads' and auth.uid() is not null);
create policy "admin delete files" on storage.objects
  for delete using (bucket_id = 'uploads' and auth.uid() is not null);
