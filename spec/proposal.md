# Proposta: Previews e Ações em Links

## 1. Visão Geral

Esta proposta detalha a implementação de duas funcionalidades para enriquecer a interação com links na aplicação:
1.  **Ação Rápida de Cópia:** Um botão com um ícone aparecerá ao passar o mouse sobre um link, permitindo copiá-lo para a área de transferência com um único clique.
2.  **Preview de Conteúdo:** Ao passar o mouse sobre um link de imagem ou vídeo (YouTube), um pequeno card aparecerá exibindo uma miniatura (thumbnail) do conteúdo.

## 2. Arquitetura da Solução

Para manter o código limpo e reutilizável, encapsularemos as novas funcionalidades em um componente dedicado.

-   **Novo Componente - `InteractiveLink`:** Criaremos um novo componente em `components/ui/interactive-link.tsx`. Ele será responsável por renderizar o link e gerenciar toda a lógica de hover, incluindo o botão de cópia e o card de preview.
-   **Componente de UI - `HoverCard`:** Utilizaremos o componente `HoverCard` da biblioteca `shadcn/ui`, que já faz parte do projeto. Ele é ideal para exibir conteúdo rico, como uma imagem de preview, quando o usuário passa o mouse sobre um elemento.
-   **Refatoração do `linkify`:** A função `linkify` em `lib/linkUtils.tsx`, que hoje cria links simples (`<a>`), será modificada para usar o nosso novo e poderoso componente `InteractiveLink`.

## 3. Implementação Detalhada

### 3.1. Botão de Cópia

1.  O componente `InteractiveLink` terá um estado interno para controlar a visibilidade do botão.
2.  Usando CSS (Tailwind), o botão de cópia (com um ícone da biblioteca `lucide-react`) será posicionado sobre o link. Ele ficará oculto por padrão e se tornará visível apenas no evento `hover`.
3.  Ao ser clicado, o botão executará `navigator.clipboard.writeText()` para copiar a URL completa e usará o hook `useToast` para exibir uma notificação de sucesso ("Link copiado!").

### 3.2. Preview de Conteúdo

1.  O componente `InteractiveLink` será envolvido pelo `HoverCard` da `shadcn/ui`. O link em si funcionará como o gatilho (`HoverCardTrigger`).
2.  O conteúdo do card (`HoverCardContent`) conterá a lógica para decidir o que exibir.
3.  Criaremos uma função auxiliar, `getLinkPreview(url)`, que analisará a URL:
    -   **Se for uma imagem** (terminando em `.jpg`, `.png`, `.gif`, etc.), a função retornará um componente `<img>` com a própria URL.
    -   **Se for um vídeo do YouTube**, a função extrairá o ID do vídeo e retornará um `<img>` apontando para a URL de thumbnail fornecida pelo YouTube (`img.youtube.com/vi/<ID>/0.jpg`). Isso é muito mais leve do que carregar o player de vídeo.
    -   Para qualquer outro tipo de link, nenhum preview será exibido.

### 3.3. Impacto no Código Existente

A beleza desta abordagem é seu baixo impacto. A única alteração no código existente será na função `linkify`, que passará a renderizar `<InteractiveLink />` em vez de `<a>`. Como `linkify` já é usado em toda a aplicação, as novas funcionalidades aparecerão em todos os lugares automaticamente.