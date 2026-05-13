<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TRELIS LIFE - MASTER ENGINEERING RULES

## 1. PROJECT IDENTITY & MISSION
- **Name:** Trelis Life
- **Core Philosophy:** "Not a Health App. A Life Operating System. Structure for a better life."
- **Execution Mode:** Surgical precision, zero destructive errors, highest order of operations.

## 2. TECH STACK (STRICTLY ENFORCED)
- **Frontend:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS + Framer Motion.
- **State Management:** Zustand + Zustand persist (offline-first).
- **Backend/Database:** Supabase (PostgreSQL + Auth + RLS + Realtime).
- **Mobile Wrapper:** Capacitor 6 for Android.
- **AI:** NO AI features in the product version 1.

## 3. SUPABASE MCP & DATABASE RULES
- **Destructive Actions Forbidden:** NEVER drop tables or delete columns that contain user data.
- **Migration Protocol:** All database changes must be additive (e.g., adding new columns). Protect the user's streaks and historical data at all costs.
- **Row Level Security (RLS):** All tables must have strict RLS policies ensuring users can only access their own data via `auth.uid() = user_id`.

## 4. UI/UX DESIGN SYSTEM: "Calm. Clear. Alive. Structure for a better life."
Every component must follow these exact Tailwind principles:
- **Mobile-First:** Design exclusively for mobile dimensions first.
- **Color Tokens:**
  - `bg-canvas` (#F7F6F2) for main backgrounds.
  - `bg-surface` (#FFFFFF) for cards.
  - `text-ink-primary` (#1C1C1E) for main text.
  - `text-ink-secondary` (#5C5C5E) for supporting text.
  - `bg-accent-teal` (#2A7F7F) for positive health moments.
- **Typography:** Never use more than two font weights (400 and 600) per screen.
- **Animation:** Use Framer Motion for meaningful transitions (fade-ins, slide-ups). Never animate purely for decoration. Respect `Reduce Motion` settings.

## 5. DEVELOPMENT WORKFLOW
- **One Step at a Time:** Do not attempt to build 10 files at once. Build one feature, test it, lock it, and move to the next.
- **System 1 Design:** User interactions must be frictionless (e.g., one tap instead of typing whenever possible).
- **Environment:** Distinguish between local development and production. Ensure code does not break upon Vercel deployment.
