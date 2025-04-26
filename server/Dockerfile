FROM node:20-alpine

WORKDIR /app

# Dynamically create package.json
RUN npm init -y && \
    npm install express node-fetch

# Copy your server source code
COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
