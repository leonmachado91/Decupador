# Auditoria visual preliminar (Fase 2)

Este documento registra as inconsistências de layout, espaçamentos e uso de tokens/chutes visuais que detectamos nos principais componentes atuais. O objetivo é ter um ponto de partida claro para a reorganização da UI e a introdução de tokens globais na Fase 2.

## 1. ImportScreen (`components/import/import-screen.tsx`)

- A tela inteira é envolvida por `<div className="flex min-h-screen items-center justify-center p-6">` (linha 167) e o card interno usa `max-w-2xl space-y-8`. Isso cria um layout pontual, mas não compartilha os mesmos espaçamentos do restante da aplicação (MainInterface usa `px-6`, `p-8`, `h-[calc(100vh-4rem)]`), tornando difícil garantir consistência quando o usuário transita entre telas. Precisamos de um container comum com tokens de gap, padding e largura máxima.
- O campo de URL e o botão principal foram estilizados com `className="h-12 bg-card text-base"` e `className="h-12 px-8 text-base font-semibold"` (linhas 192-198). Esses valores fixos ignoram os tokens de tamanho do `components/ui` (ex: variantes `lg` de botão) e não reaproveitam o `Input`/`Button` padrão; qualquer ajuste de altura ou cor terá que ser aplicado manualmente em cada componente semelhante.
- O painel de log usa `rounded-xl border border-border bg-card/60 p-4` (linha 235), e cada entrada repete `rounded-md border border-border/60 bg-card/30 px-3 py-2` (linha 247). A repetição de classes utilitárias (bordas, superfícies, espaçamentos) é exatamente o que queremos evitar. Devemos definir tokens como `surface-card`, `surface-border` e `gap-base` para que esse visual seja reaplicável.
- O alerta de sucesso (linha 228) usa `className="border-green-500/50 bg-green-500/10"` em vez de variáveis temáticas, enquanto os estados de erro reutilizam o `Alert` com `variant="destructive"`. Precisamos de tokens de estado (`state-success`, `state-error`) para manter o visual sincronizado entre toasts, alerts e badges.

## 2. MainInterface (`components/main-interface.tsx`)

- O cabeçalho utilisa `header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur..."` (linha 28) e o container interno mistura `px-6`, `gap-3` e `bg-secondary p-1` (linha 39).  Relacionado ao problema anterior, essas medidas são aplicadas localmente: não existe uma classe de layout compartilhada (ex: `.page-header`) com padding/altura definidas, o que dificulta garantir a mesma hierarquia de visuais em outras telas.
- Os botões de ação (Exportar, Novo Roteiro) aplicam `className="border-primary/30 hover:bg-primary/10 bg-transparent"` (linhas 72 e 80) apesar de usarem variantes `outline`. Isso mostra que o conjunto `components/ui/button` não oferece todas as variações necessárias e que estamos complementando com classes inline, deixando a aparência espalhada. Precisamos excluir essas customizações e estender os primitives (ou criar wrappers) com as variantes de tema corretas.
- Nos dois views (`ScriptView` e `TableView`, que entram em `<main className="flex-1">`) o layout fica responsável por manter `h-[calc(100vh-4rem)]` (linhas 38 e 43 dos respectivos arquivos) para compensar o header. Esse `calc` é repetido em cada componente e não está conectado a um token central (`--header-height`). Devemos definir um layout principal que cuide desse offset apenas uma vez e deixar as views fazerem `height: 100%` dentro de um `main` com padding/token.

## 3. ScriptView (`components/script/script-view.tsx`)

- A divisão 70/30 entre script e painel (linhas 40 e 54) usa `flex-[7] ... p-8` e `flex-[3] ... p-6`, além de `border-r border-border` e `bg-card/30`. São muitas classes condicionais aplicadas diretamente no JSX (sem `cn`, sem referências a tokens como `surface-border`). Essa estrutura dificulta padronizar o espaço entre colunas e o visual de cartões; o ideal é ter utilitários específicos (ex: `.layout-two-columns`, `.panel-divider`).
- O card de conteúdo usa `Card className="p-8 bg-card/50"` (linha 47), enquanto as diretivas usam `Card className="p-4 cursor-pointer ... hover:border-primary/50 ..."` (linha 67). Novamente usamos medidas numéricas (p-8, p-4) e sombras personalizadas. Um sistema de tokens permitiria, por exemplo, `Card` com variantes `primary`/`secondary` que definem padding, background e comportamento hover.
- Os textos dentro das cenas usam `text-sm leading-relaxed` sem referência a uma família tipográfica ou escalas padronizadas. Precisamos definir tokens de tipografia (ex: `text-large-body`, `text-card-subtitle`) para evitar variações entre blocos de texto e manter o ritmo visual.

## 4. TableView (`components/table/table-view.tsx`)

- A tabela inteira vive dentro de `<div className="h-[calc(100vh-4rem)] overflow-auto p-6">` (linha 43) e o `<thead>` tem `bg-secondary/80 backdrop-blur` (linha 47). Assim como em `ScriptView`, a manipulação de altura e o layout de header são codificados em cada componente em vez de um wrapper comum.
- Cada célula de filtro usa classes fixas de largura/altura: os `<SelectTrigger className="w-32 h-8 text-sm">` do tipo de mídia (linhas 71-74) e de status (linhas 112-118), além do `<Input ... className="w-24 h-8 text-sm bg-secondary/50">` para timestamp (linha 102). Essa repetição faz com que ajustes de `spacing` ou `text-size` tenham de ser feitos linha a linha. A ideia da Fase 2 é extrair esses valores para tokens de tamanho/variant (ex: `.form-control-sm` ou `.grid-input`).
- O botão “Decupar” usa `className="h-8"` (linha 135) e a tabela em si não se beneficia de classes utilitárias compartilhadas para células, bordas e listras. Também falta uma camada de componentes (ex: `TableRow`, `TableCell`) para encapsular o padrão visual e aplicar `cn`/tokens automaticamente.

## Próximos passos sugeridos

1. Definir tokens globais de `spacing` (paddings, gaps, alturas de header) e aplicá-los nos containers principais (`app/page.tsx`, `MainInterface`, `ImportScreen`).
2. Criar variantes temáticas para `Card`, `Button`, `Input` e `Select` que cubram os casos acima e remover as classes inline que duplicam estilo.
3. Adotar um layout base com `main` e `header` compartilhados para que `ScriptView` e `TableView` não precisem controlar `calc(100vh - 4rem)` por conta própria.
