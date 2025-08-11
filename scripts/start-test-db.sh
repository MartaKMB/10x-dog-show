#!/bin/bash

# Script to start dedicated test database for E2E tests

echo "🧪 Starting dedicated test database..."

# Load test environment variables
if [ -f .env.test ]; then
  echo "📋 Loading .env.test configuration..."
  export $(cat .env.test | grep -v '^#' | xargs)
else
  echo "❌ .env.test not found!"
  exit 1
fi

# Stop any existing Supabase instances
supabase stop

# Start Supabase with test configuration
supabase start --config-file=supabase.test.toml

echo "✅ Test database started on port ${SUPABASE_DB_PORT:-54323}"
echo "🔗 API URL: ${SUPABASE_URL:-http://127.0.0.1:54321}"
echo "🔗 DB URL: postgresql://postgres:postgres@127.0.0.1:${SUPABASE_DB_PORT:-54323}/postgres"
echo "🔗 Studio URL: http://127.0.0.1:54327"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Reset database and apply schema
echo "🔄 Resetting test database..."
supabase db reset --config-file=supabase.test.toml

echo "✅ Test database is ready!"
echo ""
echo "To run tests with test database:"
echo "  TEST_ENVIRONMENT=test npm run test:e2e"
echo ""
echo "To stop test database:"
echo "  supabase stop --config-file=supabase.test.toml"
