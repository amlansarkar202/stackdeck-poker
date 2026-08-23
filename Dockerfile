FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files and pre-built assets
COPY . .

# Expose standard port
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

# Start production server
CMD ["node", "server/index.js"]
