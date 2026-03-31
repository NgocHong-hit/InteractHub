#!/bin/bash
echo "Applying EF Core Migrations..."
cd ../backend/InteractHub.API
dotnet ef database update
echo "Database migrated successfully!"