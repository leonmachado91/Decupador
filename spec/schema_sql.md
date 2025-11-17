-- Esquema inicial para persistir documentos, cenas e assets no Supabase
-- Este script serve como referência para execução manual dentro do projeto Supabase

create extension if not exists pgcrypto;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  google_doc_id text not null unique,
  title text,
  summary text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
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
  scene_id uuid references scenes(id) on delete cascade,
  asset_type text not null,
  asset_value text not null,
  asset_label text,
  preview_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists scene_logs (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes(id) on delete cascade,
  level text not null,
  message text not null,
  data jsonb,
  created_at timestamptz default now()
);

create or replace function documents_updated_at_trigger()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger set_documents_updated_at
before update on documents
for each row execute function documents_updated_at_trigger();

create or replace function scenes_updated_at_trigger()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger set_scenes_updated_at
before update on scenes
for each row execute function scenes_updated_at_trigger();
