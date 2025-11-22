# Pressum Core Service (NestJS)

Backend da plataforma Pressum. APIs para auth/usuários, simulados, tentativas/resultados, comentários e billing (Pix via AbacatePay).  
Stack: NestJS 11, TypeORM (PostgreSQL), JWT (access/refresh), class-validator, modular/DDD-light.

## Padrões do Projeto
- **Modular NestJS**: cada domínio em `src/modules/<feature>` com controller/service/entities/dto.
- **Entidades + Repositórios**: TypeORM com entities em inglês; migrations em `src/migrations`.
- **DTOs + ValidationPipe**: validação com class-validator; payloads tipados.
- **Autenticação**: JWT (access/refresh), strategy em `auth/strategies/jwt.strategy.ts`; payload inclui `role`, `plan`, `planStatus`.
- **Autorização/Roles**: campo `User.role` (`user` | `admin`); usar guards para rotas sensíveis (CRUD de simulados, etc.).
- **Logging**: interceptor `RequestLoggingInterceptor` loga método/path/status em todos os requests.
- **Erro padrão**: respostas JSON com `message` e `statusCode` (BadRequest/Unauthorized/etc.).

## Módulos, Controllers e Rotas

### AuthModule (`/auth`)
- `POST /auth/register` (cria usuário, define plano inicial)
- `POST /auth/login` (valida credenciais)
- `POST /auth/refresh`
- `GET /auth/me` (perfil + métricas básicas)

### UsersModule (`/users`)
- `PATCH /users/:id` (perfil)
- `PATCH /users/:id/plan` (ajuste de plano/status)

### ExamsModule (`/simulados`)
- `GET /simulados?search=&area=&difficulty=` (listagem + filtros)
- `GET /simulados/:id` (detalhe com questões)
- **Admin**: `POST /simulados`, `POST /simulados/:id/questions`, `PATCH/DELETE /simulados/:id`, `/questions/:id`

### AttemptsModule (`/attempts`)
- `POST /simulados/:id/attempts` (inicia tentativa)
- `PATCH /attempts/:id/responses` (salva respostas objetivas)
- `PATCH /attempts/:id/essay` (rascunho de redação)
- `POST /attempts/:id/finish` (encerra, valida tempo server-side)
- `GET /attempts/:id` (retomar tentativa)

### ResultsModule
- `GET /attempts/:id/result` (resumo/subjects/strengths/weaknesses)
- `GET /attempts/:id/review` (gabarito/explicações)
- `GET /users/:id/attempts` (histórico)
- `GET /users/:id/results/summary` (média, melhor nota, total concluído)

### CommentsModule
- `POST /questions/:id/comments`
- `POST /comments/:id/replies`
- `PATCH /comments/:id`, `PATCH /replies/:id`
- `DELETE /comments/:id`, `DELETE /replies/:id`
- `GET /questions/:id/comments`

### BillingModule (`/billing`) – AbacatePay (Pix)
- `POST /billing/checkouts` → cria cobrança Pix. Body: `{ planCode, userId, taxId, cellphone, returnUrl?, completionUrl? }`
- `POST /billing/webhook` → valida HMAC-SHA256 do raw body com `ABACATEPAY_API_KEY` (header `X-AbacatePay-Signature`)
- `GET /billing/users/:userId/subscription` → assinatura mais recente
- `GET /billing/users/:userId/payments` → transações
- `POST /billing/subscriptions/:id/cancel`

## Entidades Principais
- **User**: `id`, `name`, `email`, `passwordHash`, `plan`, `planStatus`, `planStartDate`, `planEndDate`, `role`, `abacateCustomerId`, `metrics`
- **Plan**: `code`, `name`, `priceCents`, `currency`, `period`, `entitlements`
- **Subscription**: `status`, `startedAt`, `endsAt`, `canceledAt`, `externalId`, `gatewayCustomerId`, `user`, `plan`
- **PaymentTransaction**: `amountCents`, `currency`, `status (pending/paid/failed/refunded)`, `method (pix)`, `gatewayRef`, `rawPayload`, `user`, `subscription`, `plan`
- **Exam/Question/Option/EssaySupportingText**
- **Attempt/AttemptResponse/EssaySubmission/AttemptResult**
- **QuestionComment/CommentReply**

## Billing / Webhook (AbacatePay)
- **Checkout**: `POST /billing/checkouts` → `{ checkoutUrl?, pixCode?, transactionId, status }`
- **Webhook**: `POST /billing/webhook` com HMAC-SHA256 (rawBody, chave = `ABACATEPAY_API_KEY`), header `X-AbacatePay-Signature`.
  - `PAID`: transação `paid`, assinatura `active`, user.planStatus `active`
  - `EXPIRED/CANCELLED`: transação `failed`, assinatura `expired/canceled`
  - `REFUNDED`: transação `refunded`, assinatura `canceled`
- **Plans seed**: free (0), premium (2999), intensive (6999) mensais.
- **Teste local**: túnel (ngrok/cloudflared) apontando para `https://<tunnel>/billing/webhook`.

## Variáveis de Ambiente (`.env.example`)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=pressum
DB_SYNCHRONIZE=false
DB_LOGGING=false

JWT_ACCESS_SECRET=supersecret
JWT_REFRESH_SECRET=supersecretrefresh
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=10

ABACATEPAY_API_KEY=your_abacate_api_key

PORT=3001
HOST=0.0.0.0
```

## Como Rodar
1) `npm install`  
2) Migrations: `npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts`  
3) Seeds: `npm run seed` (planos + exames)  
4) Dev: `npm run start:dev`

## Roles e Permissões
- `User.role` (`user` | `admin`) incluído no JWT.  
- Use guards para rotas admin (CRUD de simulados, etc.).  
- Front: botão “Criar Simulado” só para admins; `/payment` consome checkout Pix.
