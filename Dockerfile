# Etapa 1: Construcción
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile --ignore-scripts && yarn cache clean

COPY . . 
RUN yarn build 

# Etapa 2: Ejecución
FROM node:20-slim
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["yarn", "start"]
