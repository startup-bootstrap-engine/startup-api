#!/bin/bash

set -e

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "localhost" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "✅ PostgreSQL is up - running Prisma migrations"

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏃‍♂️ Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Prisma migrations completed"
