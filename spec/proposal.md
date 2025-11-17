# Proposta da Fase 2 — Revisão Profissional da UI e Estrutura

## Contexto
Com o fluxo de importação estabilizado (Fase 1), a próxima iteração deve elevar o projeto a um padrão mais profissional: garantir consistência visual, organizar os componentes por domínio e formalizar tokens e diretrizes para a equipe seguir.

## Objetivos principais
- Entregar uma base visual uniforme (cores, espaçamentos, tipografia e semântica) que possa ser validada pelos stakeholders.
- Reorganizar a estrutura de componentes para refletir domínios claros (importação, roteiros, tabela, modais) e favorecer exports nomeados reutilizáveis.
- Criar um tema global com variáveis CSS e expandir o uso dos primitives em `components/ui`, garantindo que o `MainInterface` respire o mesmo sistema visual.
- Documentar as boas práticas do design system em um arquivo dedicado (`spec/ui-guidelines.md`) para que novos componentes sigam o padrão.

## Estratégia de execução

### 1. Auditoria de UI e documentação dos gaps
- Mapear o layout atual (`ImportScreen`, `MainInterface`, `ScriptView`, `TableView`, modais e toasts) para identificar desalinhamentos nos espaçamentos, componentes mistas (ex: `Button` com hard-coded classes) e uso inconsistente de tokens.
- Criar notas no repositório (ou backlog interno) que apontem os ajustes prioritários: cabeçalho fixo, grade de cards, visuais em modo escuro/claro, estados de carregamento e cópias.

### 2. Reestruturação por domínio
- Criar subpastas como `components/import`, `components/script`, `components/table`, `components/modal` e migrar componentes correspondentes, mantendo exports nomeados consistentes e re-exportando quando fizer sentido.
- Inventariar hooks e helpers (ex: `useDocumentStore`, `dataProcessor`) para garantir que o domínios compartilhem importações claras, reduzindo caminhos relativos duplicados.
- Introduzir arquivos de índice (`index.ts`) sempre que agrupamentos tiverem mais de um componente para facilitar `import { X } from "@/components/script"` no futuro.

### 3. Tema global e tokens
- Adicionar `styles/theme.css` (ou `variables.css`) com root variables para cores principais, secundárias, superfícies, bordas, sombra e tipografia, incluindo variantes claras e escuras.
- Importar esse arquivo em `app/layout.tsx` para que o Next aproveite os tokens no CSS global; garantir que `next-themes` sobreponha `data-theme` ou classes no `html`.
- Ajustar o toggle de tema em `MainInterface` para usar o novo token (ex: `bg-primary`, `text-on-primary`) e remover classes inline que contrariam o sistema.
- Propagar as variáveis nos componentes (botoes, cards, badges) usando `cn` e criando classes utilitárias no CSS (ex: `.surface-card`, `.border-divider`).

### 4. Uniformização dos componentes críticos
- Padronizar os componentes visuais reutilizados (botões, cartões, badges) utilizando as variantes já expostas em `components/ui`.
- Criar wrappers ou variantes locais se necessário (ex: `interface ScriptCard`) para garantir títulos, copy e grid consistentes.
- Garantir que os novos componentes usem `cn` (`lib/utils.ts`) sempre que houver lógica de classes condicional, e que eles aceitem `className` e `aria` props para flexibilidade.
- Validar o uso correto de tokens em listas/ tabelas (ex: bordas `border-border`, `bg-secondary` etc) e expandir a coleção de tokens se precisar de novos estados (ex: `state-error`, `state-success`).

### 5. Documentação e comunicação
- Criar `spec/ui-guidelines.md` que explique o sistema de tokens, as convenções de nomeação, a obrigatoriedade de exports nomeados e como documentar componentes.
- Registrar as decisões tomadas na reorganização (ex: por que a `BreakdownModal` mudou de pasta) e listar padrões recomendados (caminhos, temas, testes visuais).
- Compartilhar a proposta em uma reunião/revisão rápida para alinhar o time antes de entrar na Fase 3.

## Critérios de sucesso
- Layout e componentes reutilizam a mesma paleta, espaçamentos e tokens documentados em `styles/theme.css`.
- A árvore de `components/` reflete domínios claros com índices e exports consistentes.
- As partes críticas da interface (botões, cards, badges) usam variantes do design system.
- A documentação de boas práticas (`spec/ui-guidelines.md`) orienta novos contribuidores.
- Stakeholders conseguem validar a interface com base nas melhorias documentadas.

## Riscos e dependências
- Reorganizar componentes pode impactar importações em outros arquivos; um check rápido do TypeScript (`pnpm lint`) deve ser usado para confirmar.
- Tokens novos exigem sincronização com o toggle de tema; é preciso validar manualmente o comportamento dark/light após cada refactor.
