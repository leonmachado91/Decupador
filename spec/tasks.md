# Lista de Tarefas: Previews e Ações em Links

- [x] 1. Criar a estrutura inicial do novo componente `components/ui/interactive-link.tsx`.
- [x] 2. Implementar a funcionalidade do botão "Copiar" no `InteractiveLink`, incluindo o ícone, a lógica de cópia e a notificação de sucesso.
- [x] 3. Integrar o componente `HoverCard` da `shadcn/ui` no `InteractiveLink` para servir como base para o preview.
- [x] 4. Criar uma função auxiliar `getLinkPreview(url)` para gerar os previews de imagem e de thumbnails do YouTube.
- [x] 5. Conectar a lógica de `getLinkPreview` para que o preview seja exibido dentro do `HoverCardContent` no `InteractiveLink`.
- [x] 6. Modificar a função `linkify` em `lib/linkUtils.tsx` para usar o novo componente `InteractiveLink`.