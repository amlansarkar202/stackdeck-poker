FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build React dist
COPY . .
RUN node ./node_modules/vite/bin/vite.js build

ENV NODE_ENV=production

# Start production server
CMD ["node", "server/index.js"]
