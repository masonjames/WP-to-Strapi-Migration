# Dockerfile

FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install --only=production

# Bundle app source
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD [ "node", "dist/server.js" ]