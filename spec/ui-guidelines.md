# UI Guidelines - Decupador

Guia rapido para manter consistencia visual e de UX em novos componentes, alinhado ao `globalSpec.md`.

## Fundamentos
- **Fonte principal:** usar Inter ou Space Grotesk via `app/layout.tsx`; reservar mono apenas para timecodes/IDs.
- **Tokens:** reutilizar variaveis definidas em `app/globals.css` (`--background`, `--card`, `--primary`, `--secondary`, `--muted`, `--border`, `--radius`, `--chart-*`). Evitar hardcode de cores/radius/spacing.
- **Espacamento:** base 4/8/12/16; cartes/painel usam 16-24px internos; gaps de 8-12px entre controles.
- **Radius:** usar `var(--radius-md)`/`--radius-lg`; evitar valores custom fora dos tokens.
- **States:** sempre fornecer hover/focus/active/disabled consistentes; foco visivel (outline `ring` do tema).

## Componentizacao
- **Primitives:** priorizar componentes de `components/ui` (Button, Card, Badge, Input, Select, Popover, Tooltip). Nao reinventar.
- **Variantes:** quando precisar de variantes novas, extender `class-variance-authority` ou props do componente ja existente.
- **Layouts:** usar containers com `max-w-*` e grids/resizable onde fizer sentido; manter `min-h-screen` e paddings consistentes nos main panels.

## Acessibilidade
- Incluir `aria-label` em toggles, icones e botoes sem texto.
- Garantir tab order previsivel; nao remover outlines.
- Fornecer mensagens de erro legiveis (ex: ImportScreen) e instrucoes de uso (estados vazios).

## Estados e feedback
- **Carregamento:** preferir skeletons em cards/tabela; spinners apenas em botoes de acao.
- **Vazio:** mensagens curtas com call-to-action (ex.: colar URL de Doc, adicionar assets).
- **Erro:** mostrar detalhes do erro de Supabase/Google em painel ou toast resumido; manter log persistente em `scene_logs`.

## Links e assets
- Usar `InteractiveLink` para qualquer URL externa; sempre `target="_blank"` + `rel="noopener"`.
- Previews: thumbnails para YouTube/imagens, favicon para paginas gerais; mostrar tooltip com URL encurtada (`shortenUrl`).
- Diferenciar tipos de asset (link/video/image/audio/timestamp/document) visualmente por icone/cor.

## Roteiro x Diretrizes
- Destacar bidirecionalmente: hover/click em comentario destaca trecho no corpo e vice-versa; opcional scroll sincronizado.
- Tratar overflow em cards e tabela com `line-clamp` ou `comment-text-overflow`.

## Formularios e validacao
- Validar com zod no client antes de enviar; mensagens claras.
- Restringir timestamps ao formato HH:MM:SS; URLs devem ser absolutas.
- Evitar `dangerouslySetInnerHTML`; se necessario, sanitizar com DOMPurify.

## Performance
- Memoizar listas volumosas (cenas/assets); usar React Query/SWR para cache/revalidacao de dados do Supabase.
- Dividir componentes client/server: preferir Server Components para listas, Client apenas onde houver interacao.

## Checklist por tela
- ImportScreen: campos com descricao, botao com loader, log persistente e link para compartilhar docs publicos.
- ScriptView: titulo + origem, corpo com line-height confortavel, painel de diretrizes com badge de status, hover/scroll sync.
- TableView: cabeceiros fixos, sort/filters persistentes, tooltips para textos truncados, botoes acessiveis.
