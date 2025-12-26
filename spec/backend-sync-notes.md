# Backend Sync Notes (Supabase)

- Projeto linkado: `kthtkjiqmxelipydjqri` (`supabase link` concluído).
- Migração aplicada (`20251201142500_init.sql`): tabelas `documents`, `scenes`, `scene_assets`, `scene_logs`; colunas `user_id`; RLS owner-based; índices para user/doc/scene.
- Tipos gerados: `lib/supabase.types.ts` via `supabase gen types --linked --schema public`.

## APIs locais criadas
- `lib/api/documents.ts`: `getDocumentByGoogleId`, `upsertDocument`.
- `lib/api/scenes.ts`: `getScenesByDocument`, `upsertScenes`, `upsertSceneAssets`, `insertSceneLog`.
- `lib/supabaseClient.ts`: agora tipado com `Database`.

## Pontos de atenção
- RLS exige sessão (`auth.uid()`). Chamadas com anon sem usuário autenticado irão falhar; garantir login Supabase (ou usar service role apenas em ambiente seguro/server).
- Dados legados sem `user_id` não serão acessíveis; fazer backfill ou limpar.
- Para evoluir: conectar hooks/fluxos do front a essas APIs, mapear state -> payload (`document_id`, `user_id`, `order_index`) e tratar erros com logs persistidos (`scene_logs`).
