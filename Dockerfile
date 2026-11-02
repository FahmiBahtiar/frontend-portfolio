FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3002

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY . .

EXPOSE 3002

CMD ["node", "--max-old-space-size=250", "./node_modules/next/dist/bin/next", "start", "-p", "3002"]
