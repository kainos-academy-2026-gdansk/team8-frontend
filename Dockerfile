# Start with a small Node.js 22 image based on Alpine Linux.
FROM node:22-alpine

# Put the application files in /app inside the image.
WORKDIR /app

# Copy dependency manifests first so Docker can reuse this layer when source changes.
COPY package*.json ./

# Install the exact dependencies recorded in package-lock.json.
RUN npm ci

# Copy the application source, views, assets, and configuration into the image.
COPY . .

# Compile the TypeScript source into the dist directory.
RUN npm run build

# Set the application environment inside the running container.
ENV NODE_ENV=production

# Document the port the application listens on by default.
EXPOSE 3001

# Start the compiled Express application when the container starts.
CMD ["npm", "start"]
