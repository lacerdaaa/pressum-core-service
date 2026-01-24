FROM node:20-bookworm-slim AS base
WORKDIR /app

# Dependencies needed to build native modules such as bcrypt
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

# Production dependencies only (built with native tooling available)
FROM deps AS prod-deps
RUN npm ci --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

RUN chown -R node:node /app
USER node

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package*.json ./

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http=require('http');const port=process.env.PORT||3001;const req=http.request({host:'127.0.0.1',port,path:'/health',timeout:4000},res=>{res.statusCode===200?process.exit(0):process.exit(1);});req.on('error',()=>process.exit(1));req.end();"

CMD ["node", "dist/main.js"]
