# Oiko

Sistema pessoal de gestão financeira — controle de receitas, despesas e orçamento, evoluindo em versões incrementais até uma camada de IA.

Veja o planejamento completo em [projeto-gestao-financeira-planejamento.md](./projeto-gestao-financeira-planejamento.md).

## Status atual

Passo 1 (inicialização) concluído e Passo 2 (autenticação) implementado. O que já existe no repositório:

- [x] Projeto Next.js criado (App Router, TypeScript, Tailwind CSS, ESLint) — páginas ainda no template padrão do `create-next-app`
- [x] Prisma instalado e com schema definido ([prisma/schema.prisma](prisma/schema.prisma)): models `User`, `Category`, `Transaction`, `Budget`, todas isoladas por `userId`
- [x] Banco Postgres rodando localmente via Docker ([docker-compose.yml](docker-compose.yml)) — Neon ainda não configurado, mas a troca é só mudar a `DATABASE_URL` (ver [Stack](#stack))
- [x] Migration inicial aplicada (`prisma/migrations/`) e client do Prisma gerado (`src/generated/prisma`, via driver adapter `@prisma/adapter-pg` — obrigatório no Prisma 7)
- [x] Autenticação por e-mail/senha com [NextAuth (Auth.js v5)](https://authjs.dev): endpoint de registro ([src/app/api/register](src/app/api/register/route.ts)) com hash de senha (bcrypt) e login via Credentials provider com sessão JWT ([src/auth.ts](src/auth.ts))
- [ ] Telas da V1 (login, dashboard, lançar transação, categorias, orçamento, histórico) — ainda só o template padrão do Next.js
- [ ] Proteção de rotas (proxy/autorização) — a ser feita junto das telas, quando existirem páginas para proteger

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
