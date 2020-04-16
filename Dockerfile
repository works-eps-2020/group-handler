FROM node:13 as app-builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY src src
COPY tsconfig.json ./
RUN npm run build

FROM node:13

WORKDIR /app

ENV PORT=$PORT
ENV HASURA_URL=$HASURA_URL
ENV HASURA_ADMIN_SECRET=$HASURA_ADMIN_SECRET

COPY --from=app-builder /app/dist .
COPY --from=app-builder /app/package.json .
COPY --from=app-builder /app/package-lock.json .

RUN npm install --production

EXPOSE $PORT
CMD ["node", "app.js"]