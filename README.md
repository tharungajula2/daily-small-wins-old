# Trelis Life

**A calm daily structure app for capturing small wins and reflecting on the day.**

Trelis Life is a portfolio-stage Next.js application exploring a gentler alternative to rigid habit checklists. Its current interface combines morning and evening check-ins with user-created playlists for recording small wins. Account-backed features use Supabase; a persisted Zustand store keeps the interface state in the browser.

> **Project maturity:** substantial prototype / work in progress. The repository contains implemented routes, local state, authentication screens, database migrations, and cloud-sync code. A live deployment, configured Supabase project, production readiness, and end-to-end behavior have not been independently verified.

## What is implemented

| Area | Source-backed implementation |
| --- | --- |
| Daily dashboard | Morning “feet on floor” action, sleep and mood check-in, evening reflection, progress display, and time-of-day styling |
| Small wins | User-created playlists, labeled/tagged win entries, and a wins view |
| Optional tools | Journal, to-do list, and notes routes with settings toggles |
| Account flow | Email/password sign-in and sign-up, password reset, callback, and update-password routes through Supabase Auth |
| Social experiment | Quiet Partner UI for shared activity indicators and preset nudges, backed by Supabase queries and RLS migrations |
| Persistence | Zustand `persist` stores app state in browser local storage; sync helpers read and write selected Supabase tables |

## Technology

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand 5, and Supabase (`@supabase/ssr` and `@supabase/supabase-js`). The repository also contains a web app manifest. It has no service-worker implementation, so the manifest alone does not establish offline caching or a fully offline-capable PWA.

## Run locally

Requirements: a compatible Node.js/npm installation and a configured Supabase project with the schema expected by the application.

1. Install dependencies with `npm install`.
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for your own Supabase project.
3. Apply only reviewed schema migrations to that project; do not run the seed file without a separate data-safety review.
4. Start the development server with `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

No dependency installation, build, lint, or live-service check was run during this documentation audit. See the [Project Blueprint](./PROJECT_BLUEPRINT.md) for architecture, setup details, routes, data flow, debugging, and known limitations.

## Review before public use

- [`supabase/seed_phase4_protocol.sql`](./supabase/seed_phase4_protocol.sql) requires a separate review to determine whether it contains personal data and whether it is safe to publish or execute. Its contents are intentionally not reproduced in this documentation. It was not executed, and no Supabase database was accessed.
- Historical [`USER_MANUAL.md`](./USER_MANUAL.md) and [`TRELIS_LIFE_SOURCE_OF_TRUTH.md`](./TRELIS_LIFE_SOURCE_OF_TRUTH.md) contain descriptions that do not consistently match the current code. Use the source-linked blueprint below for the current implementation audit.

## Documentation

- [Project Blueprint](./PROJECT_BLUEPRINT.md) — source-grounded beginner-to-advanced guide.
- [AGENTS.md](./AGENTS.md) — repository-specific engineering notes; some claims there are also historical and should be checked against the current code.

## License

See [LICENSE](./LICENSE).
