# Oiko

Sistema pessoal de gestão financeira — controle de receitas, despesas e orçamento, evoluindo em versões incrementais até uma camada de IA.

Veja o planejamento completo em [projeto-gestao-financeira-planejamento.md](./projeto-gestao-financeira-planejamento.md).

## Status atual

Passos 1 e 2 do roadmap concluídos; Passo 4 (telas da V1) com todas as telas essenciais no ar. O que já existe no repositório:

- [x] Projeto Next.js criado (App Router, TypeScript, Tailwind CSS, ESLint)
- [x] Prisma com schema definido ([prisma/schema.prisma](prisma/schema.prisma)): models `User`, `Category`, `Transaction`, `Budget`, todas isoladas por `userId`
- [x] Banco Postgres rodando localmente via Docker ([docker-compose.yml](docker-compose.yml)) — Neon ainda não configurado, mas a troca é só mudar a `DATABASE_URL` (ver [Stack](#stack))
- [x] Migration inicial aplicada (`prisma/migrations/`) e client do Prisma gerado (`src/generated/prisma`, via driver adapter `@prisma/adapter-pg` — obrigatório no Prisma 7)
- [x] Autenticação por e-mail/senha com [NextAuth (Auth.js v5)](https://authjs.dev): registro (hash de senha com bcrypt) e login via Credentials provider com sessão JWT ([src/auth.ts](src/auth.ts))
- [x] Telas: landing ([/](src/app/page.tsx)), [login](src/app/login/page.tsx), [cadastro](src/app/cadastro/page.tsx), [dashboard](src/app/dashboard/page.tsx) (saldo do mês, gastos por categoria e comparação com orçamento), [categorias](src/app/dashboard/categorias/page.tsx), [transações](src/app/dashboard/transacoes/page.tsx) e [orçamento mensal](src/app/dashboard/orcamento/page.tsx) — todas isoladas por usuário; categorias/transações/orçamento abrem como modal a partir do dashboard (Parallel/Intercepting Routes) e como página cheia se acessadas direto
- [x] Categoria já define se é Receita ou Despesa (`Category.kind`) — o sinal do valor da transação é derivado da categoria escolhida, não perguntado de novo na hora de lançar
- [x] Orçamento mensal por categoria de despesa, com barra de progresso e alerta visual quando o gasto ultrapassa o limite
- [x] Proteção de rota: [src/proxy.ts](src/proxy.ts) redireciona `/dashboard` para `/login` quando não há sessão (arquivo `proxy.ts`, não `middleware.ts` — renomeado no Next.js 16)
- [x] Identidade visual: logo e favicon ([src/components/oiko-logo.tsx](src/components/oiko-logo.tsx), [src/app/icon.svg](src/app/icon.svg)), paleta de cores aplicada em [globals.css](src/app/globals.css)
- [x] Navegação entre meses na tela de transações (`?mes=YYYY-MM`) — dashboard e orçamento continuam sempre no mês atual
- [x] Categorias padrão pré-criadas no cadastro ([src/lib/categories.ts](src/lib/categories.ts): `DEFAULT_CATEGORIES`) — dez categorias comuns (Moradia, Alimentação, Transporte, Saúde, Educação, Assinaturas, Lazer, Compras, Salário, Outras receitas), pra não começar do zero
- [ ] Filtro/busca por categoria dentro do histórico
- [ ] Testar com um mês real de dados (critério de "V1 pronta", segundo o planejamento)
- [ ] Deploy em produção (Vercel + Neon)

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma](https://www.prisma.io) + PostgreSQL — local via Docker em desenvolvimento, [Neon](https://neon.tech) planejado para produção
- [NextAuth (Auth.js v5)](https://authjs.dev) — autenticação por credenciais (e-mail/senha)
- Deploy: [Vercel](https://vercel.com)

## Desenvolvimento

Antes de rodar, crie um `.env` com `DATABASE_URL` e `AUTH_SECRET` (veja `.env.example`).

```bash
npm install

# sobe o Postgres local
docker compose up -d

# aplica o schema no banco
npx prisma migrate dev

npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.
