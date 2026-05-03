# Reflectly Smart Daily Diary & Wellness Platform

Reflectly is a multi-app wellness platform for daily journaling, mood tracking, media uploads, and admin oversight. The repository contains:

- `backend`: Express + Prisma API with authentication, diary, feedback, chat, tags, uploads, and Prometheus metrics.
- `admin`: Vite + React dashboard for managing the platform.
- `reflectly`: Expo mobile app for the end-user experience.
- `docker-compose.yml`: Local container stack for the API, frontend, PostgreSQL, Prometheus, and Grafana.

## Project Layout

```text
.
├── admin/        # React admin dashboard
├── backend/      # Express API + Prisma
├── reflectly/    # Expo mobile app
├── grafana/      # Grafana provisioning
├── shared/       # Shared frontend constants
├── docker-compose.yml
├── prometheus.yml
└── README.md
```

## Features

- Daily diary entries with tags, mood scores, summaries, and image uploads.
- User authentication and app lock support.
- Feedback collection.
- Admin dashboard for monitoring and moderation.
- Prometheus metrics exposed by the backend.
- Grafana dashboards with Prometheus as the default datasource.

## Prerequisites

- Docker Desktop if you want the full stack in containers.
- Node.js 20+ and npm for local development.
- Expo Go or an emulator/simulator for the mobile app.

## Run With Docker

The root compose file starts everything:

- PostgreSQL on `5432`
- Backend API on `5000`
- Admin frontend on `5173`
- Prometheus on `9090`
- Grafana on `3000`

### Start the stack


```bash
docker compose up --build
```

### Stop the stack

```bash
docker compose down
```

### Remove volumes too

```bash
docker compose down -v
```

### Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

### Default Grafana login

- Username: `admin`
- Password: `admin`

## Local Development

If you prefer running each app directly on your machine, install dependencies inside each folder.

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend reads environment variables from `backend/.env`. At minimum, it needs `DATABASE_URL` and `DIRECT_URL` when running outside Docker.

### Admin dashboard

```bash
cd admin
npm install
npm run dev
```

The admin app uses `VITE_API_URL`, `VITE_GRAFANA_URL`, and `VITE_GRAFANA_DASHBOARD_URL` when set. If they are not provided, it falls back to the defaults in `shared/backendUrl.js`.

### Mobile app

```bash
cd reflectly
npm install
npx expo start
```

You can also use:

- `npm run android`
- `npm run ios`
- `npm run web`

## Environment Notes

### Backend

The backend uses `backend/.env` for API and database settings, plus integrations such as email and AI features. Keep secrets out of source control if you replace the sample values.

### Frontend

The admin app builds against the API URL available at build time. In Docker, that is set automatically by the compose file.

### Monitoring

Prometheus scrapes the backend metrics endpoint at `/metrics`. Grafana is pre-provisioned with Prometheus as the default datasource.

## Useful Commands

### Backend

```bash
npm run prisma:generate
npm run dev
npm start
```

### Admin

```bash
npm run dev
npm run build
npm run preview
```

### Mobile

```bash
npm start
npm run lint
```

## Troubleshooting

- If the backend cannot connect to the database in Docker, make sure the Postgres container is healthy and that you started the stack from the repository root.
- If the admin app points to the wrong API URL, rebuild the frontend image or adjust `VITE_API_URL`.
- If Grafana shows no data, confirm that Prometheus is running and that it can reach the backend container at `backend:5000`.

## License

No license file is included in this repository.
