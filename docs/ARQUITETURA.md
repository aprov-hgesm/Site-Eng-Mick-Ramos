# Arquitetura do projeto

Este documento é um mapa rápido para manutenção do site da MR Engenharia.

## 1. Entrada principal

`app/page.tsx`

Responsável por coordenar a navegação principal e montar as áreas do site.

Fluxo geral:

- Header
- conteúdo da view ativa
- Footer
- modais globais
- `SiteProvider`

## 2. Camada visual

`components/`

Contém componentes reutilizáveis da interface.

Principais grupos:

- `Header.tsx` — navegação e acesso às áreas do site.
- `Footer.tsx` — rodapé e navegação complementar.
- `MRLogo.tsx` — identidade visual/logo.
- `QuoteModal.tsx` — solicitação de orçamento.
- `ProjectDetailModal.tsx` — detalhes de projeto.
- `ImageLightboxModal.tsx` — visualização ampliada de imagens.
- `AdminSecureGate.tsx` — entrada protegida da área administrativa.

### Views

`components/views/`

As páginas/áreas de conteúdo ficam separadas por responsabilidade, como início, sobre, serviços, projetos, blog e contato.

Regra de manutenção: alterações específicas de uma área devem, sempre que possível, permanecer dentro da view ou componente correspondente, evitando concentrar lógica no `app/page.tsx`.

## 3. Estado e dados do site

`lib/SiteContext.tsx`

Centraliza o estado compartilhado do conteúdo do site e a comunicação com o Firebase/Firestore.

Regra de manutenção:

- evitar duplicar lógica de leitura/escrita em componentes visuais;
- alterações de persistência devem ser concentradas nessa camada quando fizer sentido;
- mudanças que afetem cache/localStorage e Firestore devem ser testadas para evitar divergência entre estado local e dados persistidos.

## 4. Modelos e dados

`lib/siteData.ts`

Usado como referência para tipos e estruturas de dados do conteúdo.

Ao alterar a estrutura de projetos, serviços ou artigos, verificar os tipos e os consumidores correspondentes antes de publicar.

## 5. Firebase e segurança

Arquivos e áreas relacionadas:

- `core/firebase/client.ts`
- `config/client.config.ts`
- `firestore.rules`
- `components/AdminSecureGate.tsx`

Regra: mudanças de autenticação, autorização ou regras do Firestore exigem revisão específica de segurança e não devem ser tratadas como simples alterações visuais.

## 6. Configuração do projeto

`package.json`

Comandos principais:

```text
bun run dev       desenvolvimento local
bun run build     build de produção
bun run lint      análise de lint
bun run typecheck verificação TypeScript
```

## 7. Processo de manutenção

Antes de editar:

1. identificar a responsabilidade do arquivo;
2. procurar quem importa/usa o componente;
3. verificar tipos e dados relacionados;
4. evitar alterações globais quando uma alteração local resolver o problema;
5. testar no localhost;
6. executar verificações adequadas;
7. revisar o diff antes do commit.

## 8. Princípio de organização

Preferir componentes pequenos e com responsabilidade única.

Evitar:

- componentes gigantes;
- lógica de Firebase espalhada pela interface;
- duplicação de regras de negócio;
- valores críticos repetidos em vários arquivos;
- alterações simultâneas de visual, dados e segurança sem necessidade.

Quando uma área crescer demais, a primeira opção deve ser modularizá-la por responsabilidade, preservando o comportamento existente.

## 9. Documentação de decisões

Mudanças estruturais relevantes devem ser registradas em `MEMORIAL-DESENVOLVIMENTO.md`.

Este arquivo explica onde as coisas ficam; o memorial explica o que foi alterado, por quê, quais testes foram feitos e qual foi o resultado.