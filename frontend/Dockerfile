# frontend/Dockerfile
FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]