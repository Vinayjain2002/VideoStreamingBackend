FROM node

WORKDIR /app/storage

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["node", "server.js"]