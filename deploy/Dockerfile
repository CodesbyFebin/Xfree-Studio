FROM rust:1.85-bookworm AS build
WORKDIR /src
COPY backend ./backend
RUN cd backend && cargo build --release -p xfree-studio-api

FROM debian:bookworm-slim
RUN useradd --system --uid 10001 --create-home app
COPY --from=build /src/backend/target/release/xfree-studio-api /usr/local/bin/xfree-studio-api
USER app
ENV BIND_ADDR=0.0.0.0:8080
EXPOSE 8080
CMD ["xfree-studio-api"]
