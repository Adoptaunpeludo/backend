


FROM node:21-alpine as builder
WORKDIR /app
COPY ./package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npm run build

FROM node:21-alpine as backend
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./dist/public
COPY --from=builder /app/swagger.yml ./dist/swagger.yml
CMD ["npm", "run", "start:prod"]

