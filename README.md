# Daymark Task Tracker

A React + TypeScript task tracker with an Express backend-for-frontend (BFF). Organize work into projects, set due dates and priorities, track status, and review a dashboard of upcoming and overdue tasks.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The development script starts the Express API and Vite together; Vite forwards `/api` requests to the BFF on `127.0.0.1:4318`.

### Demo sign-in

- Email: `demo@daymark.local`
- Password: `daymark-demo-123`

The demo account is prefilled on the login page. Select **Register** there to create a separate account with its own initially empty task and project workspace. Account records and workspace state are stored in `data/state.json` and persist between restarts; passwords are stored as scrypt hashes with per-account salts.

## App structure

```text
src/
  App.tsx                  Application shell, navigation, auth, and API state
  api.ts                   Typed client for the BFF
  types.ts                 Shared domain types
  components/TaskForm.tsx  Reusable create/edit task form
  pages/                   Dashboard, tasks, projects, settings, and login
server/
  index.js                 Express app and API route wiring
  controllers/             Five focused API controllers
  middleware/              Session authentication
  store.js                 Local JSON persistence and seed data
```

The five Express controllers are authentication, tasks, projects, dashboard, and profile/workspace preferences. The frontend uses Material UI for its layout, forms, navigation, tables, cards, and notifications.

## Useful commands

```sh
npm run typecheck  # TypeScript check for the React frontend
npm run build      # Build the frontend into dist/
NODE_ENV=production npm start  # Serve the production build and API
```

For deployment, set `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_PASSWORD_SALT`, and a long random `SESSION_SECRET`. The built-in demo login and local JSON store are intended for a starter project, not a multi-user production service.
