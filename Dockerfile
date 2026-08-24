# --- Stage 1: install all dependencies (incl. devDependencies) needed to build ---
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: compile TypeScript into dist/, reusing deps from stage 1 ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 3: minimal runtime image ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=development
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# app reads views/assets/styles from src/ (via process.cwd()) at runtime, not just dist/
COPY --from=builder /app/dist ./dist
COPY src/views ./src/views
COPY src/assets ./src/assets
COPY src/styles ./src/styles
COPY src/styles.css ./src/styles.css

EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
