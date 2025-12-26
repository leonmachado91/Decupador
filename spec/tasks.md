# Tarefas de Melhoria UI/UX

- [x] **Instalação de Dependências**
    - [x] Instalar `framer-motion` para animações.
    - [x] Instalar `clsx` e `tailwind-merge` (se ainda não houver) para utilitários de classe.

- [x] **Estilização Global e Tema**
    - [x] Criar classe utilitária `.glass-panel` em `globals.css`.
    - [x] Refinar paleta de cores no Dark Mode (reduzir preto absoluto, usar cinzas profundos).
    - [x] Adicionar variáveis de animação se necessário.

- [x] **Componentes de UI Base**
    - [x] Criar componente `Skeleton` (ou atualizar existente) para loading states.
    - [x] Criar componente `SegmentedControl` para o toggle de visualização no Header.

- [x] **Refatoração do Header**
    - [x] Implementar `SegmentedControl` no lugar dos botões de view.
    - [x] Melhorar visual dos botões de ação (ícones mais consistentes, hover effects).

- [x] **Melhorias na Main Interface**
    - [x] Substituir overlay de loading por `Skeleton` na área de conteúdo.
    - [x] Implementar transição animada (fade/slide) entre `ScriptView` e `TableView` usando `AnimatePresence`.

- [x] **Refinamento do ScriptView**
    - [x] **Refatoração:** Extrair `ScenesSidebar` e `DocumentContent` para componentes menores.
    - [x] Melhorar tipografia do texto do roteiro (line-height, font-size).
    - [x] Adicionar animação de entrada para o menu flutuante de decupagem.

- [x] **Refinamento do TableView**
    - [x] **Refatoração:** Extrair `TableViewRow` e `AssetManager` para componentes isolados.
    - [x] Adicionar `sticky header` na tabela.
    - [x] Melhorar visual das células e bordas (reduzir ruído visual).

- [x] **Empty State (Import Screen)**
    - [x] Redesenhar tela de importação para ser mais visual e convidativa.
    - [x] Adicionar feedback visual de drag-and-drop (simulado com animações).