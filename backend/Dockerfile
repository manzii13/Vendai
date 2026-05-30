FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Prisma config reads DATABASE_URL at generate time — dummy value is fine for client generation
ENV DATABASE_URL="postgresql://postgres:admin123@db:5432/vendai"
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]
