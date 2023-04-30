FROM node:18-alpine

WORKDIR /usr/app

COPY . .

RUN corepack enable

RUN corepack prepare pnpm@7.30.5 --activate

RUN pnpm install

ENV DATABASE_URL=file:/db/db.sqlite

RUN pnpm build

CMD [ "pnpm", "run", "docker:start" ]
