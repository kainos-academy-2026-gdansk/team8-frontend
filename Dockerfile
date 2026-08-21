# Stage 1: build TypeScript
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: production runtime
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled server code
COPY --from=build /app/dist ./dist

# Runtime files used via process.cwd() in app.ts
COPY --from=build /app/src/views ./src/views
COPY --from=build /app/src/assets ./src/assets
COPY --from=build /app/src/styles ./src/styles
COPY --from=build /app/src/styles.css ./src/styles.css

EXPOSE 3001
CMD ["npm", "start"]
