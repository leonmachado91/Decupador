# Proposta: Encurtamento de Links na Exibição

## 1. Visão Geral

O objetivo desta proposta é melhorar a legibilidade da interface, especificamente nos campos que exibem comentários e podem conter URLs longas. Em vez de mostrar a URL completa, exibiremos uma versão abreviada que mantém as partes mais identificáveis do link (o domínio e o nome do arquivo).

**Exemplo:**
-   **URL Atual:** `https://upload.wikimedia.org/wikipedia/commons/f/fe/Engenho_de_acucar_1816.jpg`
-   **Exibição Proposta:** `wikimedia.org...Engenho_de_acucar_1816.jpg`

## 2. Implementação Técnica

A lógica será centralizada em um novo utilitário e integrada à função que já transforma texto em links, garantindo que a mudança seja aplicada em toda a aplicação de forma consistente.

### 2.1. Lógica de Encurtamento de URL

Para manter o código organizado, a lógica de encurtamento será criada em um arquivo separado.

-   **Novo Arquivo:** `lib/urlUtils.ts`
-   **Nova Função:** `shortenUrl(url: string): string`
-   **Funcionamento:**
    1.  A função receberá uma URL completa.
    2.  Ela usará a API nativa de URL do navegador para extrair o **domínio** (`hostname`) e o **caminho** (`pathname`).
    3.  O domínio terá o prefixo `www.` removido, se existir.
    4.  A parte final do caminho (geralmente o nome do arquivo) será extraída.
    5.  A função retornará uma nova string combinando `dominio...final-do-caminho`.
    6.  Casos onde a URL não tem um caminho ou arquivo serão tratados para evitar erros.

### 2.2. Integração com a Interface

A nova função será usada dentro do nosso utilitário `linkify`, que já é responsável por encontrar e formatar links.

-   **Arquivo a ser Modificado:** `lib/linkUtils.tsx`
-   **Abordagem:**
    1.  A função `linkify` será ajustada para importar e usar a nova função `shortenUrl`.
    2.  Ao encontrar uma URL no texto, a `linkify` continuará criando uma tag `<a>` com o atributo `href` contendo a **URL completa** (para que o clique funcione corretamente).
    3.  No entanto, o **texto visível** do link será a versão curta gerada pela `shortenUrl`.
-   **Benefício:** Como os componentes `TableView` e `ScriptView` já usam `linkify`, a mudança será refletida automaticamente em ambos os lugares, garantindo consistência sem precisar alterar os componentes diretamente.
