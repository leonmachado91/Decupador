# 02-Funcionalidades-Detalhadas.md

## 1. Importação via Link Público do Google Docs

### 1.1. Descrição
A porta de entrada da aplicação. Em vez de depender de uploads de arquivos (`.html`, `.docx`) que perdem metadados cruciais, a ferramenta utiliza a API oficial do Google Docs para uma leitura precisa dos dados.

### 1.2. Fluxo de Trabalho do Usuário
1.  O usuário acessa a página inicial da aplicação.
2.  Ele encontra um único campo de texto com a instrução: "Cole o link compartilhável do seu Google Doc".
3.  O usuário abre seu roteiro no Google Docs, clica em "Compartilhar", define a permissão para "Qualquer pessoa com o link pode visualizar" e copia o link.
4.  Ele cola a URL no campo da aplicação e clica no botão "Importar Roteiro".

### 1.3. Lógica do Sistema
- O sistema valida a URL para garantir que é um link válido do Google Docs.
- Extrai o `DOCUMENT_ID` da URL.
- Envia o `DOCUMENT_ID` para o backend leve, que executa uma chamada para a API do Google Docs.
- A aplicação recebe a estrutura JSON do documento e prossegue para a fase de renderização inicial.
- Em caso de falha (ex: documento não é público), uma mensagem de erro clara é exibida ao usuário.

## 2. Visões de Interface (Views)

A aplicação oferecerá duas visões principais para o MVP, permitindo que o editor alterne entre elas para se adequar à tarefa atual.

### 2.1. Visão Roteiro (View Padrão)
- **Propósito:** Oferecer contexto, leitura fluida e a experiência familiar do documento original.
- **Layout:**
    - **Painel Esquerdo (Principal):** Exibe o conteúdo completo do roteiro, mantendo a formatação básica (parágrafos, negrito, etc.).
    - **Painel Direito (Comentários):** Exibe uma lista de "cartões de diretriz", cada um correspondendo a um comentário do documento original. Estes cartões são alinhados verticalmente com o trecho de texto a que se referem.
- **Interação:** Clicar em um cartão de diretriz inicia o processo de "Decupagem Assistida".

### 2.2. Visão Tabela (View Técnica)
- **Propósito:** Organização, execução de tarefas e acompanhamento do progresso.
- **Layout:** Uma estrutura de tabela densa com as seguintes colunas:
    - `ID`: Identificador único da "cena" ou trecho.
    - `Trecho Narrado`: O texto exato associado a um comentário.
    - `Tipo de Mídia`: (Vídeo, Imagem, Áudio, Outro).
    - `Link / Asset`: O URL do recurso, com um ícone para preview no hover.
    - `Timestamp`: O momento específico referenciado em mídias de vídeo/áudio.
    - `Diretrizes`: Notas de texto e instruções de edição.
    - `Status`: Dropdown com opções (`Pendente`, `Concluído`, `Problema`).
    - `Notas do Editor`: Campo de texto livre para anotações do editor.
- **Comportamento:** Conforme detalhado na Seção 4 (Manejo de Comentários Multi-Conteúdo), um trecho com múltiplos *assets* será representado por múltiplas linhas na tabela.

## 3. Decupagem Assistida (Core da Aplicação)

### 3.1. Descrição
A ferramenta interativa que permite ao editor traduzir os comentários em bruto para dados estruturados na tabela.

### 3.2. Fluxo de Trabalho (em ambas as Views)
1.  O editor inicia a decupagem (clicando em um cartão na Visão Roteiro ou em um botão na Visão Tabela).
2.  Um modal ou painel exibe o texto completo do "Comentário Bruto".
3.  O editor **seleciona com o mouse** uma parte do texto (ex: um link do YouTube).
4.  Um menu de contexto aparece junto à seleção, oferecendo opções como: `[Marcar como Link]`, `[Marcar como Timestamp]`, `[Marcar como Diretriz]`.
5.  Ao escolher uma categoria (ex: `[Marcar como Link]`), o sistema move o texto selecionado para a coluna correspondente ("Link / Asset") na tabela.
6.  Opcionalmente, o sistema pode pedir uma sub-classificação (Vídeo, Imagem).
7.  O texto já catalogado no modal de decupagem muda de cor ou é riscado, fornecendo feedback visual claro do progresso.
8.  **Fluxo alternativo (Visão Tabela):** O editor pode clicar em um botão específico na célula de uma coluna (ex: `+` na coluna "Timestamp" da Cena 5) para abrir o comentário bruto e selecionar apenas a informação referente àquela coluna.

## 4. Manejo de Comentários Multi-Conteúdo

- **Descrição:** O sistema é projetado para lidar com o caso comum de um único comentário contendo múltiplas diretrizes (ex: dois vídeos e uma nota de texto).
- **Implementação:** Após a decupagem, o sistema irá gerar múltiplas linhas na "Visão Tabela", todas vinculadas ao mesmo "Trecho Narrado". Isso garante que cada *asset* ou instrução se torne um item de tarefa distinto e rastreável.

## 5. Exportação para CSV

- **Descrição:** Permite que o editor exporte o plano técnico finalizado para uso externo.
- **Funcionalidade:** Um botão "Exportar para .CSV" estará sempre disponível. Ao ser clicado, a aplicação gera e inicia o download de um arquivo CSV que reflete o estado atual da "Visão Tabela", com todas as colunas e dados devidamente formatados.