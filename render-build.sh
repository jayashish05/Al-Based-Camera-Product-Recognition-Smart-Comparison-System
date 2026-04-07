#!/bin/bash
# Render build script for Next.js standalone deployment
# This script runs after `npm run build` to copy static assets

echo "📦 Copying static assets for standalone deployment..."

# Copy public directory to standalone
cp -r public .next/standalone/public 2>/dev/null || echo "No public dir to copy"

# Copy static files to standalone
cp -r .next/static .next/standalone/.next/static 2>/dev/null || echo "No static dir to copy"

echo "✅ Build complete! Ready for deployment."
