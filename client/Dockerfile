FROM node:lts-alpine3.18 as development

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm","run", "dev"]

FROM development

RUN npm run build

CMD ["npm","run", "start"]



