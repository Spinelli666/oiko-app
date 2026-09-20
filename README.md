# Oiko

Sistema pessoal de gestão financeira — controle de receitas, despesas e orçamento, evoluindo em versões incrementais até uma camada de IA.

Telas principais: cadastro/login, dashboard (saldo do mês, gráfico de evolução com filtro de período/granularidade, receitas/despesas por categoria, alertas de orçamento), transações (lançamento avulso ou recorrente, histórico filtrável por mês e categoria) e orçamento mensal por categoria.

- Planejamento completo (motivação e escopo de cada versão): [docs/planejamento.md](./docs/planejamento.md)
- Checklist detalhado do que já foi implementado: [docs/status.md](./docs/status.md)

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

### Testes

```bash
npm run test
```

Os testes de isolamento entre usuários ([isolation.test.ts](src/lib/isolation.test.ts)) usam o banco Postgres local (o mesmo do `docker compose up -d`) — precisa estar rodando.
