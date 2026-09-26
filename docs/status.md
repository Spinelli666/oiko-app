# Status do projeto

Checklist detalhado do que já foi implementado, versão por versão. Para o planejamento original (motivação, escopo de cada versão), veja [planning.md](./planning.md).

## V1

Passos 1 e 2 do roadmap concluídos; Passo 4 (telas da V1) com todas as telas essenciais no ar.

- [x] Projeto Next.js criado (App Router, TypeScript, Tailwind CSS, ESLint)
- [x] Prisma com schema definido ([prisma/schema.prisma](../prisma/schema.prisma)): models `User`, `Category`, `Transaction`, `Budget`, todas isoladas por `userId`
- [x] Banco Postgres rodando localmente via Docker ([docker-compose.yml](../docker-compose.yml)) — Neon ainda não configurado, mas a troca é só mudar a `DATABASE_URL` (ver [Stack](../README.md#stack))
- [x] Migration inicial aplicada (`prisma/migrations/`) e client do Prisma gerado (`src/generated/prisma`, via driver adapter `@prisma/adapter-pg` — obrigatório no Prisma 7)
- [x] Autenticação por e-mail/senha com [NextAuth (Auth.js v5)](https://authjs.dev): registro (hash de senha com bcrypt) e login via Credentials provider com sessão JWT ([src/auth.ts](../src/auth.ts))
- [x] Telas: landing ([/](../src/app/page.tsx)), [login](../src/app/login/page.tsx), [cadastro](../src/app/register/page.tsx), [dashboard](../src/app/dashboard/page.tsx) (saldo do mês, gráfico de evolução e receitas/despesas por categoria lado a lado, comparação com orçamento), [categorias](../src/app/dashboard/categories/page.tsx), [transações](../src/app/dashboard/transactions/page.tsx) e [orçamento mensal](../src/app/dashboard/budget/page.tsx) — todas isoladas por usuário; transações abre como modal a partir do dashboard (Parallel/Intercepting Routes), categorias e orçamento sempre como página cheia; categorias e orçamento têm barra de pesquisa por nome
- [x] Categoria já define se é Receita ou Despesa (`Category.kind`) — o sinal do valor da transação é derivado da categoria escolhida, não perguntado de novo na hora de lançar
- [x] Orçamento mensal por categoria de despesa, com barra de progresso e alerta visual quando o gasto ultrapassa o limite
- [x] Proteção de rota: [src/proxy.ts](../src/proxy.ts) redireciona `/dashboard` para `/login` quando não há sessão (arquivo `proxy.ts`, não `middleware.ts` — renomeado no Next.js 16)
- [x] Identidade visual: logo e favicon ([src/components/oiko-logo.tsx](../src/components/oiko-logo.tsx), [src/app/icon.svg](../src/app/icon.svg)), paleta de cores aplicada em [globals.css](../src/app/globals.css)
- [x] Navegação entre meses na tela de transações (`?mes=YYYY-MM`) — dashboard e orçamento continuam sempre no mês atual
- [x] Categorias padrão pré-criadas no cadastro ([src/lib/categories.ts](../src/lib/categories.ts): `DEFAULT_CATEGORIES`) — onze categorias comuns (Moradia, Alimentação, Transporte, Saúde, Educação, Assinaturas, Lazer, Compras, Outras Despesas, Salário, Outras receitas), pra não começar do zero; marcadas como padrão (`Category.isDefault`) e não podem ser excluídas
- [x] Subcategorias: cada categoria de nível principal pode ter subcategorias (`Category.parentId`), que herdam a receita/despesa da categoria pai; tela de [categorias](../src/app/dashboard/categories/page.tsx) mostra receitas e despesas em seções separadas, cada uma com suas subcategorias aninhadas
- [x] Exclusão de categoria/subcategoria com transações: se houver transações lançadas nela, o usuário escolhe para qual outra categoria (do mesmo tipo receita/despesa) elas devem ser movidas antes da exclusão; categorias com subcategorias não podem ser excluídas até as subcategorias serem removidas ou movidas
- [x] Filtro por categoria no histórico de transações ([transactions-list.tsx](../src/app/dashboard/transactions/transactions-list.tsx))
- [x] Testes automatizados com [Vitest](https://vitest.dev) ([vitest.config.ts](../vitest.config.ts)): cálculo de orçamento ([budget-status.test.ts](../src/lib/budget-status.test.ts)), soma de despesas por categoria e parsing de mês ([transactions.test.ts](../src/lib/transactions.test.ts)) e, principalmente, isolamento entre usuários ([isolation.test.ts](../src/lib/isolation.test.ts)) — roda contra o banco local de verdade, criando e limpando usuários de teste a cada execução
- [ ] Testar com um mês real de dados (critério de "V1 pronta", segundo o planejamento) — em andamento
- [ ] Deploy em produção (Vercel + Neon) — adiado por enquanto

## V2 (em andamento)

- [x] Gráficos de evolução: no [dashboard](../src/app/dashboard/page.tsx), acima de "Receitas/Despesas por categoria" — receitas, despesas e saldo (barras + linha, [recharts](https://recharts.org)), com filtro de granularidade **Diário / Semanal / Mensal / Anual** e um período **De/Até** customizável ([evolution-section.tsx](../src/app/dashboard/evolution-section.tsx)); agregação por dia/semana/mês/ano em [evolution.ts](../src/lib/evolution.ts) (testada em [evolution.test.ts](../src/lib/evolution.test.ts)) — tudo filtrado no navegador, sem recarregar a página
- [x] Alertas de orçamento: banner no [dashboard](../src/app/dashboard/page.tsx) ([budget-alert-banner.tsx](../src/app/dashboard/budget-alert-banner.tsx)) listando categorias de despesa que atingiram 90% do limite mensal (aviso) ou o ultrapassaram (estourado); a tela de [orçamento](../src/app/dashboard/budget/budget-row.tsx) também destaca as duas faixas na cor do texto/barra de progresso — lógica pura e testada em [budget-status.ts](../src/lib/budget-status.ts)/[budget-status.test.ts](../src/lib/budget-status.test.ts)
- [x] Transações recorrentes: aba "Recorrente" dentro da tela de [transações](../src/app/dashboard/transactions/transaction-form-tabs.tsx) (junto com o lançamento avulso, não em tela separada) para cadastrar uma regra (categoria, descrição, valor, dia do mês) que é lançada automaticamente como transação normal todo mês a partir da data de início, ajustando pro último dia em meses mais curtos; dá pra pausar, editar ou excluir a regra sem afetar as transações já geradas — geração é feita sob demanda (idempotente, via constraint única) ao abrir dashboard/transações/orçamento, em [recurring-transactions.ts](../src/lib/recurring-transactions.ts)/[recurring-transactions.test.ts](../src/lib/recurring-transactions.test.ts)
- [ ] Contas a pagar
- [ ] Importação de extratos (CSV/OFX)
- [ ] Metas financeiras
