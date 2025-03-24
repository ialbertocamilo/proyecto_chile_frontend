# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY . .

RUN yarn build

# Etapa 2: Ejecución
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copiar solo archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Instalar solo dependencias necesarias en producción
RUN yarn install --frozen-lockfile --production --ignore-scripts

EXPOSE 3000
CMD ["yarn", "start"]
