# TRELIS LIFE: MASTER SYSTEM STATE & CONTEXT
*This document serves as the absolute single source of truth for the Trelis Life project. Providing this file to any LLM will give it complete context of the architecture, codebase, and business logic built so far.*

## 1. PROJECT IDENTITY & CORE PHILOSOPHY
- **Name:** Trelis Life
- **Mission:** "Not a Health App. A Life Operating System. Structure for a better life." It is designed to build psychological resilience and biological stability without the anxiety of traditional health trackers.
- **Design System:** "Calm. Clear. Alive. Structure for a better life."
  - **Colors:** `bg-canvas` (#F7F6F2), `bg-surface` (#FFFFFF), `text-ink-primary` (#1C1C1E), `text-ink-secondary` (#5C5C5E), `bg-accent-teal` (#2A7F7F), `bg-accent-amber` (#D97706), `bg-success` (#10B981).
  - **Typography:** Strict limits on font weights (400 and 600 only) using modern sans-serif.
  - **System 1 Design:** Frictionless, one-tap interactions. Never force a user to type if a tap will do.
  - **"Blank Slate" & "Smart Defaults":** No prescriptive medical protocols. New users get universal baseline defaults (e.g., Hydration, Morning Sunlight) that they can later customize or delete to avoid "Blank Canvas Paralysis".

## 2. STRICT TECH STACK
- **Frontend:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS v4 + Framer Motion (for purposeful transitions, slide-ups, fade-ins).
- **State Management:** Zustand + `persist` middleware. This creates an **Offline-First** architecture. The app works flawlessly without the internet.
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS).
- **Mobile Wrapper:** Capacitor 6 (specifically using `@capacitor/haptics` for native tactile feedback, utilizing `ImpactStyle.Light` and `ImpactStyle.Medium`).

## 3. THE DAILY FOGG BEHAVIORAL LOOP (UI FLOW)
The main interface (`src/app/page.tsx`) acts as a dynamic state machine that conditionally renders components based on the user's progress through the day:
1. **Wake Up:** The user sees a single, massive button: `<FeetOnFloor />`. Tapping it logs the exact wake time.
2. **Morning Check-In:** The user is immediately routed to `<MorningCheckIn />`. Here, they log detailed sleep metrics (Bedtime, Duration in hours), a 1-5 emoji Sleep Quality score, a 1-5 emoji Mood score, and check off a 30-minute "Morning Ritual" box.
3. **The Dashboard (Widget OS):** Once the morning is cleared, the main dashboard unlocks. It features the `<PulseScore />` at the top, followed by the Daily Anchors and the active biological/psychological widgets.
4. **Evening Wind-Down:** At the bottom, the user can trigger `<EveningCheckIn />` to log the "Win of the Day" and "Parking Lot Notes" (brain dump for sleep). Completing this locks the dashboard and shows a "Day Complete" moon screen until tomorrow.

## 4. ZUSTAND STORE: THE BRAIN (`useRitualStore.ts`)
All data lives in a single local persisted store. Here is the exact schema of everything tracked:

### Core Loop & Sleep Metrics
- `feetOnFloorLogged: boolean`, `wakeTime: string | null`
- `morningCheckInDone: boolean`, `eveningCheckInDone: boolean`
- `currentStreak: number`
- `sleepScore: number | null` (1-5), `moodScore: number | null` (1-5)
- `bedTime: string | null` (e.g., '22:30'), `sleepDuration: number | null` (e.g., 7.5)

### Custom Anchors (Habits)
- **State:** `anchors: Anchor[]` (Interface: `id`, `title`, `category` (body/mind), `completed`)
- **Actions:** `toggleAnchor(id)`, `addAnchor(title, category)`, `removeAnchor(id)`
- *Note:* New anchors generate IDs using `crypto.randomUUID()`.

### Custom Supplements
- **State:** `supplements: Supplement[]` (Interface: `id`, `name`, `timing` ('AM'|'PM'|'Evening'), `taken`)
- **Actions:** `toggleSupplement(id)`, `addSupplement(name, timing)`, `removeSupplement(id)`

### Gut-Brain Journal
- **State:** `morningGut: number | null`, `eveningGut: number | null`
- **Actions:** `logMorningGut(score)`, `logEveningGut(score)`
- *Note:* Universal terminology used (e.g., "Digestion & Calm", "Vagal Tone / Comfort").

### Discomfort Log
- **State:** `dailyDiscomfortLog: string`
- **Actions:** `logDiscomfort(log)`
- *Note:* Tracks voluntary hardship to build psychological resilience.

### Food Diversity
- **State:** `weeklyPlantCount: number` (Max 30)
- **Actions:** `incrementPlantCount()`
- *Note:* Resets weekly, NOT daily. A framer-motion progress bar gamifies plant intake without calorie counting.

### Movement Log
- **State:** `dailyMovementNote: string`
- **Actions:** `logMovement(note)`
- *Note:* Tracks martial arts techniques or Zone 2 cardio sessions.

### Widget OS Toggles (Master Config)
- **States:** `isSupplementWidgetEnabled`, `isGutWidgetEnabled`, `isDiscomfortWidgetEnabled`, `isFoodWidgetEnabled`, `isMovementWidgetEnabled`.
- **Actions:** Functions to toggle each boolean.
- *Note:* Users configure their dashboard via the `<WidgetManager />` overlay summoned by the ⚙️ icon.

### Reset Protocol
- `resetDaily()` purges ephemeral data (scores, check-ins, logs, anchor/supplement completions) but deliberately **retains** the `weeklyPlantCount` and the user's custom arrays (the actual lists of anchors and supplements).

## 5. COMPONENT LIBRARY INVENTORY
Everything is built and fully functional in `src/components/`:
- **Core:** `PulseScore.tsx` (Calculates dynamically: Base 50 + 20 for check-in + (sleep-1)*5 + (mood-1)*5 + (anchors*10). Max 100), `AnchorCard.tsx`.
- **Rituals:** `FeetOnFloor.tsx`, `MorningCheckIn.tsx`, `EveningCheckIn.tsx`.
- **Widgets:** 
  - `AnchorManager.tsx` (CRUD overlay for anchors)
  - `SupplementManager.tsx` (CRUD overlay for supplements)
  - `SupplementStack.tsx` (Renders supplements filtered by timing)
  - `GutJournal.tsx` (1-5 biological scale)
  - `DiscomfortLog.tsx` (Edit/View state text input for hardship)
  - `FoodDiversity.tsx` (Progress bar out of 30)
  - `MovementLog.tsx` (Edit/View state for physical training)
  - `WidgetManager.tsx` (OS Configuration panel with iOS-style pill toggles)

## 6. SUPABASE & DATABASE SYNC STATUS (EDGE OF PHASE 2)
The application has a robust optimistic UI architecture. 
- The `completeMorningCheckIn` and `completeEveningCheckIn` actions in Zustand instantly update the local UI and then attempt an async `upsert` to Supabase's `daily_rituals` table.
- **"Test Mode" Failsafe:** Because authentication is not yet built, the system catches the `null` session via `supabase.auth.getSession()` and gracefully exits the database sync, relying entirely on the local Zustand persist. The app does not crash.

### IMMEDIATE NEXT STEPS FOR PHASE 2:
1. **Supabase Auth Integration:** Build out `/(auth)` routes (Login/Signup) to generate valid user sessions.
2. **Database Schema Migrations:** The Supabase PostgreSQL database currently lacks columns for the vast majority of our newly built features (e.g., `bed_time`, `sleep_duration`, `daily_discomfort_log`, `weekly_plant_count`, `daily_movement_note`, and the arrays/JSONB for custom anchors and supplements). We MUST execute DDL migrations before the backend sync will function.
