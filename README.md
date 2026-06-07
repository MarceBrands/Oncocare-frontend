
# Oncology Patient Tracking App

This is a code bundle for Oncology Patient Tracking App. The original project is available at https://www.figma.com/design/ThNKvWB9MJUoMsNuAi1rHe/Oncology-Patient-Tracking-App.

## Local development with Docker

Run the app, Postgres, and migrations:

```sh
npm run dev:docker
```

The app runs at http://localhost:5173 with Vite hot reload. The local database is
available at:

```txt
postgres://oncocare:oncocare@localhost:5432/oncocare
```

Migrations live in `db/migrations` and are applied by the `migrate` service before
the app starts.

To load the prototype/demo data into the local database:

```sh
npm run db:seed
```

## Local development without Docker

Start a local Postgres instance, apply the migrations, then run:

```sh
cp .env.example .env
npm install
npm run dev
```

The Vite dev server exposes the app's local API endpoints under `/api/*`.
