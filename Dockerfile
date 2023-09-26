# Use an official Node.js runtime as a base image (alpine is a lightweight choice)
FROM node:14-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the compiled TypeScript code (from your local /dist directory) to the container
COPY . .

# Build app
RUN npm run build

# Expose a port (if your app listens on a specific port)
#EXPOSE 3000

# Start your Node.js application
#CMD ["node", "./dist/index.js"]

FROM node:14-alpine
COPY --from=build /app/dist /app
CMD ["node", "app.js"]

