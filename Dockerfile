FROM node:20.20.0-alpine

WORKDIR /app

# Install vim for debugging if needed (optional)
RUN apk add --no-cache vim

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

CMD [ "npm", "run", "dev" ]

EXPOSE 3000