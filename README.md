# Oiko

Sistema pessoal de gestão financeira — controle de receitas, despesas e orçamento, evoluindo em versões incrementais até uma camada de IA.

Veja o planejamento completo em [projeto-gestao-financeira-planejamento.md](./projeto-gestao-financeira-planejamento.md).

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
