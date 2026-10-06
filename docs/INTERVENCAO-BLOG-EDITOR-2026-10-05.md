# Intervenção — Editor completo de artigos do Blog

**Data:** 05/10/2026
**Branch:** `dev/melhorias-manutencao`

## Objetivo
Permitir que o proprietário do site escreva e publique artigos completos sem editar código, mantendo o acesso restrito ao administrador autenticado.

## O que foi implementado

- Nova página administrativa dedicada em `/admin/blog`.
- Autenticação vinculada ao `ADMIN_UID` já utilizado pelo painel administrativo.
- Suporte ao segundo fator TOTP/MFA já usado pelo painel seguro.
- Editor com título, categoria, autor, tempo de leitura, imagem de capa e resumo.
- Campo de introdução com suporte a múltiplos parágrafos.
- Lista dinâmica de tópicos: adicionar, excluir e reordenar.
- Cada tópico aceita texto longo e múltiplos parágrafos separados por linha em branco.
- Caixa opcional de atenção técnica.
- Campo de conclusão.
- Pré-visualização do artigo enquanto o conteúdo é escrito.
- Edição e exclusão dos artigos existentes.
- Publicação usando a estrutura `BlogPost` e o Firestore já existentes; não foi criado um segundo banco de artigos.
- A página pública de leitura foi ajustada para respeitar os parágrafos escritos no editor.

## Segurança
O editor não fica aberto para visitantes. O acesso exige o usuário administrativo configurado no projeto e, quando habilitado, a confirmação TOTP/MFA. Nenhuma senha, chave TOTP ou credencial foi adicionada ao código/documentação.

## Limitação conhecida
A implementação foi feita na branch de desenvolvimento e ainda não foi validada em navegador/localhost nesta etapa. Também não foi publicada na `main` nem considerada pronta para produção até a validação local.

## Próximo passo
Rodar o projeto localmente, abrir `/admin/blog`, testar criação/edição/publicação e conferir a leitura do artigo no celular e desktop antes de levar a alteração para `main`.
