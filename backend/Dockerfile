# Use the official Node.js image from Docker Hub
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your app files
COPY . .

# Expose the port your app will run on (default is 8080 for Fly)
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
