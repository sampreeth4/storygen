# # Step 1: Build the frontend
# FROM node:18 as build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # Step 2: Serve frontend with Nginx
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# ============================
# Step 1: Build the Frontend
# ============================
FROM public.ecr.aws/docker/library/node:18 AS build

WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install 

# Copy all source files and build
COPY . .
RUN npm run build

# ============================
# Step 2: Serve with Nginx
# ============================
FROM public.ecr.aws/docker/library/nginx:alpine

# Copy build output to Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

