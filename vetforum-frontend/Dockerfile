# Build stage: Compile Vite/React App with Node
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage: Serve via Nginx
FROM nginx:alpine

# Copy the build artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for routing proper SPA falls
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx Server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
