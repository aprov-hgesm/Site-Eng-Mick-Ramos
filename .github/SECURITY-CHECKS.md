# Security checks

Mudanças de segurança devem manter os seguintes checks obrigatórios no fluxo de revisão:

- Security CI;
- CodeQL;
- Dependency Review em pull requests;
- revisão das atualizações criadas pelo Dependabot.

Ao habilitar branch protection/rulesets na `main`, configure esses checks como requisitos antes do merge.
