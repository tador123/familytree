FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything except node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p /uploads

# Expose port
EXPOSE 3002

# Development command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
