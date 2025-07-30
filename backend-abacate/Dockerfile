# Etapa base: imagem oficial do Node.js
FROM node:20-alpine

# Criar diretório de trabalho dentro do container
WORKDIR /app

# Copiar arquivos para o container
COPY package*.json ./
RUN npm install

COPY . .

# Expor a porta usada pelo app
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "index.js"]
