FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

# Copy over the server source code
# NOTE: The added ./ before server allowed to build the image sucessfully.
COPY server/ ./server/

# Build the server
WORKDIR /app/server
RUN npm run build

EXPOSE 3000

# Command Docker runs when it starts the container.
# In our case, this command is specified in server/package.json
# which does migrations and then starts the server.
CMD ["npm", "run", "prod"]

