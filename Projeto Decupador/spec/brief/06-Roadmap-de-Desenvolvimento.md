# 06-Roadmap-de-Desenvolvimento.md

## 1. Visão Geral do Roadmap
Este roadmap adota uma abordagem iterativa, focando na entrega de um Produto Mínimo Viável (MVP) que resolve o problema central do usuário da forma mais rápida e eficiente possível. As fases subsequentes se concentram em aprimorar a experiência do usuário, adicionar funcionalidades de gerenciamento e escalar a aplicação para um público mais amplo.

---

## 2. Fase 1: MVP - A Ferramenta Essencial de Decupagem
*(Objetivo: Entregar o core value da aplicação a um único editor que trabalha em um projeto por vez.)*

### Módulos Principais:
- **[ ] Setup do Projeto:**
    - Configurar o ambiente de desenvolvimento (React/Next.js).
    - Integrar framework de UI (ex: Tailwind CSS).
- **[ ] Módulo de Importação:**
    - Construir a tela inicial com o campo para a URL.
    - Implementar a lógica de extração do `DOCUMENT_ID`.
    - Desenvolver o Backend Leve (API route/Serverless Function) para chamar a API do Google com a Chave de API secreta.
- **[ ] Módulo de Parsing e Estrutura de Dados:**
    - Implementar a lógica para processar o JSON da API do Google.
    - Definir e construir o modelo de dados interno ("Cenas" e "Assets").
- **[ ] Módulo de UI - Visão Tabela:**
    - Renderizar a tabela principal com base no modelo de dados.
    - Implementar as colunas `Trecho`, `Comentário Bruto`, `Status` (dropdown) e `Notas` (editável).
- **[ ] Módulo de Decupagem Assistida:**
    - Criar o modal/painel de decupagem.
    - Desenvolver a funcionalidade de seleção de texto e o menu de contexto.
    - Implementar a lógica para mover o texto decupado para as colunas estruturadas (`Link`, `Timestamp`, `Diretrizes`).
    - Lidar com múltiplos *assets* por trecho, gerando novas linhas na tabela.
- **[ ] Módulo de Persistência:**
    - Implementar a lógica para salvar/carregar o estado do projeto no `localStorage`.
- **[ ] Módulo de Exportação:**
    - Criar a funcionalidade para exportar o estado atual da tabela para um arquivo `.csv`.
- **[ ] Módulo de UI - Visão Roteiro:**
    - Construir a visualização de dois painéis (Roteiro e Cartões de Diretriz) como uma forma alternativa de navegar e iniciar a decupagem.

---

## 3. Fase 2: V1.1 - Melhorias de Usabilidade e Qualidade de Vida (QoL)
*(Objetivo: Refinar a experiência do editor e tornar a ferramenta mais agradável e eficiente.)*

- **[ ] Previews de Mídia:** Implementar previews interativos para links (iframes de vídeo, tooltips de imagem).
- **[ ] Arrastar e Soltar (Drag-and-Drop):** Permitir que o editor reordene as linhas/cenas na Visão Tabela.
- **[ ] Filtros e Busca na Tabela:** Adicionar a capacidade de filtrar a tabela por status (ex: mostrar apenas itens "Pendentes") ou buscar por palavras-chave nos trechos.
- **[ ] Validação de URL Melhorada:** Fornecer feedback instantâneo se a URL colada não for um link válido do Google Docs.
- **[ ] Onboarding Simplificado:** Criar um pequeno tutorial ou dicas na primeira visita para guiar o novo usuário.

---

## 4. Fase 3: V2.0 - Multi-Projeto e Colaboração
*(Objetivo: Transformar a ferramenta de um utilitário de uso único para uma plataforma de gerenciamento de projetos.)*

- **[ ] Backend Robusto com Banco de Dados:**
    - Integrar Supabase ou Firebase/Firestore.
    - Migrar a lógica de salvamento do `localStorage` para o banco de dados.
- **[ ] Autenticação de Usuário:**
    - Implementar um sistema de login (ex: Google Sign-In).
- **[ ] Dashboard de Projetos:**
    - Criar uma página inicial onde os usuários logados podem ver, criar e gerenciar múltiplos roteiros/projetos.
- **[ ] Integração Completa com a API (OAuth 2.0):**
    - Substituir o método de link público pela autenticação OAuth, permitindo que os usuários selecionem seus documentos privados de forma segura.
- **[ ] Compartilhamento e Colaboração (Básico):**
    - Permitir que o dono de um projeto convide outros usuários (ex: outros editores) para visualizar o painel decupado.

---

## 5. Fase 4: V3.0 - Ecossistema e Inteligência
*(Objetivo: Expandir a ferramenta para além da decupagem, integrando funcionalidades inteligentes.)*

- **[ ] Visão Kanban:** Implementar a visão de gerenciamento de projeto no estilo Kanban.
- **[ ] Sugestões de Mídia (IA):** Explorar a possibilidade de usar IA para analisar o texto do roteiro e sugerir mídias de bancos de imagens/vídeos (ex: Pexels, Unsplash).
- **[ ] Integrações com Softwares de Edição:** Pesquisar APIs (se disponíveis) para exportar a estrutura de edição para Adobe Premiere, Final Cut Pro ou DaVinci Resolve (ex: exportar como XML).
- **[ ] Análises de Roteiro:** Fornecer estatísticas simples, como tempo estimado de narração (baseado na contagem de palavras).