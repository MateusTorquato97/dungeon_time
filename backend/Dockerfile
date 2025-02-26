# Escolhe a imagem base com Node.js
FROM node:20

# Instala dependências de compilação
RUN apt-get update && apt-get install -y build-essential python3

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de package e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código para dentro do container
COPY . .

# Expõe a porta na qual o servidor irá rodar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "src/api/server.js"]
