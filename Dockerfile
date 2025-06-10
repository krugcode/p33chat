FROM node:20-alpine 
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 5173

# Development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
