# Build stage: this stage may contain development dependencies and build tools.
FROM node:22-alpine AS build

# Put the application files in /app inside the build stage.
WORKDIR /app

# Copy dependency manifests first so Docker can reuse this layer when source changes.
COPY package*.json ./

# Install all dependencies because TypeScript is a development dependency.
RUN npm ci

# Copy the source needed to compile the application.
COPY . .

# Compile the TypeScript source into the dist directory.
RUN npm run build

# Runtime stage: this becomes the smaller final image.
FROM node:22-alpine AS runtime

# Put only runtime files in /app.
WORKDIR /app

# Set the application environment inside the running container.
ENV NODE_ENV=production

# Copy dependency manifests so the runtime can install its own dependencies.
COPY package*.json ./

# Install production dependencies without TypeScript, tests, or other dev tools.
RUN npm ci --omit=dev

# Copy the compiled server code from the build stage.
COPY --from=build /app/dist ./dist

# Copy the templates and static files that the app reads from src at runtime.
COPY --from=build /app/src/views ./src/views
COPY --from=build /app/src/assets ./src/assets
COPY --from=build /app/src/styles ./src/styles
COPY --from=build /app/src/styles.css ./src/styles.css

# Document the port the application listens on by default.
EXPOSE 3001

USER node

# Start the compiled Express application when the container starts.
CMD ["npm", "start"]
