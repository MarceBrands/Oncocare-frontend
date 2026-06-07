#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "Waiting for Postgres..."
until psql "$DATABASE_URL" -c "select 1" >/dev/null 2>&1; do
  sleep 1
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  )
"

for file in /migrations/*.sql; do
  [ -e "$file" ] || continue

  version="$(basename "$file" .sql)"
  applied="$(psql "$DATABASE_URL" -tAc "select 1 from schema_migrations where version = '$version'")"

  if [ "$applied" = "1" ]; then
    echo "Skipping $version"
    continue
  fi

  echo "Applying $version"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "insert into schema_migrations (version) values ('$version')"
done

echo "Migrations complete."

