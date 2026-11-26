# MEMORIAL OFICIAL DE DESENVOLVIMENTO — MR ENGENHARIA

## PRISMA-01 — Diretriz de Engenharia e Governança Tecnológica

**Status:** vigente, aprovada pelo responsável em 26/11/2026. **Sucessora:** GOV-SIMP-01 (Governança Simplificada).

**PRISMA:** Princípios de Racionalização, Integridade, Simplificação, Manutenibilidade e Autonomia.

**Lema:** Simplificar a estrutura. Maximizar a capacidade. Preservar a integridade.

### Missão e abrangência

Orientar todos os projetos e sistemas, do planejamento à manutenção, com máxima capacidade funcional, segurança, confiabilidade e eficiência, usando o mínimo necessário de código, complexidade, recursos, custos, burocracia e intervenção humana. A PRISMA absorve integralmente os princípios vigentes da GOV-SIMP-01; as referências históricas permanecem válidas e não são reescritas.

### Princípios permanentes

1. **Eficiência funcional:** ampliar capacidades sem crescimento desproporcional do código, da arquitetura ou da complexidade operacional.
2. **Simplificação estrutural:** eliminar código comprovadamente morto, redundâncias, duplicidades, dependências dispensáveis e abstrações excessivas, preservando contratos e funcionalidades.
3. **Eficiência computacional e financeira:** evitar processamento, memória, armazenamento, tráfego, leituras/escritas, requisições, listeners e revalidações desnecessárias; reduzir custos recorrentes sem comprometer a operação.
4. **Desempenho e estabilidade:** priorizar soluções rápidas, previsíveis, escaláveis e resistentes a falhas; medir antes/depois quando o impacto for relevante, sem alegar ganhos não comprovados.
5. **Simplicidade operacional:** eliminar cliques, telas, preenchimentos, aprovações e intervenções sem valor real; oferecer feedback e diagnósticos claros.
6. **Autonomia e sustentabilidade:** reduzir manutenção humana recorrente com automação segura, recuperação controlada, padronização e código legível; preservar supervisão humana necessária.
7. **Integridade funcional:** nenhuma otimização pode comprometer segurança, privacidade, integridade dos dados, rastreabilidade, regras de negócio, funcionalidades legítimas ou continuidade operacional.
8. **Verificação proporcional ao risco:** aproveitar testes e evidências válidas existentes, corrigir falhas reais, não contornar proteções nem repetir certificações desnecessariamente.
9. **Evolução responsável:** simplificar quando houver benefício técnico demonstrável, com escopo controlado e prevenção de regressões; não remover código por metas artificiais de tamanho.
10. **Complexidade mínima necessária:** entre alternativas equivalentes, preferir a mais simples, segura, confiável, eficiente, econômica e manutenível.

### Aplicação

Ordem de prioridade em conflitos: segurança e integridade; preservação funcional e confiabilidade; simplicidade operacional; desempenho e eficiência; redução de custos; redução da complexidade do código. Avaliar, quando pertinente, volume de código, duplicidade, dependências, CPU/RAM, latência, operações de banco, custos, esforço do usuário, regressões e intervenções de manutenção. Indicadores são instrumentos de decisão, não metas artificiais nem novos gates.

A diretriz integra naturalmente o trabalho dos responsáveis, desenvolvedores e assistentes de IA. Não cria novas etapas administrativas, aprovações, relatórios obrigatórios, workflows, regras de proteção ou permissões. Preserva procedimentos específicos de segurança, testes, autorização, publicação, rollback e requisitos legais/clínicos/financeiros de cada projeto. Não autoriza deploy, alteração de dados, mudança de infraestrutura nem supressão de controles. Em repositórios documentais, aplica-se à organização, integridade, rastreabilidade e manutenção dos acervos.

A PRISMA é uma diretriz interna transversal, não uma norma externa. Adoção documental não comprova implementação técnica ou publicação.

**Aplicação específica:** Aplicar ao site institucional, preservando segurança, desempenho, acessibilidade, integridade do conteúdo e autorização de publicação.

---


> Documento de continuidade do projeto. Deve ser atualizado após intervenções relevantes no código, arquitetura, segurança, infraestrutura de desenvolvimento ou decisões importantes.

**Repositório:** `aprov-hgesm/Site-Eng-Mick-Ramos`  
**Branch principal:** `main`  
**Data de criação:** 30/09/2026

## 1. OBJETIVO

Preservar o contexto técnico do projeto entre conversas e organizar o processo de evolução do site sem depender do histórico de um único chat.

Fluxo adotado:

```text
GitHub → computador local → VS Code → localhost → testes/validação → GitHub → produção
```

Alterações não serão consideradas concluídas apenas por terem sido planejadas ou escritas: devem ser testadas e validadas.

## 2. AUDITORIA INICIAL DO REPOSITÓRIO

Foi realizada auditoria estática inicial antes das novas edições.

### Arquitetura observada

- Next.js / React / TypeScript.
- Bun como ferramenta de gerenciamento/execução do projeto.
- Firebase para autenticação e Firestore.
- Painel administrativo protegido por Firebase Authentication.
- Regras do Firestore com acesso administrativo e restrições para dados públicos.
- Formulários de contato e orçamento gravando solicitações no Firestore.
- EmailJS presente no fluxo de contato.
- Cabeçalhos de segurança configurados em `next.config.ts`.
- Workflows de CI/security e CodeQL presentes.

### Arquivos relevantes já analisados

- `components/AdminSecureGate.tsx`
- `lib/SiteContext.tsx`
- `firestore.rules`
- `.env.example`
- `package.json`
- `SECURITY-HARDENING.md`
- `core/firebase/client.ts`
- `config/client.config.ts`
- `app/page.tsx`
- `next.config.ts`
- `components/views/ContactView.tsx`
- `components/QuoteModal.tsx`
- `.github/workflows/security-ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/visual-regression.yml`
- `firebase-applet-config.json`

### Pontos técnicos registrados

1. A autenticação administrativa utiliza Firebase Authentication, persistência de sessão, verificação de e-mail, MFA/TOTP e validação de UID/claims.
2. As regras do Firestore aplicam controles administrativos e restrições específicas aos formulários públicos.
3. As regras existentes no repositório não comprovam, sozinhas, que a mesma versão está implantada no Firebase em produção; isso deve ser verificado antes de mudanças de segurança.
4. App Check está preparado no código para reCAPTCHA Enterprise, condicionado às variáveis de ambiente.
5. O contato grava em `contactMessages` e possui integração com EmailJS.
6. O orçamento grava em `quoteRequests`; o fluxo observado não realiza envio automático de e-mail da mesma forma que o contato.
7. `SiteContext` possui mecanismos de cache/localStorage que merecem revisão de consistência.
8. `resetToDefaultData` possui comportamento potencialmente destrutivo e deve ser tratado com cautela.
9. `AdminView.tsx` é muito grande e é candidato à modularização futura.
10. Há pipelines de segurança, typecheck, build, lint, auditoria de dependências e CodeQL; a existência dos workflows não comprova que a execução mais recente esteja passando.

## 3. ESTADO DO COMPUTADOR PARA DESENVOLVIMENTO LOCAL

### Situação em 30/09/2026

O computador do usuário foi declarado como **ambiente virgem para desenvolvimento**.

Ainda não foi confirmado que estejam instalados/configurados:

- Git — não confirmado
- Node.js — não confirmado
- npm — não confirmado
- Bun — não confirmado
- Visual Studio Code — não confirmado
- GitHub CLI — não confirmado
- cópia local do projeto — ainda não configurada
- dependências do projeto — ainda não instaladas
- variáveis de ambiente locais — ainda não configuradas
- servidor localhost — ainda não iniciado

O PowerShell/Terminal do Windows está disponível, mas sua versão ainda não foi registrada.

### Primeiro diagnóstico planejado

No PowerShell executar:

```powershell
$PSVersionTable.PSVersion
git --version
node --version
npm --version
bun --version
code --version
```

Depois instalar somente o que estiver ausente.

### Ordem planejada de preparação

1. Confirmar PowerShell/Windows Terminal.
2. Instalar Git.
3. Instalar Node.js LTS.
4. Instalar Bun.
5. Instalar Visual Studio Code.
6. Instalar GitHub CLI apenas se necessário ao fluxo escolhido.
7. Configurar Git.
8. Autenticar acesso ao GitHub.
9. Clonar `Site-Eng-Mick-Ramos`.
10. Instalar dependências com `bun install`.
11. Configurar variáveis locais sem publicar segredos.
12. Executar `bun run dev`.
13. Abrir `http://localhost:3000`.
14. Validar o ambiente antes das primeiras alterações de código.

**Nunca registrar neste memorial senhas, tokens privados, chaves privadas, credenciais administrativas ou outros segredos.**

## 4. FLUXO DE EDIÇÃO

### Regra de ouro

Primeiro editar e testar localmente. Depois versionar. Só então considerar publicação.

### Fluxo recomendado

```text
1. identificar objetivo
2. analisar arquivos afetados
3. criar/usar branch de desenvolvimento quando apropriado
4. editar
5. executar localhost
6. testar visualmente
7. testar funcionalidades
8. corrigir erros
9. revisar diff
10. commit
11. enviar ao GitHub
12. validar CI
13. publicar somente após aprovação
```

A `main` é a referência estável. Para mudanças relevantes, preferir branches específicas, por exemplo `dev/redesign-site`, `dev/melhoria-admin`, `dev/formulario-contato` ou `dev/seo`.

## 5. PADRÃO PARA REGISTRAR INTERVENÇÕES

Para cada intervenção relevante, registrar:

### [DATA] — [TÍTULO]

**Objetivo:** o que foi solicitado.  
**Arquivos alterados:** lista dos arquivos.  
**Alterações realizadas:** resumo técnico.  
**Comportamento antes:** como funcionava.  
**Comportamento depois:** como passou a funcionar.  
**Testes realizados:** localhost, build, typecheck, lint e/ou testes manuais.  
**Resultado:** aprovado / pendente / revertido.  
**Observações:** riscos, limitações e próximos passos.  
**Commit/PR:** SHA, branch ou PR quando disponível.

## 6. SEGURANÇA E CONTINUIDADE

- Não colocar segredos reais no código ou neste memorial.
- Não assumir que configuração local equivale à configuração de produção.
- Não apagar dados do Firebase sem confirmação explícita e avaliação do impacto.
- Não substituir arquivos grandes sem comparar a versão existente.
- Antes de mudanças estruturais, registrar objetivo e arquivos afetados.
- Após mudanças importantes, executar build/typecheck/lint quando aplicável.
- Mudanças visuais devem ser validadas no localhost antes do commit.
- Mudanças de autenticação, Firebase ou Firestore exigem revisão do fluxo de segurança antes da publicação.

## 7. ESTADO ATUAL DO PROJETO

**Fase:** preparação do ambiente local.  
**Última intervenção:** criação deste memorial de continuidade.  
**Próximo passo:** executar o diagnóstico do PowerShell registrado na seção 3 e instalar o ambiente necessário.

Nenhuma grande alteração de código deve começar antes da preparação e validação do ambiente local.

## 8. HISTÓRICO DE INTERVENÇÕES

### 30/09/2026 — Memorial inicial

- Criado o memorial oficial de continuidade do projeto.
- Registrada a auditoria técnica inicial do repositório.
- Registrado o estado atual do ambiente de desenvolvimento local.
- Definido o fluxo GitHub → localhost → validação → GitHub → produção.
- Definido o padrão para registrar futuras intervenções.
- Nenhum segredo ou credencial privada foi incluído.

## 9. REGRA DE CONTINUIDADE ENTRE CONVERSAS

Ao iniciar uma nova conversa para continuar este projeto:

1. Consultar este arquivo.
2. Consultar os arquivos de código relevantes para a tarefa.
3. Verificar branch e alterações atuais antes de editar.
4. Continuar o histórico na seção `Histórico de intervenções`.
5. Não assumir que uma tarefa foi concluída apenas porque foi planejada em conversa anterior.
6. Registrar no memorial as mudanças efetivamente realizadas no repositório.

Este memorial é uma fonte de contexto do projeto, mas não substitui a inspeção do código atual nem os testes do ambiente.
