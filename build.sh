#!/bin/bash
cd "client"

echo "running npm install in client"
npm install
echo "package installation complete"

echo "Building client..."
npm run build 
echo "Client Build complete"

cd "../server"

echo "running npm install in server"
npm install
npm install -g typescript
echo "package installation complete"

echo "Building server..."
tsc
echo "Server Build complete"

npm start
echo "Server Started at http://localhost:4320"