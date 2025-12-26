# 01-Visao-Geral.md

## 1. Nome do Projeto
**Decupador de Roteiro HI**

## 2. O Problema
No fluxo de produção de conteúdo de vídeo, roteiristas frequentemente utilizam os comentários do Google Docs para inserir diretrizes de edição (links de referência, imagens, trilhas sonoras, timestamps, etc.) em trechos específicos da narração. Este método, embora conveniente para a fase de escrita, gera um documento final que é ineficiente e propenso a erros para a equipe de edição.

As dores principais do editor são:
- **Falta de Estrutura:** As diretrizes são um bloco de texto livre, misturando links, notas e instruções sem um formato padrão, exigindo uma leitura cuidadosa e "tradução" manual.
- **Dificuldade de Visualização:** Não há uma visão geral e clara de todos os *assets* de mídia necessários para um projeto. O editor precisa caçar os links e instruções dentro de dezenas de comentários.
- **Processo Lento e Manual:** O editor precisa constantemente alternar entre a leitura do roteiro e a montagem da *timeline* no software de edição, um processo que quebra o fluxo de trabalho e consome tempo.
- **Alto Risco de Erro:** É fácil perder uma diretriz importante ou interpretar mal um comentário aninhado no meio de uma longa discussão, resultando em retrabalho.

## 3. A Solução Proposta
O **Decupador de Roteiro HI** é uma aplicação web local (MVP) projetada para servir como uma ponte entre o roteiro criativo e o plano de edição técnico. A ferramenta transforma um roteiro denso e contextual do Google Docs em um *workspace* interativo e estruturado, capacitando o editor a organizar, visualizar e executar o plano de edição com eficiência e precisão.

A aplicação irá:
1.  **Ingerir** um roteiro diretamente de um link público do Google Docs.
2.  **Analisar (Parse)** o documento automaticamente usando a API oficial do Google Docs, identificando com 100% de precisão os trechos de texto e os comentários associados.
3.  **Apresentar** a informação em múltiplas visões, incluindo uma "Visão Roteiro" para contexto e uma "Visão Tabela" para trabalho técnico.
4.  **Capacitar** o editor com uma ferramenta de **Decupagem Assistida**, permitindo-lhe catalogar de forma rápida e intuitiva o conteúdo dos comentários em colunas estruturadas (Links, Timestamps, Diretrizes, etc.).
5.  **Servir** como um "Painel de Controle da Edição", onde o progresso pode ser rastreado e todos os *assets* podem ser facilmente acessados.
6.  **Exportar** o plano técnico finalizado para um formato portátil (`.csv`), para documentação ou integração com outras ferramentas (ex: Notion, Planilhas).

## 4. Proposta de Valor Principal
O **Decupador de Roteiro HI** elimina o atrito entre roteirização e edição, convertendo caos em clareza. Ele economiza horas de trabalho do editor ao automatizar a organização inicial do projeto e fornece um plano de ação acionável que minimiza erros, otimiza a busca por *assets* e centraliza as informações cruciais para a produção do vídeo.