# ikcneszzs.xyz

Fullstack blog for Chinese business leaders entering Western markets: cultural intelligence, international trade, trust building, and long-term B2B growth.

## Stack

- Frontend: Vite, React, TypeScript, SCSS, client-side routing, admin panel included.
- Backend: Node.js, Express, TypeScript, PostgreSQL, Redis.
- Security: bcrypt password hash, JWT access tokens, revocable refresh tokens in httpOnly cookies, CSRF token checks for refresh/logout/admin mutations, CORS from env, rate limiting, sanitizer, audit log.
- AI: OpenRouter integration with default model `meta-llama/llama-3.1-8b-instruct`.
- Docker: separate frontend, backend, postgres, redis, env setup, and admin seed services.

## Dev Start

```bash
npm run dev:docker
```

This creates `.env`, `backend/.env`, `frontend/.env`, builds containers, starts PostgreSQL, Redis, backend on `4000`, and frontend on `3000`.

You can also run:

```bash
docker compose up --build -d
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:4000/api/health`
- Admin: `http://localhost:3000/admin`

## Superadmin

The `admin-seed` Docker service creates or updates the superadmin in PostgreSQL using `LOCAL_SUPERADMIN_EMAIL` and `LOCAL_SUPERADMIN_PASSWORD`.

Dev defaults:

```txt
admin@ikcneszzs.local
MySecretPassword123!
```

Change them in root `.env`, then rerun:

```bash
docker compose up admin-seed
```

The password is stored as a bcrypt hash, never plain text.

## Environment Setup

Real env files are ignored by git. Example files are committed:

- `.env.example`
- `.env.production.example`
- `backend/.env.example`
- `backend/.env.production.example`
- `frontend/.env.example`
- `frontend/.env.production.example`

JWT secrets are generated automatically by setup scripts.

## OpenRouter Key

Add your key once to root `.env`:

```txt
OPENROUTER_API_KEY=your_key_here
```

Then run:

```bash
npm run setup:dev-env
```

The script copies the key into `backend/.env`. Without a key, production returns a clear error. Dev mode returns a draft placeholder so the admin flow can be tested safely.

Do not run real AI generation unless you intentionally click `Generate now` or enable scheduled generation.

## Master Prompt

The default master prompt is seeded into PostgreSQL in the `admin_settings` table. The backend always reads `settings.masterPrompt` before calling OpenRouter.

To change it, open `http://localhost:3000/admin`, login as superadmin, edit `AI generation settings`, and save.

## Articles

Admin supports article list, create/edit/delete, draft/published status, local cover image selector, AI generation settings, and manual `Generate now`.

Generated articles are saved in PostgreSQL. Cover images are selected from local assets under `frontend/public/covers` and stored with each article, so old articles do not change image after later generations.

## JWT / Refresh Flow

- Login returns a short-lived access token and a CSRF token.
- Refresh token is stored as an httpOnly cookie.
- The refresh token database record stores only a hash plus CSRF token.
- Refresh and logout require `x-csrf-token`.
- Admin create/update/delete/settings/generation actions require both Bearer JWT and `x-csrf-token`.
- Logout revokes the refresh token and clears the cookie.

## Production

Create production env files:

```bash
npm run setup:prod-env
```

Review generated secrets and set `OPENROUTER_API_KEY`, production domain in `CORS_ORIGIN`, frontend `VITE_API_URL`, and strong admin credentials.

Start production compose:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

## Rebuild

```bash
npm run docker:rebuild
```

or:

```bash
docker compose down
docker compose up --build -d
```

## Troubleshooting

- Port `3000` busy: stop the process using it or change `frontend/vite.config.ts` and compose port mapping.
- Port `4000` busy: stop the process or change backend `PORT` and compose mapping.
- Database not ready: check `docker compose ps` and `docker compose logs postgres`.
- Admin login fails: inspect `docker compose logs admin-seed`, then rerun `docker compose up admin-seed`.
- AI generation fails: verify `OPENROUTER_API_KEY` exists in `backend/.env` and do not expose it in logs or frontend env.
- CORS error: check `CORS_ORIGIN` in `backend/.env`.
