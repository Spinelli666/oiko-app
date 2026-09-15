# Oiko

Sistema pessoal de gestão financeira — controle de receitas, despesas e orçamento, evoluindo em versões incrementais até uma camada de IA.

Veja o planejamento completo em [projeto-gestao-financeira-planejamento.md](./projeto-gestao-financeira-planejamento.md).

## Status atual

Ainda dentro do **Passo 1** do roadmap (inicialização do projeto). O que já existe no repositório:

- [x] Projeto Next.js criado (App Router, TypeScript, Tailwind CSS, ESLint) — páginas ainda no template padrão do `create-next-app`
- [x] Prisma instalado (`prisma` + `@prisma/client`) e inicializado (`prisma/schema.prisma`, `prisma7.config.ts`) — schema ainda sem nenhuma model definida
- [ ] Banco Postgres no Neon — `.env` ainda com a connection string placeholder do Prisma (`localhost:5432/mydb`), banco real ainda não criado/conectado
- [ ] Validar a conexão com o Neon (`npx prisma db push` ou `prisma generate`) — não foi rodado ainda (não há `src/generated/prisma`)
- [ ] Schema do banco (`users`, `categories`, `transactions`, `budgets`)
- [ ] Autenticação multiusuário

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma](https://www.prisma.io) + PostgreSQL ([Neon](https://neon.tech))
- Deploy: [Vercel](https://vercel.com)

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

Antes de rodar, crie um `.env.local` com a `DATABASE_URL` do Neon (veja `.env.example`).
