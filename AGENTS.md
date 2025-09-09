# Repository Guidelines

## Project Structure & Module Organization
- `app/`: FastAPI application.
  - `main.py`: routes (`/login`, `/auth/*`, `/`, `/token`).
  - `auth.py`: JWT creation/verification, Google ID token verify, bcrypt email/password auth.
  - `search.py`: Elasticsearch client and ingestion helpers.
  - `templates/`: Jinja views (`base.html`, `login.html`, `split.html`).
  - `static/`: CSS/assets (e.g., `styles.css`).
- `scraper/`: optional scripts to ingest sample data.
- Root: `Dockerfile`, `docker-compose.yml`, `requirements.txt`, `LICENSE`.
- `tests/`: unit/integration tests as `test_*.py`.

## Build, Test, and Development Commands
- Build & start: `docker-compose up -d --build` — launches web, Elasticsearch, Kibana.
- Local dev: `ELASTICSEARCH_URL=http://localhost:9200 uvicorn app.main:app --reload` — hot-reload API.
- Logs: `docker-compose logs -f web` — tail app logs.
- Stop/clean: `docker-compose down -v` — remove containers and volumes.
- Optional ingest: `docker-compose run --rm scraper` — load sample data.
- Tests: `pytest -q` — run unit/integration tests.

## Coding Style & Naming Conventions
- Python 3.11, PEP 8, 4-space indent; prefer type hints.
- Names: functions/modules `snake_case`; classes `PascalCase`; constants `UPPER_SNAKE_CASE`.
- Templates: small, composable partials; keep responses HTMX-friendly.
- Keep changes minimal and focused; update docs when behavior changes.

## Testing Guidelines
- Framework: `pytest` + FastAPI `TestClient`.
- Naming: files `tests/test_*.py`; functions `test_*`.
- Elasticsearch: use temp indices in tests (`ES_INDEX=test_products`, `ES_USERS_INDEX=test_users`); clean up after.
- Run tests with services up to avoid network flakiness.

## Commit & Pull Request Guidelines
- Commits: imperative, concise, scoped (e.g., "add jwt auth", "scaffold workspace").
- PRs: explain what/why, run steps, screenshots for UI, link issues.
- Verify `docker-compose up -d` succeeds and auth + workspace flows before requesting review.

## Security & Configuration Tips
- Env vars: `ELASTICSEARCH_URL`, `ES_INDEX`, `ES_USERS_INDEX`, `SECRET_KEY`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`.
- Use a `.env`; never commit secrets.
- Protected endpoints: `/token`, `/me` require `Authorization: Bearer <JWT>`.
- Auth: Google (`/auth/google`) and email/password (`/auth/signup`, `/auth/login`).
- Changing ES mappings may require `docker-compose down -v` to reset local data.

