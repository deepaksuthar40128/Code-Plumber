#!/bin/bash
cd "./client"

echo "running npm install in client"
npm install
echo "package installation complete"

echo "Building client..."
npm run build 
echo "Client Build complete"


cd "../server"

echo "running npm install in api"
npm install
npm install -g typescript
echo "package installation complete"

echo "Building api..."
tsc
echo "api Build complete"


npm install -g pm2
pm2-runtime npm -- start -i max
echo "Server Started at http://localhost:4320"