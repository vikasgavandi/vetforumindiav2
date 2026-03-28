# Simplified Node-based Dockerfile for Frontend
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose the Vite preview port (usually 4173) or 80
EXPOSE 80

# The startup command is now handled by docker-compose.yml
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
