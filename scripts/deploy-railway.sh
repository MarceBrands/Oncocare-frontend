#!/usr/bin/env sh
set -eu

PROJECT_NAME="${RAILWAY_PROJECT_NAME:-oncocare-demo}"
APP_SERVICE="${RAILWAY_APP_SERVICE:-oncocare-app}"
POSTGRES_SERVICE="${RAILWAY_POSTGRES_SERVICE:-Postgres}"
APP_PORT="${RAILWAY_APP_PORT:-5173}"
RAILWAY_REGION="${RAILWAY_REGION:-us-west}"

if ! command -v railway >/dev/null 2>&1; then
  echo "railway CLI was not found in PATH." >&2
  exit 1
fi

has_service() {
  node -e "
    const services = JSON.parse(process.argv[1]);
    const name = process.argv[2];
    const list = Array.isArray(services) ? services : services.services || [];
    process.exit(list.some((service) => service.name === name) ? 0 : 1);
  " "$1" "$2"
}

find_postgres_service() {
  node -e "
    const services = JSON.parse(process.argv[1]);
    const list = Array.isArray(services) ? services : services.services || [];
    const service = list.find((item) => item.name === process.argv[2])
      || list.find((item) => /postgres/i.test(item.name));
    if (!service) process.exit(1);
    console.log(service.name);
  " "$1" "$2"
}

find_service_url() {
  node -e "
    const services = JSON.parse(process.argv[1]);
    const list = Array.isArray(services) ? services : services.services || [];
    const service = list.find((item) => item.name === process.argv[2]);
    if (!service?.url) process.exit(1);
    console.log(service.url);
  " "$1" "$2"
}

if ! railway status --json >/dev/null 2>&1; then
  echo "Creating Railway project: $PROJECT_NAME"
  railway init --name "$PROJECT_NAME" --json >/dev/null
fi

services_json="$(railway service list --json)"

if ! has_service "$services_json" "$APP_SERVICE"; then
  echo "Creating app service: $APP_SERVICE"
  railway add --service "$APP_SERVICE" --json >/dev/null
fi

services_json="$(railway service list --json)"

if ! find_postgres_service "$services_json" "$POSTGRES_SERVICE" >/dev/null 2>&1; then
  echo "Creating Railway Postgres service"
  railway add --database postgres --json >/dev/null || true
fi

services_json="$(railway service list --json)"
POSTGRES_SERVICE="$(find_postgres_service "$services_json" "$POSTGRES_SERVICE")"

echo "Configuring app variables"
railway variable set \
  --service "$APP_SERVICE" \
  --skip-deploys \
  "PORT=$APP_PORT" \
  "NODE_ENV=production" \
  "RAILWAY_DEPLOYMENT_OVERLAP_SECONDS=0" \
  "DATABASE_URL=\${{$POSTGRES_SERVICE.DATABASE_URL}}" \
  --json >/dev/null

echo "Scaling app service to one replica in $RAILWAY_REGION"
railway scale --service "$APP_SERVICE" "$RAILWAY_REGION=1" --json >/dev/null

echo "Deploying $APP_SERVICE"
railway up --service "$APP_SERVICE" --message "Deploy OncoCare demo"

services_json="$(railway service list --json)"

if app_url="$(find_service_url "$services_json" "$APP_SERVICE" 2>/dev/null)"; then
  echo "Railway test domain: $app_url"
else
  echo "Creating Railway test domain"
  railway domain --service "$APP_SERVICE" --port "$APP_PORT" --json
fi
