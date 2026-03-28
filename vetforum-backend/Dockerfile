# Use the official Node.js 18 image (Alpine version for a smaller footprint)
FROM node:18-alpine

# Set the working directory directly inside the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json first to cache dependencies safely
COPY package*.json ./

# Install dependencies exclusively inside the container
RUN npm install

# Copy the rest of the backend files (ignores driven by .dockerignore)
COPY . .

# Expose port (must match your .env PORT)
EXPOSE 4000

# Finally, define the command to run the backend 
CMD ["npm", "start"]
