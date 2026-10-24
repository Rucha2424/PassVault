FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install curl for health check
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code with correct ownership
COPY --chown=node:node . .

# Run as non-root user
USER node

# Health check endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
