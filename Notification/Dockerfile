FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port (for WebSocket)
EXPOSE 3001

# Start the worker
CMD ["node", "worker.js"]
