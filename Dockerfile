#Build container - because of TypeScript
FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#Prepare production Docker image w/ only /dist folder content
FROM node:14-alpine
COPY --from=build /app/dist /app
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD ["node", "app.js"]