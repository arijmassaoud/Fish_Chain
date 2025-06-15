FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --include=dev
RUN npm install --save-dev @types/express
RUN npm install --save-dev @types/bcryptjs
# Copy source code (including prisma/)
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Start app
CMD ["node", "dist/index.js"]