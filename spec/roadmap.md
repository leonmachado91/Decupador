# Roadmap de Implementação

## Fase 1 – Resiliência da importação e feedback
- [ ] Garantir que o `ImportScreen` permaneça ativo até o Supabase retornar os dados e só então atualizar o `documentStore`.
- [ ] Manter um painel de status/log que mostra cada etapa (validar URL, buscar doc, processar comentários, persistir dados) com estados (pendente, em progresso, concluído, erro).
- [ ] Exibir erros completos do Supabase/Google Docs no cliente (alertas, toast ou painel) e evitar que o usuário perca a mensagem por causa de um `docId` prematuro.
- [ ] Confirmar o carregamento com indicadores visuais antes de entrar na `MainInterface`; registrar toasts ou avisos para cada resultado da importação.

## Fase 2 – Revisão profissional da UI e estrutura do app
- [ ] Fazer uma review completa da interface (layout, componentização, consistência de cores/espaçamentos) e documentar pontos de melhoria.
- [ ] Organizar o diretório com padrões profissionais: separar componentes por domínio (importação, script, tabela, modal), padronizar exports nomeados e reutilizar os primitives de `components/ui`.
- [ ] Adicionar um arquivo de estilo global formal (ex: `styles/variables.css` ou `styles/theme.css`) se ainda não existir, e garantir que os temas (dark/light) usem tokens compartilhados.
- [ ] Padronizar componentes visuais críticos (botões, cards, badges) para seguir o design system interno (usando `cn`, variantes `Button`, etc.).
- [ ] Escrever uma breve documentação de boas práticas do projeto (talvez em `spec/ui-guidelines.md`) que indique como abordar novos componentes e padrões.

## Fase 3 – Layout, tipografia e experiência das views
- [ ] Adotar uma fonte principal mais legível (ex: Inter/Space Grotesk/Manrope) no `app/layout.tsx` e ajustar os tokens de espaçamento/contraste para cartas e cabeçalhos.
- [ ] Controlar overflow e quebras nos cards de comentários tanto na vista roteiro quanto na tabela (max-height, `line-clamp`, tooltips ou `title` para o texto completo).
- [ ] Garantir ordenação coerente: na vista roteiro manter o painel de diretrizes na ordem do corpo, na tabela adicionar um dropdown para ordenar por data, trecho (corpo) ou tipo de mídia.
- [ ] Implementar destaque bidirecional entre corpo e comentários (hover no comentário destaca trecho no texto; clicar no corpo leva o painel ao comentário correspondente).
- [ ] Tornar os links clicáveis desde já, com `target="_blank"` e atributos de acessibilidade; adicionar um tooltip mínimo ao passar o mouse.

## Fase 4 – Fluxo de decupagem unificado e modal “Detalhes”
- [ ] Substituir o modal acionado pela coluna “Ações” por dois comportamentos complementares: o modal flutuante acionado por seleção de texto (corpo ou comentário) e o modal fixo “Detalhes”.
- [ ] Flutuante: ao selecionar qualquer trecho abrir opções para mapear Tipo, Link/Asset, Timestamp, Diretriz, Status e Nota do editor; após confirmar, limpar seleção e refletir as alterações no grid da cena.
- [ ] Modal “Detalhes”: renomear o botão para “Detalhes”, manter o título e o comentário bruto, mostrar o trecho vinculado e o grid (Tipo, Link/Assets, Timestamp, Diretriz, Status, Notas do editor) com botões “Salvar progresso” e “Fechar”.
- [ ] Garantir que o painel de diretrizes na vista roteiro também abra o modal de decupagem ao clicar no comentário, com o mesmo grid e estado sincronizado.
- [ ] Fazer com que cada campo definido no modal flutuante alimente a coluna correspondente (timestamp vai para a coluna de timestamp, links para Link / Asset etc.).

## Fase 5 – Previews de links e interatividade
- [ ] Atualizar a coluna “Link / Asset” para renderizar `<a>` clicáveis com take `href`, `rel`, `target` e preview no hover.
- [ ] Prever cards específicos no hover: vídeos exibem thumb + título da página, imagens mostram miniatura, páginas gerais apresentam favicon/título e botão “Copiar link”.
- [ ] Adicionar pequenos modais ou tooltips que surgem ao pairar sobre o link, exibindo os metadados e o botão de copiar.
- [ ] Garantir que os assets catalogados estejam disponíveis também no modal “Detalhes” e no resumo da cena.

## Fase 6 – Persistência e sincronização com Supabase
- [ ] Definir o esquema de banco (`documents`, `scenes`, `scene_assets`, `scene_logs` e triggers de timestamp) e documentá-lo em `spec/schema_sql.md`.
- [ ] Criar funções/rotinas (`lib/api/*`) que consultem e atualizem os registros do Supabase para cenas, status, notas, assets, timestamps e logs.
- [ ] Fazer o estado do `documentStore` refletir esse backend: novos actions/selectors para carregar cenas persistidas, marcar progresso e armazenar assets.
- [ ] Garantir que qualquer alteração feita no front (assets, notas, status, timestamps) dispare persistência imediata (ou background sync) no Supabase.

## Fase 7 – Logs, testes e acompanhamento
- [ ] Criar rotinas de logging visíveis para o usuário (ex: painel de eventos recentes em `MainInterface`) e registrar erros/ações importantes.
- [ ] Adicionar testes (unitários ou de integração leve) para os novos hooks/modais críticos e garantir cobertura mínima para o workflow de importação.
- [ ] Validar as mudanças manualmente com `pnpm lint` e `pnpm test` (se houver) e documentar os steps para QA (execução do script, verificação de preview etc.).