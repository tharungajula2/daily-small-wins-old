# Trelis Life

**A calm daily structure app for capturing small wins and reflecting on the day.**

Trelis Life is a portfolio-stage Next.js application exploring a gentler alternative to rigid habit checklists. Its current interface combines morning and evening check-ins with user-created playlists for recording small wins. The browser interface persists state with Zustand. Supabase Auth and data-sync code remains in the repository as a **historical integration**; the original Supabase project has been deleted, so that backend is no longer available.

> **Project maturity:** substantial prototype / work in progress. The repository contains implemented routes, local state, authentication screens, historical database migrations, and prior cloud-sync code. The original backend is deleted. No currently working Supabase service, production readiness, or end-to-end behavior is claimed or verified.

## What is implemented

| Area | Source-backed implementation |
| --- | --- |
| Daily dashboard | Morning “feet on floor” action, sleep and mood check-in, evening reflection, progress display, and time-of-day styling |
| Small wins | User-created playlists, labeled/tagged win entries, and a wins view |
| Optional tools | Journal, to-do list, and notes routes with settings toggles |
| Account flow | Email/password sign-in and sign-up, password reset, callback, and update-password UI/code targeting Supabase Auth (historical; backend deleted) |
| Social experiment | Quiet Partner UI and historical query/RLS implementation for shared activity indicators and preset nudges; no live service is available |
| Persistence | Zustand `persist` stores app state in browser local storage; the repository retains prior Supabase sync helpers, but their backend is unavailable |

## Technology

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand 5, and Supabase (`@supabase/ssr` and `@supabase/supabase-js`). The repository also contains a web app manifest. It has no service-worker implementation, so the manifest alone does not establish offline caching or a fully offline-capable PWA.

## Run locally

Requirements for inspecting the code: a compatible Node.js/npm installation. The original Supabase project has been deleted, and the repository does not contain a complete replacement schema. Auth and cloud-connected behavior therefore cannot currently use the original backend.

1. Install dependencies with `npm install`.
2. A replacement backend would require separate provisioning and schema/security review by its owner. Do not point this project at an unrelated existing Supabase project.
3. Start the development server with `npm run dev`, then open [http://localhost:3000](http://localhost:3000). UI startup and behavior without a replacement backend have not been verified; authentication and remote data features will not connect to the deleted original project.

No dependency installation, build, lint, live-service check, or database access was performed during this documentation work. See the [Project Blueprint](./PROJECT_BLUEPRINT.md) for architecture, historical integration details, routes, data flow, debugging, and known limitations.

## Review before public use

- [`supabase/seed_phase4_protocol.sql`](./supabase/seed_phase4_protocol.sql) requires a separate public-data review to determine whether it contains personal data and whether it is safe to publish. Its contents are intentionally not reproduced here. It was not executed. No Supabase project or database was accessed.
- Historical [`USER_MANUAL.md`](./USER_MANUAL.md) and [`TRELIS_LIFE_SOURCE_OF_TRUTH.md`](./TRELIS_LIFE_SOURCE_OF_TRUTH.md) contain descriptions that do not consistently match the current code. Use the source-linked blueprint below for the current implementation audit.

## Documentation

- [Project Blueprint](./PROJECT_BLUEPRINT.md) — source-grounded beginner-to-advanced guide.
- [AGENTS.md](./AGENTS.md) — repository-specific engineering notes; some claims there are also historical and should be checked against the current code.

## License

See [LICENSE](./LICENSE).
