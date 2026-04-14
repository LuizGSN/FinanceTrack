#!/bin/bash

# FinanceTrack - Setup and Run Tests

echo "📦 Installing dependencies..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo ""
echo "🧪 Running Backend Tests..."
cd backend
npm test -- --passWithNoTests
cd ..

echo ""
echo "🧪 Running Frontend Tests..."
cd frontend
npm test -- --passWithNoTests
cd ..

echo ""
echo "✅ Tests completed!"
echo ""
echo "📚 Documentation: http://localhost:3000/api/docs (após iniciar o backend)"
echo "📝 Logs estarão em: backend/logs/"
