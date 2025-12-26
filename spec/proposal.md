# Proposta de Melhoria UI/UX - Decupador

## Visão Geral
O objetivo desta proposta é elevar o nível visual e de usabilidade do aplicativo "Decupador", transformando-o de uma ferramenta funcional em um produto com sensação "premium", fluido e agradável de usar. Focaremos em consistência visual, feedback do usuário e micro-interações.

## 1. Identidade Visual e "Look & Feel"

### 1.1. Refinamento do Glassmorphism
- **Atual:** O Header já utiliza `backdrop-blur`, mas pode ser refinado.
- **Proposta:** Aplicar um efeito de "vidro fosco" mais sofisticado não apenas no Header, mas também em elementos flutuantes (como o menu de decupagem) e modais.
- **Ação:** Criar uma classe utilitária `.glass-panel` que combine `bg-background/80`, `backdrop-blur-md`, e uma borda sutil `border-white/10` (no dark mode) para dar profundidade.

### 1.2. Tipografia e Leiturabilidade
- **Atual:** Fonte Inter (padrão).
- **Proposta:** Manter Inter para UI, mas considerar uma fonte Mono ou Serifada para o texto do Roteiro (Script View) para diferenciar o conteúdo da interface.
- **Ação:** Aumentar o `line-height` (leading) no texto do roteiro para melhorar o conforto de leitura.

### 1.3. Paleta de Cores e Contraste
- **Proposta:** Adicionar "accents" (cores de destaque) mais vibrantes para ações principais (botões primários) e feedbacks de sucesso/erro. Garantir que o Dark Mode tenha profundidade (não apenas preto chapado, mas tons de cinza escuro/slate).

## 2. Experiência do Usuário (UX) e Interações

### 2.1. Feedback de Carregamento (Skeletons)
- **Problema:** O overlay de tela cheia "Sincronizando cenas..." bloqueia o uso e parece antiquado.
- **Solução:** Implementar **Skeleton Screens** (esqueletos de carregamento) para a lista de cenas e tabela. O usuário vê a estrutura da página carregando instantaneamente, o que reduz a percepção de espera.
- **Local:** `ScriptView` e `TableView`.

### 2.2. Transições Suaves (Motion)
- **Proposta:** Adicionar animações sutis ao trocar entre "Visão Roteiro" e "Visão Tabela".
- **Tecnologia:** Usar `framer-motion` para fazer um *cross-fade* ou *slide* suave entre as views.
- **Micro-interações:** Botões devem ter feedback tátil visual (leve escala ao clicar).

### 2.3. Navegação e Controle
- **Header:** Substituir os dois botões de alternância de visualização por um **Segmented Control** (controle segmentado) com um indicador deslizante (fundo que se move para a opção ativa). Isso é um padrão de UI mais moderno e elegante.

## 3. Melhorias em Componentes Específicos

### 3.1. Menu Flutuante de Decupagem
- **Proposta:** Torná-lo mais contextual. Ele deve aparecer suavemente próximo à seleção do usuário, com uma animação de entrada (fade-in + slide-up).
- **Visual:** Aplicar o efeito `.glass-panel` e sombras suaves (`shadow-lg`).

### 3.2. Tabela de Decupagem (TableView)
- **Melhoria:** Fixar o cabeçalho da tabela (`sticky header`) para que o usuário não perca o contexto ao rolar listas longas.
- **Responsividade:** Garantir que a tabela tenha rolagem horizontal suave em telas menores sem quebrar o layout da página.

### 3.3. Tela de Importação (Empty State)
- **Proposta:** Transformar a tela inicial (quando não há roteiro) em uma área de "Dropzone" convidativa, com ícones grandes, instruções claras e talvez uma ilustração sutil ou padrão de fundo para não parecer "vazia".

## 4. Resumo Técnico das Mudanças
1.  Instalar `framer-motion` para animações.
2.  Criar componentes de UI reutilizáveis: `SegmentedControl`, `SkeletonLoader`.
3.  Refatorar `MainInterface` para usar transições de estado.
4.  Atualizar `globals.css` com novas classes utilitárias de vidro e sombras.