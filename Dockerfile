FROM node:23.11.0

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn gen

EXPOSE 3000

CMD ["yarn", "start:prod"]