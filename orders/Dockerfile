FROM node:lts-alpine3.18

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

CMD ["npm","start"]