# Security Hardening — 2026-09-14/15

Este documento registra as proteções aplicadas e os controles externos ainda pendentes no site MR Engenharia.

## Aplicado no repositório

- Next.js atualizado para 15.5.24 e React/ReactDOM para 19.2.8.
- Dependências transitivas de alta severidade corrigidas e lockfile mantido congelado no CI.
- CSP e cabeçalhos HTTP defensivos adicionados, incluindo proteção contra framing, MIME sniffing e política de permissões.
- Identificação `X-Powered-By` desabilitada.
- Uploads administrativos limitados a JPEG/PNG/WebP, com rasterização/re-encode das imagens e bloqueio de SVG ativo.
- Firestore mantém `deny by default`, restringe leitura pública de `siteConfig` a documentos explicitamente públicos e valida rigidamente os campos dos formulários.
- Regras do Firestore no repositório passam a exigir UID administrativo, e-mail verificado e claim de segundo fator TOTP para operações administrativas. Esta versão das regras só passa a valer em produção depois de novo deploy das regras.
- Painel administrativo valida não apenas a matrícula TOTP, mas também a claim `firebase.sign_in_second_factor` da sessão antes de renderizar o `AdminView`.
- Firebase App Check com reCAPTCHA Enterprise configurado no cliente e com renovação automática de token.
- A sondagem artificial `test/connection` foi removida para não gerar requisições Firestore desnecessárias nem ruído nas métricas do App Check.
- `firebase.json` e `.firebaserc` identificam explicitamente o projeto/banco das regras.
- Security CI, CodeQL e Dependabot ativos.
- GitHub Actions relevantes fixadas por SHA imutável, checkout sem persistência de credenciais e versão do Bun fixada.
- CodeQL migrado para v4 e configurado com consultas `security-extended`.
- `SECURITY.md` mantém a política de reporte e gestão de segredos.

## Confirmado em produção

- MFA/TOTP do administrador habilitado e testado.
- App Check/reCAPTCHA Enterprise emitindo tokens válidos (requisições do App Check HTTP 200).
- Métricas do Firebase registrando solicitações verificadas.
- Enforcement do App Check ativado para Cloud Firestore.
- Regras Firestore anteriores ao reforço por claim TOTP foram publicadas e estavam funcionais.

## Validação automática

O Security CI executa com lockfile congelado:

1. TypeScript (`tsc --noEmit`);
2. build de produção (`next build`);
3. auditoria de dependências de severidade alta (`bun audit --audit-level=high`);
4. ESLint.

CodeQL executa análise JavaScript/TypeScript com o conjunto `security-extended`. Dependabot monitora dependências Bun e GitHub Actions semanalmente.

A dívida de tipagem preexistente relacionada a `no-explicit-any` permanece visível como warning para evitar uma refatoração funcional ampla não relacionada a esta etapa de segurança.

## Controles externos ainda pendentes

1. Publicar `firestore.rules` no banco isolado `mr-engenharia` do projeto `mr-engenharia`, validar o novo administrador e concluir a matrícula TOTP antes do cutover.
2. Avaliar e, após confirmar todos os frontends legítimos que usam o projeto Firebase, habilitar enforcement do App Check para Firebase Authentication.
3. Revisar os Authorized Domains do Firebase Authentication e remover apenas domínios comprovadamente obsoletos.
4. Aplicar restrição por domínio/origem, quotas e controles antiabuso no EmailJS.
5. Configurar Firewall/Bot Protection/rate limiting no projeto Vercel responsável por `site-eng-mick-ramos.vercel.app`.
6. Tornar o repositório privado se não houver necessidade de código aberto e proteger a branch `main` com ruleset/branch protection exigindo os checks de CI antes do merge.
7. Habilitar/confirmar Dependency Graph e recursos de secret scanning do GitHub quando disponíveis no plano/repositório.

## Observação

Firebase Web API Key, OAuth Client ID web e chave pública do reCAPTCHA/App Check não são segredos de servidor. A segurança do Firebase depende de Security Rules, Authentication, MFA, App Check e restrições de uso adequadamente configuradas. Credenciais privadas, chaves de serviço, tokens de acesso e segredos de backend nunca devem ser incorporados ao bundle do navegador ou versionados no repositório.


## Migração para Firebase isolado — 2026-09-21

- Projeto de destino: `mr-engenharia`.
- Banco de destino: `mr-engenharia` (Firestore Standard / Native).
- O site deixa de usar o banco legado `ai-studio-mrengenhariamick-45c18445-8a64-4627-84c9-31b89158aebe`.
- Leituras públicas em tempo real foram substituídas por carregamento único; o conteúdo padrão embarcado no código permanece como fallback quando o banco está vazio.
- App Check fica explicitamente desabilitado durante o cutover e só deve ser reativado depois de uma nova chave ser registrada no projeto de destino e suas métricas serem validadas.
- O administrador do novo projeto usa UID `5vhxe0pmozbkIXuWfFIekTzWcYV2`; as regras continuam exigindo e-mail verificado e sessão TOTP.
