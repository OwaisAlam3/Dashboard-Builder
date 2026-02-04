FROM node:24-bullseye

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for Prisma)
# This ensures dotenv and prisma are available
RUN npm ci --include=dev

# Copy Prisma schema first
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose ports
EXPOSE 4000 5555

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script for migrations + seed
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]