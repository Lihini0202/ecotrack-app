# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (if you have one, e.g., 5000)
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
