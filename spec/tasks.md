# Tarefas da Fase 2 – Revisão Profissional da UI

- [x] **Auditar a interface atual** – documentar os desalinhamentos de layout, espaçamentos inconsistentes, componentes com classes inline e o uso misto de tokens/cores (em `ImportScreen`, `MainInterface`, `ScriptView`, `TableView` e modais); ver os achados em `spec/ui-audit.md`.
- [x] **Reorganizar os componentes por domínio** - mover os componentes para `components/import`, `components/script`, `components/table` e `components/modal`, criando `index.ts` para cada domínio e ajustando todas as importações.
- [ ] **Criar e aplicar o tema global** – adicionar `styles/theme.css` com tokens de cores, superfícies, bordas e tipografia (light/dark) e importar o arquivo em `app/layout.tsx` para que os componentes conservem o mesmo sistema visual.
- [ ] **Atualizar componentes críticos para usar o design system** – refatorar botões, cards, badges e tabelas para usar variantes de `components/ui`, `cn` para classes condicionais e os novos tokens; garantir que o toggle de tema em `MainInterface` e os cartões usem os estados corretos (ex: `border-border`, `bg-card`).
- [ ] **Documentar as boas práticas visuais** – escrever `spec/ui-guidelines.md` com orientações sobre tokens, convenções de nomeação, exports nomeados, organização de pastas e como registrar novas variantes; referenciar esse documento sempre que modificar componentes UI.
- [ ] **Validar a nova base visual** – executar `pnpm lint` e revisar manualmente os estados light/dark nas principais views para confirmar que as variáveis e classes estão coerentes.
