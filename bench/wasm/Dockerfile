FROM rust:1.77-slim AS wasm-builder

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app

COPY algorithms/fibonacci ./algorithms/fibonacci

# Cargo.toml needed at workspace root by wasm-pack
RUN echo '[workspace]\nmembers = ["algorithms/fibonacci"]' > Cargo.toml

WORKDIR /app/algorithms/fibonacci
RUN wasm-pack build --target web --out-dir /pkg

# --- Runtime image: Node + Puppeteer + static server ---
FROM node:20-slim

# Install Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libgbm1 \
    libasound2 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install Node deps
COPY wasm/package.json wasm/package-lock.json* ./
RUN npm install

# Copy web assets
COPY wasm/web ./web

# Copy compiled WASM package
COPY --from=wasm-builder /pkg ./pkg

# Copy Puppeteer benchmark script
COPY wasm/benchmark.js ./benchmark.js

EXPOSE 8080

CMD ["node", "benchmark.js"]
