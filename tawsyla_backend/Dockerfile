# Use the official Node.js image as a base
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force 


# Copy the rest of the application files
COPY . .

RUN npm run postinstall

# Build the NestJS application
RUN npm run build

# Expose the port that the app will run on
EXPOSE 3000

# Run the app
# CMD ["sh", "-c", "npm run schema:drop && npm run migration:run && npm run seed:run:relational && npm run start:prod"]
# CMD ["sh", "-c", "npm run migration:run && npm run seed:run:relational && npm run start:prod"]
# CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]

CMD ["npm", "run", "start:prod"]
