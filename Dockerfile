# Stage 1: Build the standalone binary
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build src/server.ts --compile --minify --outfile weather-app

# Stage 2: Minimal runtime — distroless with glibc (binary is glibc-linked)
FROM gcr.io/distroless/base
COPY --from=build /app/weather-app /usr/local/bin/weather-app
EXPOSE 3000
CMD ["weather-app"]
