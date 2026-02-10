FROM node:18-alpine
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar código (el .dockerignore excluirá client/)
COPY . .

EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]