#!/bin/bash

cd ./client

echo "running npm install in client"
npm install
echo "package installation complete"

echo "Running client..."
npm run dev &
echo "Client Started at http://localhost:5173"

cd ../

echo "running npm install in server"
npm install
echo "package installation complete"

echo "Running server..."
npm run dev &
echo "Server Started at http://localhost:4320"