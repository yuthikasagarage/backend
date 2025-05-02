FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g typescript ts-node

EXPOSE 3001

CMD ["npm", "start"]
