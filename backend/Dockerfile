FROM node:24-bullseye

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema first
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]
