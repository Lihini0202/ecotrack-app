# Use the official Node.js image from Docker Hub
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY backend/package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your app files from the backend directory
COPY backend/ .

# Expose the port your app will run on (use port 5000 if that's what you're exposing)
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
