#!/bin/bash

# Build verification
echo "Verifying build requirements..."
npm run verify

# Build frontend
echo "Building frontend..."
npm run build

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production

# Run database migrations (if any)
echo "Running database migrations..."
npm run migrate

# Start the application
echo "Starting the application..."
npm start 