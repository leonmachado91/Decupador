# 05-Interface-e-Experiencia-do-Usuario-UI-UX.md

## 1. Princípios de Design
A UI/UX do "Decupador de Roteiro HI" deve seguir três princípios fundamentais:
- **Clareza e Foco:** A interface deve ser limpa, minimizando distrações para que o editor possa se concentrar na tarefa de decupagem e execução. Não deve haver elementos visuais desnecessários.
- **Flexibilidade:** O editor deve ter a liberdade de trabalhar da maneira que preferir, seja através de uma visão contextual (Roteiro) ou uma visão técnica (Tabela). A ferramenta se adapta ao fluxo de trabalho do usuário, e não o contrário.
- **Feedback Imediato:** Cada ação do usuário deve resultar em uma resposta visual clara e imediata. Marcar um texto, catalogar um *asset* ou mudar um status deve refletir instantaneamente no estado da aplicação.

## 2. Layout Principal da Aplicação
O layout geral consistirá em uma barra de navegação superior simples e uma área de conteúdo principal que renderiza a "Visão" ativa.

- **Barra Superior (Header):**
    - À esquerda: Título/Logo "Decupador de Roteiro HI".
    - No centro: Um seletor de Visão (ex: botões `[Visão Roteiro]` | `[Visão Tabela]`) que permite alternar entre os layouts.
    - À direita: Botão `[Exportar para .CSV]` e talvez um botão `[Limpar e Iniciar Novo Projeto]`.

## 3. Detalhes das Visões

### 3.1. Visão de Importação (Tela Inicial)
- **Componentes:**
    - Um título claro e uma breve descrição da ferramenta.
    - Um único campo de entrada de texto grande, com placeholder "Cole aqui o link público do seu Google Doc".
    - Um botão de ação primário, "Importar Roteiro".
    - Instruções claras sobre como obter o link de compartilhamento correto.

### 3.2. Visão Roteiro (View Padrão)
- **Objetivo:** Simular a familiaridade do Google Docs, mas com superpoderes.
- **Painel Principal (Esquerda):**
    - Exibe o roteiro completo, com marcadores visuais (ex: `[a]`, `[b]`) nos pontos onde os comentários foram feitos. O texto será "read-only".
    - Passar o mouse sobre um marcador `[a]` pode destacar sutilmente o cartão de diretriz correspondente à direita, e vice-versa.
- **Painel Lateral (Direita):**
    - Uma lista scrollável de "Cartões de Diretriz".
    - Cada cartão exibe o "Comentário Bruto" e um botão "Decupar".
    - Cartões de diretrizes já decupados podem ter um indicador visual (ex: um checkmark ou uma cor de fundo diferente).

### 3.3. Visão Tabela (View Técnica)
- **Objetivo:** Fornecer um ambiente de trabalho denso, eficiente e acionável.
- **Estrutura:**
    - A tabela deve ter cabeçalhos fixos para que não desapareçam ao rolar.
    - Células na coluna "Trecho Narrado" para *assets* múltiplos do mesmo trecho devem ser visualmente mescladas para evitar repetição.
    - Células de "Link" devem ter um ícone que, ao ser clicado ou hover, exibe um *preview* do conteúdo (ex: um iframe do YouTube, uma miniatura da imagem).
    - A coluna "Status" será um dropdown com cores distintas para cada opção (`Pendente` - Cinza, `Concluído` - Verde, `Problema` - Vermelho).

## 4. O Fluxo de Decupagem Assistida (Interação Chave)

- **Ativação:** Ação do usuário (clique no botão "Decupar" ou no `+` em uma célula da tabela).
- **Interface:** Um modal ou painel é aberto sobre a UI atual.
    - Topo do Modal: Exibe o texto completo do "Comentário Bruto".
- **Seleção e Catalogação:**
    1. O usuário seleciona um trecho do texto. A seleção fica destacada.
    2. Imediatamente após a seleção, um pequeno *tooltip* ou menu de contexto aparece acima ou abaixo do texto selecionado.
    3. Este menu contém botões de ação: `[Link]`, `[Timestamp]`, `[Diretriz]`.
    4. Clicar em `[Link]` pode abrir um sub-menu: `[Vídeo]`, `[Imagem]`, `[Áudio]`, `[Outro]`.
    5. A ação move o texto selecionado para a estrutura de dados e o texto no modal é marcado como "processado" (ex: muda a cor do fundo ou fica riscado).
- **Conclusão:** O modal pode ser fechado a qualquer momento. O progresso é salvo instantaneamente.

## 5. Micro-interações e Feedback
- **Hover States:** Links, botões e elementos interativos devem ter estados de hover claros.
- **Notificações:** Usar notificações discretas (toasts) para ações importantes, como "Roteiro importado com sucesso!" ou "Exportado para CSV.".
- **Carregamento (Loading):** Durante a chamada à API do Google, a UI deve exibir um estado de carregamento claro (spinner, skeleton screen) para indicar que o sistema está trabalhando.