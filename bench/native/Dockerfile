FROM rust:1.77-slim AS builder

WORKDIR /app

# Copy algorithm crate
COPY algorithms/fibonacci ./algorithms/fibonacci

# Copy native runner crate
COPY native/src ./native/src
COPY native/Cargo.toml ./native/Cargo.toml

# Create minimal workspace Cargo.toml so cargo can find both crates
RUN echo '[workspace]\nmembers = ["algorithms/fibonacci", "native"]' > Cargo.toml

WORKDIR /app/native
RUN cargo build --release

# --- Runtime image ---
FROM debian:bookworm-slim

# Install hyperfine
RUN apt-get update && apt-get install -y wget && \
    wget -qO /tmp/hyperfine.deb \
      https://github.com/sharkdp/hyperfine/releases/download/v1.18.0/hyperfine_1.18.0_amd64.deb && \
    dpkg -i /tmp/hyperfine.deb && \
    rm -rf /var/lib/apt/lists/* /tmp/hyperfine.deb

COPY --from=builder /app/native/target/release/fibonacci /usr/local/bin/fibonacci

COPY native/run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
