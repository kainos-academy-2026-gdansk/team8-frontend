# ---- deps: full deps (incl. dev) for compilation, cached while lockfile is unchanged ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile TypeScript against the cached deps layer ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- prod-deps: production-only node_modules, installed independently for a smaller runtime layer ----
FROM node:22-alpine AS prod-deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---- runtime: minimal image, non-root user, no build tooling ----
FROM node:22-alpine AS runtime
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY src ./src
RUN mkdir -p logs && chown -R node:node /app
USER node

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "require('node:http').get('http://127.0.0.1:3001/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
