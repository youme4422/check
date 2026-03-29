FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

ENV NODE_ENV=production
EXPOSE 4000

USER node

CMD ["npm", "run", "start"]
