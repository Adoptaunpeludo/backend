FROM node:21-alpine as deps
WORKDIR /app
COPY ./package*.json ./
COPY prisma ./prisma
RUN npm install

FROM node:21-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN npm run build

FROM node:21-alpine as backend
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
# RUN npx prisma migrate dev
# RUN node dist/data/seed/seed.js
CMD ["node", "dist/app.js"]

