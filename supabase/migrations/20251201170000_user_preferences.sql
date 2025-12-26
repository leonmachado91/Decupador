create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sort_criteria text check (sort_criteria in ('narrativeText_asc','narrativeText_desc','rawComment_asc','rawComment_desc')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function set_user_pref_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_preferences_updated on user_preferences;
create trigger trg_user_preferences_updated before update on user_preferences
for each row execute function set_user_pref_updated_at();

alter table user_preferences enable row level security;

create policy "prefs_select" on user_preferences for select using (auth.uid() = user_id);
create policy "prefs_upsert" on user_preferences for insert with check (auth.uid() = user_id);
create policy "prefs_update" on user_preferences for update using (auth.uid() = user_id);
create policy "prefs_delete" on user_preferences for delete using (auth.uid() = user_id);
