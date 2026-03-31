#!/bin/bash
echo "Deploying InteractHub..."

# Ví dụ deploy backend
cd ../backend/InteractHub.API
dotnet publish -c Release -o ./publish
# Sau đó upload folder ./publish lên Azure App Service

# Ví dụ deploy frontend
cd ../../frontend
npm run build
# Upload folder build/ lên Azure Storage hoặc App Service