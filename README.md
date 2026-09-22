# tkt-webapp-react-fastapi

A Thinkube app template: a React frontend, a FastAPI backend, a PostgreSQL
database and sign-in through Keycloak.

## What it does

- **Backend** (FastAPI, Python 3.12): a task list API under `/api/v1/tasks`
  (list, create, read, update, delete), API tokens under `/api/v1/tokens`,
  and sign-in routes under `/api/v1/auth`. The OpenAPI page is at
  `/api/v1/docs`. `/health` answers the platform's health check.
- **Frontend** (React 19, TypeScript, Vite): a task page, an API tokens
  page and a sign-in page, in English, Spanish and Catalan.
- **Database**: PostgreSQL, with Alembic migrations.
- **Deployment** (`thinkube.yaml`): two containers, `backend` and
  `frontend`. `/api` goes to the backend, everything else to the frontend.
  The platform provides the database.

## How it reaches a user

A person deploys it from the Templates page in thinkube-control, part of
[Thinkube](https://github.com/thinkube/thinkube). The deploy creates the
person's own repository from this template, then builds and deploys the app.
It is not installed on its own.

The pages that teach the template live in this repository, under
`template-docs/`, and are part of the Thinkube documentation site:
[build a web app](template-docs/modules/webapp-template/pages/build-a-web-app.adoc),
[anatomy](template-docs/modules/webapp-template/pages/anatomy.adoc),
[variables](template-docs/modules/webapp-template/pages/variables.adoc).
`copier.yml` keeps `template-docs/` out of the apps made from the template.

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

Alembic runs the migrations when the backend starts (`backend/start.sh`
runs `alembic upgrade head`). If the models no longer match the migrations,
the same script generates a migration and applies it. That generated file
exists only in the running pod and is lost when the pod restarts. To keep
it, copy it from `backend/alembic/versions/` and commit it.

## Working on it

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

### Tests

Each container has a `run_tests.sh`. Without arguments it runs the whole
suite, as CI does before every build: pytest for the backend, Vitest and
React Testing Library for the frontend. Lint and type checks are not part
of that run; run them yourself (`npm run lint`, `npm run typecheck`,
`flake8`, `black`). With a file argument it runs that one test file and
nothing else:

```bash
cd backend && ./run_tests.sh tests/test_tasks.py
cd frontend && ./run_tests.sh src/pages/__tests__/HomePage.test.tsx
```

The script builds the test environment in one place: the settings in `.env.test`, and the database credentials the platform hands a test container (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). `thinkube.yaml` declares both modes under each container's `test`, and Thinkube Tandem runs single files through the same script.

## License

MIT. Code generated from this template is yours: no attribution required, and you may license the app you build however you choose. See [LICENSE](LICENSE).

Copyright Alejandro Martínez Corriá and the Thinkube contributors
