FROM mcr.microsoft.com/playwright:v1.59.1-noble AS final

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY tests/ ./tests/
COPY playwright.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

ENV CI=true

ENTRYPOINT ["npx", "playwright", "test"]
