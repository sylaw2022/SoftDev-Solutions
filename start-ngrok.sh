#!/bin/bash

# Script to start ngrok tunnel for Next.js development server
# Usage: ./start-ngrok.sh [port]
# Default port: 3000

PORT=${1:-3000}
echo "Starting ngrok tunnel on port ${PORT}..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ERROR: ngrok is not installed or not in PATH"
    echo "Install ngrok from: https://ngrok.com/download"
    exit 1
fi

# Check if port is already in use
if ! lsof -ti:${PORT} > /dev/null 2>&1; then
    echo "WARNING: Port ${PORT} is not in use."
    echo "Make sure your Next.js server is running on port ${PORT} before starting ngrok."
    echo ""
    echo "To start the server, run:"
    echo "  npm run dev    (for development)"
    echo "  npm run start  (for production build)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Creating ngrok tunnel..."
echo "Your Next.js app should be accessible at the URL shown below"
echo "Press Ctrl+C to stop ngrok"
echo ""

# Start ngrok tunnel
ngrok http ${PORT}

