# Projeto de Gestão Financeira Pessoal — Planejamento

## Visão Geral

Sistema pessoal de controle financeiro, lançado em versões incrementais: primeiro um site funcional que resolve o básico (controle de receitas, despesas e orçamento), depois evolução para experiência de app, e por último uma camada de IA — construída sobre uma base de dados real já em uso.

**Princípio norteador:** cada versão precisa ser útil sozinha. Nada de esperar a versão "completa" pra começar a usar.

---

## Status Atual (atualizado em 2026-09-14)

Repositório `oiko-app` criado no GitHub, mas ainda vazio (só `README.md`, `LICENSE`, `.gitignore`). Nenhum passo do roadmap abaixo foi iniciado ainda.

**Próxima ação imediata:** Passo 1 — inicializar o projeto Next.js dentro deste repositório.

- [ ] 1. Criar o projeto Next.js + configurar Neon, nomeado como Oiko
- [ ] 2. Configurar autenticação multiusuário (NextAuth + Prisma) — isolamento por `user_id` desde o primeiro commit
- [ ] 3. Implementar o schema do banco (`users`, `categories`, `transactions`, `budgets`)
- [ ] 4. Construir as telas essenciais da V1 (login, dashboard, lançar transação, categorias, orçamento, histórico)
- [ ] 5. Implementar a lógica de orçamento com testes desde o início — incluindo o teste de isolamento entre usuários
- [ ] 6. Testar com um mês real de dados seus (critério de "V1 pronta")
- [ ] 7. Usar sozinho antes de convidar outras pessoas

### Detalhe do Passo 1 (o que fazer agora)

1. Rodar `npx create-next-app@latest` dentro de `oiko-app` (TypeScript, App Router, Tailwind, ESLint — mesmo padrão do Codex VI)
2. Criar o banco Postgres no [Neon](https://neon.tech), copiar a connection string
3. Adicionar a connection string em `.env.local` (nunca commitar esse arquivo — conferir que já está no `.gitignore`)
4. Instalar e inicializar o Prisma (`npm install prisma @prisma/client`, `npx prisma init`)
5. Rodar `npx prisma db push` (ou primeira migration) só pra validar que a conexão com o Neon funciona, antes de desenhar o schema completo
6. Commitar o esqueleto do projeto

---

## Stack Tecnológico

| Camada | Escolha | Justificativa |
|---|---|---|
| Frontend + Backend | Next.js | Já usado no Codex VI, unifica site e API no mesmo projeto |
| Banco de dados | PostgreSQL (Neon) | Já usado no Codex VI, relacional (bom pra dados financeiros estruturados) |
| Deploy | Vercel | Integração nativa com Next.js |
| Serviço de IA (futuro) | Python (Django/FastAPI) | Conhecimento prévio em Python/Django; roda como serviço separado, acessado via API pelo Next.js quando a IA entrar em cena |
| Containerização | Docker | Ambiente de desenvolvimento e deploy consistente — importante já que o serviço de IA (Python) roda separado do Next.js e precisa de um jeito padronizado de subir os dois juntos |

**Por que separar IA em serviço Python à parte, em vez de misturar tudo:**
- Você não trava o desenvolvimento das versões iniciais esperando decidir a arquitetura de IA.
- Python tem o ecossistema mais maduro pra IA/ML (mesmo sendo LLM via API, bibliotecas de dados como pandas ajudam na análise financeira).
- Se a camada de IA falhar ou precisar ser refeita, não compromete o sistema principal.
- Aproveita seu conhecimento em Django pra construir esse serviço quando chegar a hora.

---

## Roadmap de Versões

### V1 — MVP (Controle Básico)
Objetivo: ter o essencial funcionando e em uso real o quanto antes.

- Cadastro manual de transações (receita/despesa)
- Classificação de gastos: **Essencial / Importante / Supérfluo**
- Orçamento mensal por categoria (definir limite, acompanhar consumido vs. restante)
- Dashboard simples: saldo do mês, gastos por categoria, comparação com orçamento
- Autenticação **multiusuário desde o início** (cada pessoa com sua conta e seus dados isolados) — ver nota abaixo

**Critério de "pronto":** você consegue lançar seus gastos reais de um mês inteiro e ver pra onde o dinheiro foi.

> **Nota — plano de compartilhar com outras pessoas no futuro:** isso muda uma decisão de arquitetura da V1, não só da V3. Multiusuário depois de o sistema já existir com dado de um usuário só (schema de banco presumindo "eu = único usuário") costuma exigir migração dolorosa. O ajuste é simples se feito agora: toda tabela (transações, categorias, orçamentos) já nasce com uma coluna `user_id` e todo dado é isolado por usuário desde a primeira linha de código. Isso **não** significa construir login social, convites, ou plano pago já na V1 — só significa que o modelo de dados já respeita "existem N usuários" em vez de "existe um usuário". O resto (convites, multiusuário compartilhado por família, portal de admin) continua na V3, como planejado.

### V2 — Refinamento + Experiência de App
Objetivo: reduzir o atrito de uso no dia a dia.

- Importação de extratos (CSV/OFX) em vez de lançamento 100% manual
- Gráficos de evolução (histórico mês a mês, tendências de gasto)
- Metas financeiras (ex: reserva de emergência, poupar X por mês)
- Alertas (ex: "você atingiu 90% do orçamento de uma categoria")
- **Transações recorrentes**: marcar uma receita/despesa como semanal, mensal ou anual — o sistema lança automaticamente nos períodos seguintes (ex: salário, assinatura, aluguel)
- **Contas a pagar**: lembrete de vencimento (status pendente/pago), separado da recorrência — avisa antes do vencimento e só vira transação quando confirmado o pagamento
- Decisão de PWA vs. nativo entra aqui — **ainda em aberto**, pode ser decidida com base no uso real da V1

### V3 — Multiusuário / Investimentos / Open Finance (opcional)
Objetivo: se fizer sentido pro seu caso de uso (ex: uso compartilhado com outra pessoa, ou automação total).

- Múltiplos usuários/perfis (ex: gestão financeira familiar)
- Integração via Open Finance (importação automática de transações bancárias)
- **Investimentos**: acompanhamento de carteira — ações, fundos, renda fixa
- **Conexão com corretoras/B3**: viável, mas com ressalva — a B3 não oferece API pública direta pra portfólio de pessoa física. O caminho realista é: (a) módulo de investimentos do **Open Finance** (regulado pelo Banco Central, já cobre dados de investimento desde 2023) ou (b) API específica de cada corretora, quando disponível. Definir isso na hora, dependendo de quais corretoras forem relevantes pra você

### V4 — IA
Objetivo: usar IA depois de já ter dado histórico real — sem dado, IA não tem o que analisar.

Ver seção dedicada abaixo.

---

## Onde e Como Entra a IA

A pergunta certa não é "qual IA implementar", é "qual problema a IA resolve melhor que uma regra simples". Ordem sugerida, da mais barata/simples pra mais cara/complexa:

| Nível | O que faz | Tipo de solução | Custo/complexidade |
|---|---|---|---|
| 1. Categorização automática | Sugere a categoria (Essencial/Importante/Supérfluo) ao lançar uma transação, com base no histórico | Classificação simples (regras + modelo leve, sem precisar de LLM) | Baixo |
| 2. Insights automáticos | "Você gastou 30% a mais em delivery este mês" — geração de resumos a partir dos dados | LLM via API, prompt sobre os dados já calculados | Médio |
| 3. Assistente conversacional | Você pergunta em linguagem natural: "quanto gastei com transporte no último trimestre?" | RAG (o modelo consulta seu banco de dados via API pra responder) | Médio-alto |
| 4. Recomendações preditivas | Projeção de fluxo de caixa, alertas antecipados de estouro de orçamento | Modelo estatístico/ML sobre o histórico | Alto (precisa de dado histórico robusto — só faz sentido depois de meses de uso real) |

**Recomendação de ordem de implementação:** 1 → 2 → 3 → 4. Os dois primeiros níveis já entregam valor real com esforço baixo; os últimos dois exigem volume de dados que só existe depois de meses de uso.

**Custo de oportunidade:** implementar IA antes da hora consome tempo de desenvolvimento que poderia ir pro core do produto (V1/V2), sem ainda ter dado suficiente pra IA ser útil. É melhor gasto marginal depois de a base estar sólida.

---

## Modelo de Dados Detalhado (V1)

Desenho conceitual das tabelas — a implementação (SQL/Prisma) fica pra quando você pedir os scripts na sessão do VS Code. Aqui é só a estrutura e as relações.

### `users`
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| name | string | |
| email | string | único |
| password_hash | string | se não usar login social |
| created_at | timestamp | |

### `categories`
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| user_id | UUID | FK → users.id |
| name | string | ex: "Alimentação", "Transporte" |
| type | enum | Essencial / Importante / Supérfluo |

> Categorias por usuário (não globais) — cada pessoa pode nomear e classificar do seu jeito, mas dá pra vir com um conjunto padrão pré-criado no cadastro, pra não começar do zero.

### `transactions`
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| user_id | UUID | FK → users.id |
| category_id | UUID | FK → categories.id |
| description | string | |
| amount | decimal | positivo = receita, negativo = despesa (ou um campo `type` separado) |
| date | date | data da transação (não da inserção) |
| created_at | timestamp | |

### `budgets`
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| user_id | UUID | FK → users.id |
| category_id | UUID | FK → categories.id |
| month_reference | date | ex: 2026-09-01, representa o mês/ano |
| limit_amount | decimal | limite definido pra aquela categoria naquele mês |

**Relações:** um usuário tem várias categorias, várias transações e vários orçamentos mensais. Toda consulta do sistema filtra por `user_id` — é o que garante o isolamento entre pessoas quando o projeto for compartilhado.

**Consulta-chave da V1** (a que o dashboard mais vai usar): soma de `amount` em `transactions`, agrupado por `category_id`, filtrado por `user_id` e por mês — comparado contra `limit_amount` em `budgets` pra mesma categoria/mês.

### `recurring_transactions` (V2)
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| user_id | UUID | FK → users.id |
| category_id | UUID | FK → categories.id |
| description | string | |
| amount | decimal | |
| frequency | enum | weekly / monthly / annual |
| next_occurrence | date | próxima data em que gera uma transação |
| active | boolean | permite pausar sem excluir |

### `bills` — contas a pagar (V2)
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | chave primária |
| user_id | UUID | FK → users.id |
| description | string | |
| amount | decimal | |
| due_date | date | data de vencimento |
| status | enum | pending / paid |
| linked_transaction_id | UUID (nullable) | preenchido quando o pagamento é confirmado e vira uma transação |
| frequency | enum (nullable) | se a conta também se repete (ex: fatura mensal) |

---

## Telas da V1

| Tela | Conteúdo | Ações principais |
|---|---|---|
| Login / Cadastro | Formulário de e-mail e senha (ou provedor social, se decidido depois) | Criar conta, entrar |
| Dashboard | Saldo do mês, gráfico de gastos por categoria, comparação orçado vs. gasto | Ver detalhes de uma categoria, ir pra lançamento |
| Lançar transação | Formulário: descrição, valor, categoria, data | Salvar, editar, excluir transação |
| Categorias | Lista de categorias do usuário, com a classificação (Essencial/Importante/Supérfluo) | Criar, editar, excluir categoria |
| Orçamento mensal | Lista de categorias com limite definido para o mês corrente | Definir/editar limite por categoria |
| Histórico | Lista de transações do mês (ou período selecionado), filtrável por categoria | Filtrar, buscar, editar transação |

**Fluxo principal esperado:** login → dashboard (visão geral) → lançar transação → volta pro dashboard já atualizado. O orçamento e as categorias são configuração, acessadas com menos frequência que o lançamento.

---

## Testes

Sim — e quanto mais o projeto envolver dado financeiro de terceiros, mais isso deixa de ser opcional.

| Tipo | O que cobre | Quando começar |
|---|---|---|
| Unitário | Cálculo de orçamento (consumido vs. limite), soma de transações por categoria, classificação Essencial/Importante/Supérfluo | Já na V1 — é o núcleo do sistema |
| Integração | API + banco: criar transação, editar, excluir, e ver refletido corretamente no dashboard | V1 |
| Isolamento entre usuários | Usuário A nunca consegue ler, editar ou listar dado do usuário B, mesmo manipulando a URL/requisição diretamente | V1, antes de qualquer outra pessoa usar o sistema |
| Casos de borda | Valor zero, valor negativo, transação no último dia do mês (contabilizada no mês certo), orçamento sem limite definido, categoria excluída com transações associadas | V1/V2 |
| Ponta a ponta (E2E) | Fluxo completo: cadastro → login → lançar transação → ver no dashboard | V2, quando a interface estiver mais estável |

O teste de **isolamento entre usuários** é o mais importante de todos, dado que você pretende compartilhar o projeto — é o tipo de falha que não aparece em uso normal, só quando alguém (mal-intencionado ou não) tenta acessar o que não é dele.

## Segurança

Sim, e a prioridade sobe bastante a partir do momento em que outras pessoas confiam seus dados financeiros ao sistema. Pontos essenciais, em ordem de prioridade:

1. **Nunca confiar em `user_id` vindo do cliente.** Toda rota de API deve pegar o usuário da sessão autenticada no servidor, nunca de um campo enviado pelo navegador — senão qualquer um edita a requisição e vê dado de outro usuário.
2. **Senha com hash forte** (bcrypt/argon2), nunca texto puro no banco. Se usar NextAuth (como no helpdesk-ige), isso já vem resolvido pra login por credenciais.
3. **HTTPS obrigatório** — automático no Vercel, não precisa configurar.
4. **Variáveis sensíveis (chave do banco, secrets) em variáveis de ambiente**, nunca commitadas no código.
5. **Rate limiting no login** — evita tentativa de força bruta de senha.
6. **Quando entrar Open Finance (V3):** nunca armazenar login/senha de banco diretamente. Open Finance funciona por token/consentimento regulado pelo Banco Central — a arquitetura correta usa esse fluxo, não login direto na conta do banco.
7. **LGPD:** a partir do momento que o sistema guarda dado financeiro de outra pessoa, isso é dado sensível sob a lei brasileira — vale ter uma política de privacidade simples e clareza sobre o que é coletado, mesmo em um projeto pessoal/pequeno.

---

## Nome do Projeto

**Oiko** — do grego *oikos* (οἶκος), "casa/lar", raiz da palavra *oikonomia* (οἰκονομία), origem de "economia": administração dos recursos da casa. Nome curto, fácil de falar e compartilhar, mantendo o significado.

Conceito de logo: casa/templo (telhado + colunas em traço único) — combina diretamente com o significado de *oikos*. Cor primária (Aegean blue-teal) no traço.

### Paleta de cores

| Token | Modo claro | Modo escuro |
|---|---|---|
| Fundo | `#FBF7F0` (creme) | `#1C1712` (quase-preto quente) |
| Superfície | `#FFFFFF` | `#292019` |
| Texto principal | `#2B2118` | `#F4EDE2` |
| Texto secundário | `#6B5D4F` | `#B5A896` |
| Primária (Aegean blue-teal) | `#2C6E7F` | `#5FA8B8` |
| Destaque (terracota) | `#C1622D` | `#E0834F` |
| Sucesso (oliva) | `#6B7A3A` | `#9AAE5C` |
| Alerta (rust red) | `#B23A2E` | `#E0685A` |

Paleta mediterrânea (tons de mar Egeu e cerâmica grega) em vez do azul genérico de fintech — reforça a identidade do nome sem perder a seriedade de um app financeiro. Fundo nunca em preto/branco puro, pra reduzir cansaço visual e manter a paleta terrosa consistente nos dois modos.

---

## Decisões em Aberto

- [ ] PWA vs. app nativo (V2) — decidir com base no uso real da V1
- [ ] Estrutura de convite/compartilhamento entre usuários na V3 (ex: cada um vê só o próprio, ou existe visão compartilhada tipo família)
- [ ] Se Open Finance (V3) faz sentido, ou fica só com importação manual de extrato

## Ideias para Versões Futuras (não-core)

Funcionalidades interessantes, mas que não devem atrasar V1/V2 — entram quando o core estiver estável e houver tempo/apetite pra elas.

- **Gamificação**: barra de progresso visual pra metas de economia, selo/emblema por fechar o mês dentro do orçamento

## Monetização (planejada para o futuro — não antes de meses de uso real)

Só entra depois de meses de uso consolidado, com base de usuários e dado suficiente pra justificar. Não é prioridade das versões iniciais.

| Modelo | Como funciona | Prioridade |
|---|---|---|
| Assinatura freemium | V1 grátis; recursos de V2/V3 (importação de extrato, Open Finance, investimentos, insights de IA, espaço familiar) pagos | 1 |
| Espaço compartilhado pago | Uso individual grátis; "espaço familiar" (V3) exige assinatura | 2 (combina com o item 1) |
| B2B / white-label | Vender pra empresas/consultores financeiros | 3 — mais peso operacional |
| Parcerias/afiliados | Comissão por indicação de produto financeiro | 4 — cuidado com conflito de interesse e possível exigência regulatória (CVM/Bacen) |
| Anúncios | — | Não recomendado — quebra confiança em app com dado financeiro sensível |

**Atenção antes de cobrar:** processar dado financeiro de terceiros com fins de receita normalmente exige CNPJ, termos de uso e política de privacidade formais (LGPD) — questão jurídica/tributária, não é algo que eu resolvo aqui, mas vale levantar antes de lançar o modelo pago.

- [ ] Qual LLM/provedor usar quando chegar a V4 (Anthropic API, OpenAI, modelo local) — decidir na hora, tecnologia muda rápido

---

## Próximos Passos

1. Criar o repositório Next.js + configurar Neon (mesmo fluxo do Codex VI), nomeado como Oiko
2. Configurar autenticação multiusuário (NextAuth + Prisma, mesmo padrão do helpdesk-ige) — isolamento por `user_id` desde o primeiro commit
3. Implementar o schema do banco (`users`, `categories`, `transactions`, `budgets`) conforme detalhado acima
4. Construir as telas essenciais da V1 (login, dashboard, lançar transação, categorias, orçamento, histórico)
5. Implementar a lógica de orçamento com testes desde o início — incluindo o teste de isolamento entre usuários
6. Testar com um mês real de dados seus (critério de "V1 pronta")
7. Usar sozinho antes de convidar outras pessoas
