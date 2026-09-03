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
