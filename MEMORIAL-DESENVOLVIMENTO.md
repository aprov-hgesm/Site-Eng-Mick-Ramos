# MEMORIAL OFICIAL DE DESENVOLVIMENTO — MR ENGENHARIA

> Documento de continuidade do projeto. Deve ser atualizado após intervenções relevantes no código, arquitetura, segurança, infraestrutura de desenvolvimento ou decisões importantes.

**Repositório:** `aprov-hgesm/Site-Eng-Mick-Ramos`  
**Branch principal:** `main`  
**Branch de desenvolvimento atual:** `dev/melhorias-manutencao`  
**Data de criação:** 30/09/2026

## REGISTRO DE CONTINUIDADE — 28/10/2026

### Estado confirmado do trabalho

- O desenvolvimento continua concentrado na branch `dev/melhorias-manutencao`.
- A branch `main` permanece protegida por decisão do usuário: nenhuma mesclagem/publicação deve ocorrer sem autorização e validação explícitas.
- O ambiente local está configurado no Windows e o projeto é executado com Bun/Next.js.
- O usuário sincronizou localmente a branch de desenvolvimento com `git pull origin dev/melhorias-manutencao`, recebendo o commit `70588b6a3f30855b5555be359fad2285b2a2e8cf`.
- O servidor local foi iniciado com `bun run dev` e confirmou `Next.js 15.5.24`, `Local: http://localhost:3000` e `Ready in 6.9s`.

### Navegação / execução local

- Foi identificado anteriormente que os botões do site deixaram de responder durante o desenvolvimento local.
- A causa confirmada foi a ausência de `'unsafe-eval'` na Content Security Policy durante desenvolvimento, impedindo a execução necessária do runtime de React Refresh.
- Foi aplicada correção condicional em `next.config.ts`: `'unsafe-eval'` somente no ambiente de desenvolvimento.
- Commit da correção: `0abab469ba41211fcd79e93838cd889ceb6a2414`.
- O `favicon.ico` 404 observado anteriormente foi considerado independente do problema dos botões.

### Logo do cabeçalho

Foram realizadas alterações na branch de desenvolvimento para melhorar a gestão da logo do cabeçalho:

- `components/Header.tsx` passou a usar `siteInfo.headerLogoUrl || '/mr-logo.svg'`.
- O clique da logo continua dentro do botão existente de retorno à página inicial.
- `components/views/AdminView.tsx` passou a processar uploads da logo com limite de 1200x900 e qualidade 0.96, convertendo imagens raster para WebP.
- O painel Admin possui fluxo para upload e restauração da logo padrão; a estrutura também permite informar URL de imagem onde aplicável.
- O logo padrão utilizado pelo código é o vetor existente `public/mr-logo.svg`. O arquivo é a referência padrão atual do projeto; não registrar como se fosse necessariamente a mesma imagem raster enviada pelo usuário em conversa anterior.
- Commit do ajuste do Header: `1262390d02e5cd605de9e83e87d1852d5fd920a2`.
- Commit do ajuste do AdminView: `2d692d254d3000f27e29a1cddaf44aa4d05ad980`.
- Registro correspondente anterior do memorial: `70588b6a3f30855b5555be359fad2285b2a2e8cf`.
- O usuário fez `git pull` localmente após esses commits.

### Editor de artigos do Blog — melhoria solicitada

Situação atual do formulário de publicação/edição de artigos:

- A janela `Publicar Novo Artigo` / `Editar Artigo` em `components/views/AdminView.tsx` atualmente possui campos para `Tópico Técnico 1` e `Tópico Técnico 2`.
- O modelo de dados `BlogPost.content.points[]` em `lib/siteData.ts` já é um array de tópicos, portanto a estrutura de dados não está limitada conceitualmente a dois tópicos.
- Solicitação atual do usuário: permitir adicionar opcionalmente um **Tópico Técnico 3** durante a elaboração do artigo.
- Comportamento desejado: manter os dois tópicos existentes, adicionar um botão `+ Adicionar outro tópico`, mostrar o Tópico 3 somente quando solicitado, permitir título/texto, manter o terceiro tópico opcional e preservar artigos antigos.
- Também deve ser possível editar um artigo que já possua um terceiro tópico sem perder seu conteúdo.
- Esta melhoria foi **solicitada e especificada, mas ainda não foi implementada neste registro**. Não considerar concluída até existir commit e validação local.

### Fluxo de trabalho acordado

- Primeiro editar/testar na branch de desenvolvimento.
- Usuário valida no localhost.
- Só depois considerar merge/publicação.
- Não fazer merge para `main` sem autorização explícita do usuário.
- Alterações relevantes devem ser registradas neste memorial com objetivo, arquivos, comportamento antes/depois, testes, resultado e commit.
- Evitar diagnósticos excessivamente longos ou pedidos repetidos de screenshots; priorizar inspeção direta do código e o menor número de passos necessários.

## HISTÓRICO ANTERIOR

Os registros anteriores deste memorial permanecem preservados abaixo desta seção no histórico existente do projeto.

## 8. HISTÓRICO DE INTERVENÇÕES

### 30/09/2026 — Memorial inicial

- Criado o memorial oficial de continuidade do projeto.
- Registrada a auditoria técnica inicial do repositório.
- Registrado o estado atual do ambiente de desenvolvimento local.
- Definido o fluxo GitHub → localhost → validação → GitHub → produção.
- Definido o padrão para registrar futuras intervenções.
- Nenhum segredo ou credencial privada foi incluído.

### 05/10/2026 — Organização do portfólio visual de projetos

- Reaproveitada a área existente de `ProjectsView` em vez de criar uma segunda página independente de galeria.
- Transformada a apresentação em um **Portfólio de Projetos / Galeria de Projetos** mais evidente para o cliente.
- Mantidos os filtros por categoria existentes.
- A grade passou a priorizar visualização das imagens, com três colunas em telas grandes.
- Cards passaram a indicar quando um projeto possui múltiplas fotos.
- Adicionado acesso visual de “Ver galeria” diretamente sobre a imagem.
- Mantido o lightbox existente para visualização em tela cheia.
- Mantido o modal de detalhes existente, incluindo galeria de miniaturas e informações técnicas.
- Incluído carregamento `lazy` das imagens da grade.
- Nenhuma alteração no modelo de dados foi necessária; o campo opcional `Project.images[]` continua sendo a fonte das imagens adicionais.
- Alteração registrada no commit `f84683f5ffa2a3e1dac11b7f537ad2ca8f8e77b5` na branch `dev/melhorias-manutencao`.
- A alteração ainda não foi validada em localhost neste ambiente.

## 9. REGRA DE CONTINUIDADE ENTRE CONVERSAS

Ao iniciar uma nova conversa para continuar este projeto:

1. Consultar este arquivo.
2. Consultar os arquivos de código relevantes para a tarefa.
3. Verificar branch e alterações atuais antes de editar.
4. Continuar o histórico na seção `Histórico de intervenções`.
5. Não assumir que uma tarefa foi concluída apenas porque foi planejada em conversa anterior.
6. Registrar no memorial as mudanças efetivamente realizadas no repositório.

Este memorial é uma fonte de contexto do projeto, mas não substitui a inspeção do código atual nem os testes do ambiente.
