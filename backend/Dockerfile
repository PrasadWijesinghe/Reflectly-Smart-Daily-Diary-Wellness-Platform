FROM node:20-slim

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/. .

RUN npm run prisma:generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]