# 03-Arquitetura-e-Tecnologia.md

## 1. Modelo de Arquitetura: "Caminho A-Simplificado"

A arquitetura escolhida para o MVP busca o equilíbrio ideal entre precisão de dados e simplicidade de implementação. Ela evita a complexidade do protocolo OAuth 2.0 (autenticação de usuário) ao mesmo tempo que utiliza o poder da API oficial do Google Docs para a extração de dados, contornando a imprecisão de métodos baseados em exportação de arquivos.

A arquitetura se baseia no princípio de que a aplicação lê dados de um recurso público (um Google Doc compartilhado) usando uma chave de acesso privada (a Chave de API do desenvolvedor).

## 2. Componentes da Arquitetura

O sistema será composto por dois componentes principais:

### 2.1. Frontend (Aplicação do Cliente)
- **Responsabilidades:**
    - Renderizar toda a interface do usuário (UI), incluindo as diferentes visões (Roteiro e Tabela).
    - Gerenciar o estado da aplicação (os dados do roteiro processado, o status das tarefas, as notas do editor).
    - Lidar com todas as interações do usuário, como a seleção de texto para decupagem e a troca entre as visões.
    - Fazer a chamada inicial para o Backend Leve, enviando o `DOCUMENT_ID` extraído da URL.
    - Salvar o estado da sessão atual no `localStorage` do navegador para preservar o trabalho do usuário entre recarregamentos da página.
- **Natureza:** Single-Page Application (SPA).

### 2.2. Backend Leve (Proxy de API)
- **Responsabilidades:**
    - Servir como um proxy seguro para a API do Google Docs. Sua única função é receber o `DOCUMENT_ID` do frontend, anexar a **Chave de API** (que é secreta e não deve ser exposta no cliente) à requisição e encaminhar a chamada para o Google.
    - Receber a resposta JSON da API do Google e repassá-la diretamente para o frontend.
    - Gerenciar o segredo (Chave de API) de forma segura através de variáveis de ambiente.
- **Natureza:** Um microserviço simples com um único endpoint. Poderia ser implementado como uma Serverless Function (ex: Vercel Functions, Netlify Functions, Google Cloud Functions) para custo-eficiência e escalabilidade.

## 3. Pilha de Tecnologia (Stack) Sugerida

A escolha da tecnologia deve priorizar a velocidade de desenvolvimento e o ecossistema moderno do JavaScript.

- **Frontend:**
    - **Framework:** **React.js** ou **Vue.js**. Svelte seria uma alternativa mais leve. A recomendação pende para **React** (com Next.js) devido à vasta quantidade de bibliotecas e ao suporte da comunidade.
    - **Estilização:** Tailwind CSS para prototipagem rápida e design utilitário, ou um framework de componentes como Chakra UI ou Mantine para ter componentes prontos para uso.
    - **Gerenciamento de Estado:** Para o MVP, o `useState` e `useContext` do React pode ser suficiente. Para maior escalabilidade, bibliotecas como Zustand ou Jotai são recomendadas por sua simplicidade.

- **Backend Leve:**
    - **Ambiente:** **Node.js**. É a escolha natural para um ecossistema JavaScript.
    - **Framework:** **Express.js** é o padrão de mercado, mas para um único endpoint, pode-se usar o sistema de API routes nativo de frameworks como **Next.js** ou **SvelteKit**, o que unificaria o frontend e o backend em um único projeto (monorepo). Esta é a **recomendação principal** para simplificar o deploy.
    - **Deploy:** Vercel ou Netlify, que oferecem um plano gratuito generoso e integram perfeitamente com a abordagem de Serverless Functions (API routes) de frameworks como Next.js.

- **Armazenamento de Dados (MVP):**
    - **`localStorage` do Navegador:** Suficiente para o MVP, permitindo que um editor trabalhe em um roteiro, feche a aba e continue de onde parou mais tarde no mesmo computador. Os dados da decupagem e o estado da UI (status, notas) serão armazenados aqui.

## 4. Evolução Futura da Arquitetura (Pós-MVP)
- **Banco de Dados:** Para salvar e gerenciar múltiplos projetos, a arquitetura pode ser estendida para incluir um banco de dados. **Supabase** (PostgreSQL com APIs prontas) ou **Firebase/Firestore** (NoSQL) são excelentes opções "Backend-as-a-Service" que minimizam a complexidade de desenvolvimento.
- **Autenticação:** O sistema de Chave de API pode ser substituído pela implementação completa do OAuth 2.0 para permitir que os usuários acessem seus documentos privados com segurança, transformando a ferramenta em uma solução multiusuário completa.