FROM node
WORKDIR /app
RUN apt update \
    && apt install -y curl \
    && curl -fsS https://dl.brave.com/install.sh | sh
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm i bun -g
COPY package.json bun.lock ./
RUN bun install
COPY ./ ./
ENV NODE_ENV=production
CMD bun install whatsapp-web.js@latest && bun src/index.ts
