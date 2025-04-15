# Use imagem oficial do Node.js
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos package.json e instala dependências
COPY package*.json ./
RUN npm install --production

# Copia o restante do código para o container
COPY . .

# Expõe a porta se for usar API, se não, não precisa
EXPOSE 3000

# Comando padrão de execução
CMD ["npm", "start"]
