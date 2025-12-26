# Esquema Supabase com RLS e ownership

```sql
-- Extensoes
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Tabelas
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_doc_id text not null unique,
  title text,
  summary text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  narrative_text text,
  raw_comment text,
  timestamp text,
  status text default 'Pendente',
  editor_notes text,
  order_index integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scene_assets (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('link','image','video','audio','timestamp','document')),
  asset_value text not null,
  asset_label text,
  preview_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists scene_logs (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('info','warn','error')),
  message text not null,
  data jsonb,
  created_at timestamptz default now()
);

-- Triggers updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_documents_updated on documents;
create trigger trg_documents_updated before update on documents
for each row execute function set_updated_at();

drop trigger if exists trg_scenes_updated on scenes;
create trigger trg_scenes_updated before update on scenes
for each row execute function set_updated_at();

-- Row Level Security
alter table documents enable row level security;
alter table scenes enable row level security;
alter table scene_assets enable row level security;
alter table scene_logs enable row level security;

-- Policies (owner-based)
create policy "docs_select" on documents for select using (auth.uid() = user_id);
create policy "docs_ins" on documents for insert with check (auth.uid() = user_id);
create policy "docs_upd" on documents for update using (auth.uid() = user_id);
create policy "docs_del" on documents for delete using (auth.uid() = user_id);

create policy "scenes_select" on scenes for select using (auth.uid() = user_id);
create policy "scenes_ins" on scenes for insert with check (auth.uid() = user_id);
create policy "scenes_upd" on scenes for update using (auth.uid() = user_id);
create policy "scenes_del" on scenes for delete using (auth.uid() = user_id);

create policy "assets_select" on scene_assets for select using (auth.uid() = user_id);
create policy "assets_ins" on scene_assets for insert with check (auth.uid() = user_id);
create policy "assets_upd" on scene_assets for update using (auth.uid() = user_id);
create policy "assets_del" on scene_assets for delete using (auth.uid() = user_id);

create policy "logs_select" on scene_logs for select using (auth.uid() = user_id);
create policy "logs_ins" on scene_logs for insert with check (auth.uid() = user_id);
create policy "logs_del" on scene_logs for delete using (auth.uid() = user_id);

-- Indices para performance
create index if not exists idx_documents_user on documents (user_id);
create index if not exists idx_documents_google on documents (google_doc_id);
create index if not exists idx_scenes_document_order on scenes (document_id, order_index);
create index if not exists idx_assets_scene on scene_assets (scene_id);
create index if not exists idx_logs_scene on scene_logs (scene_id, created_at desc);
```
