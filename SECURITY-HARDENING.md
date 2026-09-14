# Security Hardening — 2026-09-14

Este documento registra as proteções adicionadas sem alterar o comportamento funcional do site.

## Aplicado no repositório

- Next.js atualizado para 15.5.24 e React/ReactDOM para 19.2.8.
- Dependências transitivas de alta severidade fixadas por versões corrigidas e lockfile atualizado.
- CSP e cabeçalhos HTTP defensivos adicionados, incluindo proteção contra framing, MIME sniffing e política de permissões.
- Identificação `X-Powered-By` desabilitada.
- Autorização administrativa alinhada ao UID Firebase, sem e-mail como fator de autorização.
- SVG enviado como logotipo é rasterizado antes de ser persistido, preservando a função de upload sem armazenar SVG ativo.
- Firestore mantém `deny by default`, restringe leitura pública de `siteConfig` a documentos explicitamente públicos e reforça validações dos formulários.
- Logs de erro do Firebase deixaram de incluir metadados de sessão/autenticação.
- Firebase App Check preparado no cliente por `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`, sem bloquear ambientes enquanto a chave não estiver configurada.
- `firebase.json` e `.firebaserc` adicionados para tornar explícito o projeto/banco das regras.
- Security CI, CodeQL, Dependency Review e Dependabot adicionados.
- `SECURITY.md` adicionado para política de reporte e gestão de segredos.

## Validação automática

O Security CI executa com lockfile congelado:

1. TypeScript (`tsc --noEmit`);
2. build de produção (`next build`);
3. auditoria de dependências de severidade alta (`bun audit --audit-level=high`);
4. ESLint.

A dívida de tipagem preexistente relacionada a `no-explicit-any` permanece visível como warning para evitar uma refatoração funcional não relacionada a esta correção de segurança.

## Controles que exigem configuração externa

As ações abaixo não devem ser simuladas pelo código nem ativadas sem acesso administrativo aos respectivos serviços:

1. Configurar uma chave reCAPTCHA Enterprise para `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` e, após validar o site em produção, habilitar enforcement do Firebase App Check para os serviços compatíveis.
2. Publicar `firestore.rules` no banco `ai-studio-mrengenhariamick-45c18445-8a64-4627-84c9-31b89158aebe`.
3. Habilitar MFA para a conta administrativa no Firebase Authentication e concluir o enrollment do administrador.
4. Aplicar restrição por domínio/origem e limites antiabuso no EmailJS, mantendo o formulário atual funcional.
5. Configurar Firewall/Bot Protection/rate limiting no projeto Vercel responsável por `site-eng-mick-ramos.vercel.app`.
6. Proteger a branch `main` com ruleset/branch protection exigindo os checks de CI e revisão antes do merge.

## Observação

O Firebase Web API Key e a chave pública do App Check não são segredos de servidor. A segurança do Firebase depende principalmente de Security Rules, Authentication, App Check e restrições de uso adequadamente configuradas.
