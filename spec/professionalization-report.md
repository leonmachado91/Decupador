# Relatorio de melhorias - Decupador

Diagnostico aprofundado e plano para profissionalizar o produto full-stack, em linha com `spec/globalSpec.md`.

## 1) Achados detalhados por pilar
- **Produto/UX**
  - Fluxo central: importa Google Doc, converte comentarios em cenas (`convertCommentsToScenes`) e mantem tudo em `zustand` com persistencia local; sem colaboracao, multi-dispositivo ou historico.
  - Feedback: ImportScreen tem log apenas em memoria, mensagens curtas e sem erro completo de Supabase/Google; nao ha retry/backoff nem confirmacao ao descartar um documento.
  - Cards/tabela sem clamps ou tooltips; risco de overflow. Destaque cruzado roteiro -> sidebar existe apenas via hover parcial, sem scroll sync.
  - Acessibilidade e usabilidade: sem focus states custom, aria labels, atalhos de teclado, estados vazios ou skeletons; links abrem sem garantir `rel="noopener"`.

- **Frontend/Arquitetura**
  - App Router quase todo client-side (`use client` em Root), perdendo SSR/seguranca/perf; sem layouts por grupos ((auth)/(app)).
  - Tipagem permissiva: `Asset.type` e sortCriteria sao strings livres; TS com `allowJs: true` e `skipLibCheck: true`; `decodeHtmlEntities` sem sanitizacao real.
  - `linkify` depende de `InteractiveLink` mas nao ha camada de metadados; componentes UI nao documentados (sem guia de design).

- **Dados/Backend**
  - Nao existem tabelas/migracoes Supabase para `documents`, `scenes`, `scene_assets`, `scene_logs`; app apenas le `get-google-doc`.
  - Sem RLS nem politicas de acesso; regra de ouro do guia (ninguem acessa nada sem politica explicita) nao aplicada.
  - Sem sincronizacao bidirecional: status/notas/assets nao persistem; export CSV depende do estado local.

- **Seguranca**
  - Sem autenticacao (email/oauth) nem cookies HttpOnly; nenhum middleware protege rotas.
  - Sem CSP, sem validacao (zod) de URL/timestamp/assets, sem sanitizacao robusta (futuro uso de `dangerouslySetInnerHTML` seria risco).
  - Supply chain sem auditoria (Dependabot/Snyk) e sem checks de `npm audit`.

- **Estado e colaboracao**
  - Persistencia local impede colaboracao; sem locks ou reconciliacao com servidor; sem optimistic UI.
  - Preferencias de sort/filtro nao sao guardadas por usuario.

- **Qualidade e DX**
  - Sem Prettier, husky, lint-staged; ESLint basico; nenhuma suite de testes (unit/integ/e2e).
  - Sem Storybook/docs de UI; sem `.env.example`; sem scripts Supabase CLI (init/db push/gen types).
  - CI inexistente (scripts apenas dev/build/lint).

- **Observabilidade e operacao**
  - Sem Sentry, sem logs de dominio, sem painel de eventos recentes; Vercel Analytics nao customizado.
  - Sem pipeline de deploy/rollback; sem monitoramento de falhas de importacao/sync.

- **Performance**
  - Nao ha skeletons; listas podem re-renderizar sem memo; ausencia de React Query/SWR para cache/revalidacao.

## 2) Recomendacoes priorizadas
- **Onda 0 - Fundacao**
  - Criar `.env.example`; adicionar scripts Supabase (init, db push, gen types); ajustar TS (`allowJs: false` se possivel, `skipLibCheck: false`).
  - Prettier + husky + lint-staged; CI (GitHub Actions) rodando `pnpm lint`, `pnpm test`, `pnpm build`.
  - Definir fonte principal (Inter/Space Grotesk) em `app/layout.tsx` e tokens de tema (cores/radius/spacing/shadow) em `styles/theme.css` ou tailwind config; documentar em `spec/ui-guidelines.md`.

- **Onda 1 - Dados, Auth e RLS**
  - Modelar ERD e migracoes para `documents`, `scenes`, `scene_assets`, `scene_logs` com RLS (owner isolation, admin role). Gerar tipos TS via `supabase gen types`.
  - Implementar auth Supabase com cookies HttpOnly e middleware para proteger rotas `(app)`; rotas de login/logout e guardas de session.
  - Criar camada `lib/api/*` para carregar/salvar cenas, assets, status, timestamps, logs. Validar com zod e centralizar erros.

- **Onda 2 - UX e fluxo de decupagem**
  - ImportScreen: debounce + retry/backoff, painel de log persistido em `scene_logs`, exibicao do erro completo e toasts resumidos; confirmacao ao trocar de doc.
  - ScriptView/Table: line-clamp + tooltip/full view; scroll sync e highlight bidirecional; filtros/sorts persistidos; estados vazios/skeletons.
  - Menu flutuante e modal: unificar grid (tipo/link/timestamp/status/notas), renomear botao para "Detalhes", usar optimistic update + sync imediato.
  - Links/assets: `InteractiveLink` com previews (YouTube thumb, imagem, favicon); `rel="noopener"`; timestamps visiveis e editaveis ligados aos assets tipo timestamp.

- **Onda 3 - Qualidade e testes**
  - Unit: `dataProcessor`, `linkUtils`, `sortUtils`, hooks (export CSV, youtube links, text-selection).
  - Integracao: ImportScreen (happy/error path) com mocks de Supabase; ScriptView/Table highlight e updates.
  - E2E Playwright: fluxo importar doc fake -> ver tabela -> exportar CSV -> copiar links. Adicionar coverage gate minimo.
  - Storybook ou docs de componentes (InteractiveLink, FloatingDecupageMenu, BreakdownModal, Header) com tokens.

- **Onda 4 - Observabilidade e deploy**
  - Sentry (frontend) + logs estruturados de import/sync; painel de eventos recentes na MainInterface consumindo `scene_logs`.
  - CSP estrita, auditoria de deps automatica (Dependabot); Vercel Web Analytics configurado.
  - Deploy Vercel com ambientes dev/preview/prod, variaveis separadas, rollback documentado; gates de CI antes de promover.

## 3) Correcoes e incrementos especificos (curto prazo)
- Acessibilidade: aria-label nos toggles, focus states custom, mensagens de erro legiveis; atalhos de teclado para alternar views e copiar links/exportar.
- Arquitetura: evitar `use client` onde nao necessario; mover render inicial para Server Components e hidratar estado com query client.
- Dados/estado: restringir `Asset.type` a union (link/video/image/audio/timestamp/document) e mapear para colunas/visualizacoes corretas; persistir sort/filter por usuario.
- Validacao e seguranca: zod para URLs/timestamps/notas; sanitizar texto com DOMPurify quando houver HTML; middleware para headers de seguranca (CSP, referrer-policy).
- Performance: memo em listas e cards, skeletons em import e carregamento; usar React Query/SWR para cache + revalidacao dos dados do Supabase.
- DX: `pnpm format`, `pnpm lint --max-warnings=0`; remover `skipLibCheck` se possivel; incluir script `pnpm test`.

## 4) Definicao de pronto para producao
- Importacao resiliente com logs persistentes e reprocesso; cenas/assets/status/notas no Supabase sob RLS.
- Auth obrigatoria em rotas app com cookies HttpOnly; CSP ativa; inputs validados e sanitizados.
- UX consistente com tokens de design, estados vazios/carregamento, destaque cruzado, previews de links/ativos e modal unificado.
- CI verde (lint+test+build), cobertura minima em parsers/hooks/fluxos criticos, smoke E2E passando; deploy Vercel automatizado com rollback.
