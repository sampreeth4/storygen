# Use Node.js base image
# FROM node:18
FROM public.ecr.aws/docker/library/node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
# RUN npm install
RUN npm install 

# Copy rest of the backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]

