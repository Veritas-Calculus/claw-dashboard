# -- Stage 1: Build --
FROM rust:1.84-slim AS builder

WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Cache dependencies by building them first
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs
RUN cargo build --release 2>/dev/null || true
RUN rm -rf src

# Copy real source and build
COPY . .
RUN touch src/main.rs && cargo build --release

# -- Stage 2: Runtime --
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y ca-certificates wget && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m -s /bin/bash claw
USER claw

COPY --from=builder /app/target/release/claw-api /usr/local/bin/claw-api
COPY --from=builder /app/migrations /app/migrations

WORKDIR /app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["claw-api"]
