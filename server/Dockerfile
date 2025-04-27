# Use a minimal Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json first, for Docker layer caching
COPY package.json ./

# DELETE
# Use faster mirror
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories

# Install dependencies
RUN npm install

# Now copy the rest of the server source
COPY . .

# DELETE
RUN apk add --no-cache curl

# Expose the port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
