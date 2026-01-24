# Pressum Core Service (NestJS)

Backend da plataforma Pressum. APIs para autenticação, gestão de usuários, simulados/provas, tentativas/resultados, comentários, métricas/insights de IA, chat com IA e billing (Pix via AbacatePay).  
Stack: NestJS 11, TypeORM/PostgreSQL, JWT (access/refresh), class-validator, schedulers para billing, integração AbacatePay (Pix).

---
## Visão Geral de Arquitetura
- **Modular**: cada domínio em `src/modules/<feature>` com controller/service/entities/dto/guards.
- **Persistência**: TypeORM; entities em inglês; migrations em `src/migrations`; seeds em `src/database/seed.ts`.
- **Segurança**: JWT (access/refresh), guards de role; passwords com bcrypt.
- **Validadores**: DTOs com class-validator; ValidationPipe global.
- **Infra**: ScheduleModule para crons (billing), interceptor de logging de requisição.
- **Entregáveis**: API REST (controllers) + webhooks (AbacatePay).

---
## Módulos, Controllers e Rotas

### AuthModule (`/auth`)
- `POST /auth/register` — cria usuário, seta plano inicial.
- `POST /auth/login` — autentica e devolve access/refresh tokens.
- `POST /auth/google` — recebe `idToken` do Google, valida e emite nossos JWTs (cria usuário free se não existir).
- `POST /auth/refresh` — renova access token.
- `GET /auth/me` — perfil + dados de plano/role/metrics básicos.

### UsersModule (`/users`)
- `PATCH /users/:id` — atualiza nome/email/etc.
- `PATCH /users/:id/plan` — força plano/status (útil para admin/SRE).

### ExamsModule (`/simulados`)
- `GET /simulados?search=&area=&difficulty=` — lista com filtros.
- `GET /simulados/:id` — detalhe + questões.
- **Admin**:
  - `POST /simulados` — cria simulado.
  - `POST /simulados/:id/questions` — adiciona questão.
  - `PATCH /simulados/:id`, `DELETE /simulados/:id`.
  - `PATCH /questions/:id`, `DELETE /questions/:id`.

### AttemptsModule (`/attempts`)
- `POST /simulados/:id/attempts` — inicia tentativa.
- `PATCH /attempts/:id/responses` — salva respostas objetivas em andamento.
- `PATCH /attempts/:id/essay` — salva rascunho de redação.
- `POST /attempts/:id/finish` — encerra; valida tempo no servidor.
- `GET /attempts/:id` — retoma tentativa.

### ResultsModule (`/results`)
- `GET /attempts/:id/result` — resumo de notas/assuntos/forças/fraquezas.
- `GET /attempts/:id/review` — gabarito + explicações.
- `GET /users/:id/attempts` — histórico de tentativas.
- `GET /users/:id/results/summary` — KPIs (média, melhor nota, total concluído).

### CommentsModule (`/comments`)
- `POST /questions/:id/comments` — comenta uma questão.
- `POST /comments/:id/replies` — responde um comentário.
- `PATCH /comments/:id`, `PATCH /replies/:id` — edita.
- `DELETE /comments/:id`, `DELETE /replies/:id` — remove.
- `GET /questions/:id/comments` — lista comentários/respostas.

### MetricsModule (`/metrics`)
- Armazena snapshots de métricas do usuário e por assunto (UserMetric, UserSubjectMetric, UserMistakeLog).  
  Rotas públicas ainda não expostas; usado internamente pelos resultados/insights.

### AiInsightsModule (`/ai-insights`)
- Gera/consulta insights automáticos de desempenho (interno; exposto via Results).

### AiChatModule (`/ai-chat`)
- `POST /ai-chat/messages` — envia mensagem ao tutor IA (stream).  
  (Ver constantes em `src/modules/ai-chat/constants.ts`.)

### BillingModule (`/billing`) – Pix (AbacatePay)
- `POST /billing/checkouts` — cria cobrança Pix. Body: `{ planCode, userId, taxId, cellphone, returnUrl?, completionUrl? }`
  - Persiste Subscription (PENDING) com CPF/CNPJ/telefone/URLs.
  - Cria PaymentTransaction (PENDING) com `checkoutUrl` e `pixCode`.
- `POST /billing/webhook` — valida HMAC-SHA256 do raw body (chave: `ABACATEPAY_API_KEY` ou `ABACATE_WEBHOOK_SECRET`). Atualiza transação e assinatura:
  - `PAID/ACTIVE` → Payment: PAID, Subscription: ACTIVE (set `startedAt`, `endsAt`), User: `planStatus=active`.
  - `EXPIRED/CANCELLED` → Payment: FAILED, Subscription: EXPIRED/CANCELED, User: downgrade se nenhuma outra ativa.
  - `REFUNDED` → Payment: REFUNDED, Subscription: CANCELED, User: downgrade.
- `GET /billing/users/:userId/subscription` — assinatura mais recente.
- `GET /billing/users/:userId/payments` — todas as transações.
- `GET /billing/users/:userId/pending-payment` — última assinatura pendente + Pix/checkout (para modal de cobrança).
- `POST /billing/subscriptions/:id/cancel` — cancela assinatura (marca status e fim do plano).

### Schedulers
- **BillingSchedulerService** (`@Cron 03:00`)  
  - Expira assinaturas `ACTIVE` com `endsAt <= now`.  
  - Se não houver outra assinatura ativa: muda `user.plan` para FREE, `planStatus=EXPIRED`, `planEndDate=endsAt`, e dispara `queueRenewalCheckout` para já criar uma nova cobrança Pix com o último CPF/Cel/URLs.

---
## Entidades Principais
- **User**: `id`, `name`, `email`, `passwordHash`, `plan`, `planStatus`, `planStartDate`, `planEndDate`, `role`, `abacateCustomerId`, `metrics`.
- **Plan**: `code`, `name`, `priceCents`, `currency`, `period (monthly/yearly/one_time)`, `active`, `entitlements`.
- **Subscription**: `status (pending/active/canceled/expired)`, `startedAt`, `endsAt`, `canceledAt`, `externalId`, `gatewayCustomerId`, `billingTaxId`, `billingCellphone`, `checkoutReturnUrl`, `checkoutCompletionUrl`, `user`, `plan`.
- **PaymentTransaction**: `amountCents`, `currency`, `status (pending/paid/failed/refunded)`, `method (pix)`, `gatewayRef`, `description`, `rawPayload`, `checkoutUrl`, `pixCode`, `user`, `subscription`, `plan`.
- **Exam/Question/Option/EssaySupportingText**: banco de simulados/questões/alternativas/textos de apoio.
- **Attempt / AttemptResponse / EssaySubmission / AttemptResult**: ciclo de prova, respostas objetivas e redação, resultados calculados.
- **QuestionComment / CommentReply**: comentários e respostas em questões.
- **UserMetric / UserSubjectMetric / UserMistakeLog**: métricas históricas e erros recorrentes.

---
## Fluxo de Billing (Pix AbacatePay)
1) **Checkout** (`POST /billing/checkouts`): cria Subscription PENDING e PaymentTransaction PENDING. Retorna `{ checkoutUrl?, pixCode?, transactionId, status }`.
2) **Pagamento**: usuário paga via Pix (AbacatePay).
3) **Webhook** (`POST /billing/webhook`):
   - Valida assinatura HMAC-SHA256 (`X-AbacatePay-Signature` ou `x-webhook-signature` etc.) usando `ABACATEPAY_API_KEY`/`ABACATE_WEBHOOK_SECRET`.
   - Atualiza transação e assinatura conforme status do gateway.
   - Ajusta `User.plan`, `planStatus`, `planStartDate`, `planEndDate`.
4) **Renovação automática**: cron expira `ACTIVE` vencidas, downgrada usuário se for a última ativa e gera novo checkout Pix reutilizando CPF/cel/URLs da assinatura anterior.
5) **Consulta**: front usa `GET /billing/users/:id/pending-payment` para exibir modal não escapável com Pix/checkout quando há pendência.

---
## Autenticação, Roles e Guards
- JWT access/refresh; payload inclui `sub`, `email`, `role`, `plan`, `planStatus`.
- `User.role`: `user` | `admin`. Guards de role para rotas admin (ex.: CRUD de simulados).
- Senhas com bcrypt (`BCRYPT_SALT_ROUNDS`).
- Interceptor de logging registra método, path, status e tempo.

---
## Variáveis de Ambiente (base em `.env.example`)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=pressum
DATABASE_URL=postgres://user:pass@host:5432/db
DATABASE_SSL=false
DB_SYNCHRONIZE=false
DB_LOGGING=false

JWT_ACCESS_SECRET=supersecret
JWT_REFRESH_SECRET=supersecretrefresh
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=10

ABACATEPAY_API_KEY=your_abacate_api_key
ABACATE_WEBHOOK_SECRET=optional_override
ABACATEPAY_PUBLIC_KEY=optional_override

BILLING_APP_BASE_URL=https://app.pressum.com   # fallback para return/completion
BILLING_RETURN_URL=                             # opcional (senão usa /payment)
BILLING_COMPLETION_URL=                         # opcional (senão usa /payment/success)

PORT=3001
HOST=0.0.0.0
```

---
## Execução Local
1) `npm install`
2) Migrations:  
   `npm run migration:run`
3) Seeds: `npm run seed` (planos + simulados de exemplo)
4) Dev: `npm run start:dev` (porta 3001)

---
## Referências de Arquivos
- **App bootstrap**: `src/app.module.ts`
- **Auth**: `src/modules/auth/*`
- **Users**: `src/modules/users/*`
- **Billing**: `src/modules/billing/*` (services, controller, scheduler, entities)
- **Exams/Attempts/Results**: `src/modules/exams`, `attempts`, `results`
- **Comments**: `src/modules/comments`
- **AI Chat/Insights**: `src/modules/ai-chat`, `ai-insights`
- **Entities base**: `src/common/entities`
- **Enums**: `src/common/enums`
- **Migrations**: `src/migrations`

---
## Observações Operacionais
- Para webhook em dev: expose `POST /billing/webhook` via ngrok/cloudflared com raw-body habilitado.
- Ao mudar schema: gerar migration (`npm run build` gera dist; use TypeORM CLI para criar nova migration).
- Planos ativos no seed: `free`, `premium` (R$29,90), `intensive` (R$69,99) — atualize conforme pricing vigente.
