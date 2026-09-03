# React + FastAPI Web Application

Full-stack web application with a React frontend, FastAPI backend, PostgreSQL database, and Keycloak authentication.

This is the React version of `tkt-webapp-vue-fastapi`. Same backend, same features, same three languages — the frontend is React with the Thinkube design system instead of Vue with DaisyUI.

## Technology Stack

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS 4
- **UI**: [thinkube-style](https://github.com/thinkube/thinkube-style) — Tk components built on shadcn/ui and Radix
- **State**: Zustand
- **Routing**: React Router
- **i18n**: react-i18next (English, Spanish, Catalan)
- **Backend**: FastAPI with Python 3.12
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: Keycloak (OAuth2/OIDC)

## Layout

The app uses `TkAppLayout` from thinkube-style: a collapsible left sidebar with grouped
navigation, and a top bar carrying the page title, the language menu, the theme toggle,
and the user menu. This is the same shell Thinkube Control uses, so applications built
from this template look like the rest of the platform.

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The dev server runs on port 3000 and proxies `/api` to `http://localhost:8000`.

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

## Tests

Each container has a `run_tests.sh`. Without arguments it runs the whole suite, with coverage and lint, as CI does before every build. With a file argument it runs that one test file and nothing else:

```bash
cd backend && ./run_tests.sh tests/test_tasks.py
cd frontend && ./run_tests.sh src/pages/__tests__/HomePage.test.tsx
```

The script builds the test environment in one place: the settings in `.env.test`, and the database credentials the platform hands a test container (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). `thinkube.yaml` declares both modes under each container's `test`, and Thinkube Tandem runs single files through the same script.

Frontend tests use Vitest and React Testing Library.

## Variables the browser can read

The frontend is a static bundle, built before the deployment exists, so it
cannot read the container's environment the way the backend does. `thinkube.yaml`
names the variables it may show instead:

```yaml
containers:
  - name: frontend
    publicEnv:
      - APP_TITLE
```

The platform passes those names to the container as `PUBLIC_ENV_VARS`.
`frontend/public-config.sh` runs before nginx starts, writes the named variables
into `config.js`, and `index.html` loads it before the bundle. Read one with:

```ts
import { publicValue } from '@/lib/publicConfig'

const title = publicValue('APP_TITLE') || t('app.title')
```

Any variable the container has can be named: one the platform sets, one from
`spec.env`, one wired from `dependencies`, or a parameter answered at deploy
time. The list holds names, never values — so the values belong to the
deployment, and a template published from this app carries neither.

**This is an allow-list, and it is the only thing standing between a variable
and the public.** The container receives the whole environment, including
`POSTGRES_PASSWORD` and `KEYCLOAK_CLIENT_SECRET`. Name a variable here only when
it is safe for anyone who opens the application to read it.

Locally there is no platform, so `frontend/public/config.js` publishes nothing
and every lookup falls back to the default in the code.

## Adding a page

1. Create the component under `frontend/src/pages/`.
2. Add its route to `frontend/src/App.tsx`.
3. Add a navigation entry to `navigationItems` and its path to `NAV_ROUTES` in the same file.
4. Add the labels to all three files in `frontend/src/locales/`.

Build the UI from `thinkube-style` components (`TkCard`, `TkButton`, `TkTable`, …) rather
than raw HTML, so the app stays consistent with the rest of the platform.

## Database Migrations

Uses Alembic for database migrations. Migrations run automatically on startup.

## License

Apache License 2.0 - See [LICENSE](LICENSE)

## Copyright

Copyright 2025 Alejandro Martinez Corria
