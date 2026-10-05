# Guia de manutenção e contribuição

## Objetivo

Manter o projeto previsível, fácil de entender e seguro para futuras alterações.

## Antes de alterar código

1. Leia `MEMORIAL-DESENVOLVIMENTO.md`.
2. Consulte `docs/ARQUITETURA.md`.
3. Identifique os arquivos realmente envolvidos.
4. Não reescreva componentes inteiros sem necessidade.
5. Para mudanças relevantes, trabalhe em uma branch de desenvolvimento.

## Durante a alteração

- Faça uma mudança de responsabilidade clara por vez.
- Preserve interfaces e comportamentos existentes quando não fizerem parte do objetivo.
- Não coloque credenciais ou segredos no código.
- Não altere regras do Firebase sem revisar o impacto de segurança.
- Prefira reutilizar componentes e funções existentes a duplicar lógica.

## Validação

Sempre que aplicável:

```text
bun run lint
bun run typecheck
bun run build
```

Também testar manualmente no localhost as áreas afetadas.

## Revisão antes do merge

Verificar:

- diff do código;
- arquivos alterados;
- comportamento visual;
- responsividade;
- console do navegador;
- formulários e integrações afetadas;
- possíveis impactos no Firebase;
- documentação/memorial.

## Regra de publicação

Uma alteração só deve ser considerada pronta para produção depois de validada localmente e revisada.

A `main` deve permanecer como referência estável.