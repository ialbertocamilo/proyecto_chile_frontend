
# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json *.lock./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Ejecución
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
