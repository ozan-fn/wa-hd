FROM node
RUN apt update \
    && apt install -y curl \
    && curl -fsS https://dl.brave.com/install.sh | sh
COPY package.json bun.lock ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY ./ ./

CMD bun install whatsapp-web.js@latest && bun src/index.ts
