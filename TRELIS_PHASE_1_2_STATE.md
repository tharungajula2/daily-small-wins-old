# TRELIS LIFE - MASTER STATE & ARCHITECTURE (PHASE 1 & 2 COMPLETE)

**Last Updated:** May 2026
**Project Status:** Phase 2 Complete / Native Android Built

---

## 1. Executive Summary
**Mission:** Not a Health App. A Life Operating System. Structure for a better life.
**Execution Model:** Surgical precision, zero destructive errors, highest order of operations.
**Phase 1 Goal:** Establish an offline-first, mobile-optimized UI with persistent local state.
**Phase 2 Goal:** Build the bidirectional Sync Engine, stabilize the cloud architecture, and wrap the app for Native Android.

---

## 2. Design System: "Calm. Clear. Alive."
The UI is strictly governed by the following design system parameters. The aesthetic prioritizes minimal cognitive load, tactile mobile-first dimensions, and selective haptic feedback.

### Color Palette (Tailwind v4 tokens in `globals.css`)
*   **Canvas** (`bg-canvas` / `#F7F6F2`): Primary background. Soft off-white to reduce eye strain.
*   **Surface** (`bg-surface` / `#FFFFFF`): Elevated cards and interactive component backgrounds.
*   **Ink Primary** (`text-ink-primary` / `#1C1C1E`): High-contrast text for core readability.
*   **Ink Secondary** (`text-ink-secondary` / `#5C5C5E`): Supporting descriptive text and subtitles.
*   **Ink Tertiary** (`text-ink-tertiary` / `#9C9C9E`): Placeholders, metadata, and subtle interactive states.
*   **Ink Inverse** (`text-ink-inverse` / `#FFFFFF`): Text rendered inside dark backgrounds.
*   **Accent Teal** (`accent-teal` / `#2A7F7F`): Positive health moments, active focus states, and primary actions.
*   **Accent Amber** (`accent-amber` / `#C4841D`): Warning states and Baseline ("Minimum Viable Effort") completions.
*   **Success** (`success` / `#2A7F7F`): Completed actions, streaks, and full anchor completions.
*   **Error** (`error` / `#D14343`): Destructive actions or missed targets.
*   **Muted** (`muted` / `#EEEDE8`): Borders, dividers, and disabled interactive states.

### Typography & Layout
*   **Fonts**: Custom `var(--font-geist-sans)` for general UI, `var(--font-geist-mono)` for numbers/metrics.
*   **Hierarchy**: Strict 2-weight system (`font-normal` 400 and `font-medium` 500). Headers often use `uppercase tracking-widest text-xs`.
*   **Layout Constraint**: Mobile-first wrapper via `max-w-md mx-auto` to strictly emulate a native app structure, even on desktop browsers.

### Shapes & Shadows
*   **Border Radius**: Heavily relies on `rounded-xl` (12px) and `rounded-2xl` (16px) for cards, `rounded-full` for toggle switches and the primary ignition button.
*   **Borders**: Delicate outlines using `border border-muted` on almost all surfaces to create subtle depth without heavy drop shadows.
*   **Shadows**: Minimalist approach utilizing only `shadow-sm` on elevated surfaces.

### UX/UI Interaction Principles
*   **Animation**: `framer-motion` exclusively used for meaningful state transitions (e.g., `fade-in`, `slide-up`, `AnimatePresence` for mounting/unmounting). No decorative or infinite animations.
*   **Haptics**: `@capacitor/haptics` integration (`ImpactStyle.Light` for toggles/checks, `ImpactStyle.Medium` for major actions like FeetOnFloor or destructive actions).
*   **System 1 Design**: One-tap completion where possible. Input fields default to disabled/hidden until explicitly requested.

---

## 3. Tech Stack & Infrastructure
*   **Framework:** Next.js 16.2.6 (App Router, Turbopack).
*   **Frontend Libraries:** React 19.2.4, Tailwind CSS v4, Framer Motion ^12.38.0.
*   **State Management:** Zustand ^5.0.13 with `persist` middleware for offline-first capabilities.
*   **Mobile Wrapper:** Capacitor 6 (utilizing `@capacitor/haptics`).
*   **Backend & Auth:** Supabase PostgreSQL with RLS enabled.
*   **Authentication Flow:** 
    *   Client-side PKCE flow via `@supabase/ssr`.
    *   Magic link callback handled via client-side page at `src/app/auth/callback/page.tsx` for static build compatibility.
    *   `src/lib/supabase/client.ts` provides the browser client singleton.

---

## 4. Zustand Store Map (`useRitualStore.ts`)
The entire application state is managed by a single Zustand store, persisted locally under the key `trelis-life-ritual-storage`.

### Ephemeral State (Resets Daily)
These values track the current day's progress and are cleared when `resetDaily` is triggered:
*   `feetOnFloorLogged` (boolean) & `wakeTime` (string | null)
*   `morningCheckInDone` (boolean)
*   `sleepScore`, `moodScore` (number | null)
*   `bedTime` (string | null), `sleepDuration` (number | null)
*   `anchors`: `completed` and `usedBaseline` flags are reset to `false`.
*   `supplements`: `taken` flags are reset to `false`.
*   `eveningCheckInDone` (boolean)
*   `winOfTheDay`, `parkingLotNotes` (string)
*   `morningGut`, `eveningGut` (number | null)
*   `dailyDiscomfortLog` (string)
*   `dailyMovementNote` (string)

### Permanent State (Persists Across Days)
These values define the user's OS configuration and long-term data. They are explicitly protected from `resetDaily`:
*   `currentStreak` (number)
*   `weeklyPlantCount` (number) - Resets on a weekly basis via `completeWeeklyReview`.
*   `lastWeeklyReviewDate` (string | null) - Tracks the last Sunday review completion.
*   **Widget Configurations:** `isSupplementWidgetEnabled`, `isGutWidgetEnabled`, `isDiscomfortWidgetEnabled`, `isFoodWidgetEnabled`, `isMovementWidgetEnabled`, `isVisionEnabled`, `isNotesEnabled`.
*   **Anchor & Supplement Definitions:** The actual array items (id, title, category, baselineTitle, timing, dosage, instruction).
*   `visionText` (string): The user's permanent psychological anchor.
*   `lifeNotes` (Array): Persistent ledger for quotes and insights (`{ id, content, attribution, date }`).
*   `weeklyHistory` (Array): Historical metrics pulled from Supabase for momentum visualization.

---

## 5. Component Library & Widgets
The UI is modular, with widgets conditionally rendered on `src/app/page.tsx` based on the Zustand configuration.

*   **FeetOnFloor:** The ignition switch. A large haptic button to log wake time. Unlocks the Morning Check-in.
*   **MorningCheckIn:** Collects detailed sleep metrics (Bedtime, Hours), a 1-5 Sleep Quality score, a 1-5 Mood score, and confirms completion of a 30-min morning routine.
*   **PulseScore:** A dynamic, animated SVG ring calculating a daily health score based on check-ins and completed anchors. Color shifts from red -> amber -> green based on score.
*   **PulseSparkline:** A minimal 7-day momentum bar chart positioned under the Hero section. It visualizes daily Pulse Scores over the last week.
*   **SundayReviewModal:** An intercepting, full-screen overlay that appears only on Sundays. Forces a weekly debrief and plant count reset.
*   **Baseline Anchor Logic:** UI reflects three states: Uncompleted, Baseline (Amber), Full Completion (Green/Strikethrough).
*   **SupplementStack / SupplementManager:** Tracks AM, PM, and Evening protocols with simple toggle interactions. Upgraded to show dosage and instructions.
*   **GutJournal:** Tracks the gut-brain axis with a 1-5 scale.
*   **DiscomfortLog:** Tracks voluntary hardship (e.g., cold showers, fasting). Grants a psychological "Resilience +1".
*   **FoodDiversity:** A weekly progress bar tracking 30 unique plant sources for microbiome health.
*   **MovementLog:** A text-based logger for daily martial arts and physical sessions.
*   **VisionPriming:** A permanent, daily psychological anchor where users read their ultimate life vision. Fully editable inline.
*   **NotesOfLife:** A persistent notebook widget for quotes and insights. Entries feature content, optional attribution, Framer Motion animations, and hover-to-delete functionality.
*   **EveningCheckIn:** The shutdown sequence. Requires "One win today" (mandatory) and offers a "Parking Lot" to dump thoughts before sleep.

---

## 6. Supabase Schema & RLS
The PostgreSQL database has been successfully migrated to mirror the required state. Row Level Security (RLS) is **ACTIVE** on all tables, ensuring users can only access data where `auth.uid() = user_id`.

Below is the complete database schema layout, showing every table's columns, data types, nullability, defaults, and relations to ensure absolute clarity for database recreation from scratch:

### 1. `profiles`
Tracks user specific app-wide values (e.g. streaks).
*   `id` (`uuid`, Primary Key, references `auth.users.id` ON DELETE CASCADE)
*   `current_streak` (`integer`, default `0`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)

### 2. `daily_rituals`
Stores the core logging metrics for each day. Has a unique constraint on `(user_id, date)`.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, NOT NULL)
*   `date` (`date`, default `CURRENT_DATE`, NOT NULL)
*   `wake_time` (`timestamp with time zone`, nullable)
*   `feet_on_floor_logged` (`boolean`, default `false`, nullable)
*   `sleep_quality` (`integer`, nullable) -- Scales 1 to 5
*   `morning_mood` (`integer`, nullable) -- Scales 1 to 5
*   `morning_ritual_done` (`boolean`, default `false`, nullable)
*   `win_of_the_day` (`text`, nullable)
*   `parking_lot_notes` (`text`, nullable)
*   `pulse_score` (`integer`, default `0`, nullable)
*   `bed_time` (`text`, nullable)
*   `sleep_duration` (`numeric`, nullable)
*   `daily_discomfort_log` (`text`, nullable)
*   `daily_movement_note` (`text`, nullable)
*   `morning_gut` (`integer`, nullable) -- Scales 1 to 5
*   `evening_gut` (`integer`, nullable) -- Scales 1 to 5
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)
*   `updated_at` (`timestamp with time zone`, default `now()`, nullable)

### 3. `user_anchors`
Stores custom user habits.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, NOT NULL)
*   `title` (`text`, NOT NULL)
*   `category` (`text`, NOT NULL)
*   `baseline_title` (`text`, nullable)
*   `is_active` (`boolean`, default `true`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)

### 4. `anchor_logs`
Tracks daily completions of custom anchors. Has a unique constraint on `(user_id, anchor_id, date)`.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, NOT NULL)
*   `anchor_id` (`uuid`, references `user_anchors.id` ON DELETE CASCADE, NOT NULL)
*   `daily_ritual_id` (`uuid`, references `daily_rituals.id` ON DELETE CASCADE, nullable)
*   `date` (`date`, default `CURRENT_DATE`, nullable)
*   `completed` (`boolean`, default `false`, nullable)
*   `used_baseline` (`boolean`, default `false`, nullable)
*   `completed_at` (`timestamp with time zone`, default `now()`, nullable)

### 5. `user_supplements`
Stores supplement configurations.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, nullable)
*   `name` (`text`, NOT NULL)
*   `timing` (`text`, NOT NULL) -- AM, PM, or Evening
*   `dosage` (`text`, nullable)
*   `instruction` (`text`, nullable)
*   `is_active` (`boolean`, default `true`, nullable)
*   `sort_order` (`integer`, default `0`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)

### 6. `supplement_logs`
Tracks daily taken status for supplements. Has a unique constraint on `(user_id, supplement_id, log_date)`.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, nullable)
*   `supplement_id` (`uuid`, references `user_supplements.id` ON DELETE CASCADE, nullable)
*   `log_date` (`date`, default `CURRENT_DATE`, NOT NULL)
*   `taken` (`boolean`, default `false`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)

### 7. `user_vision`
Stores the daily psychological vision statement. Unique constraint on `user_id`.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, nullable)
*   `vision_text` (`text`, default `''::text`, nullable)
*   `updated_at` (`timestamp with time zone`, default `now()`, nullable)

### 8. `notes_of_life`
Tracks persistent journal insights.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, nullable)
*   `content` (`text`, NOT NULL)
*   `attribution` (`text`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)

### 9. `weekly_stats`
Tracks long-term statistics (like food diversity resets) per week. Has a unique constraint on `(user_id, week_start)`.
*   `id` (`uuid`, Primary Key, default `gen_random_uuid()`)
*   `user_id` (`uuid`, references `profiles.id` ON DELETE CASCADE, nullable)
*   `week_start` (`date`, NOT NULL)
*   `weekly_plant_count` (`integer`, default `0`, nullable)
*   `created_at` (`timestamp with time zone`, default `now()`, nullable)
*   `updated_at` (`timestamp with time zone`, default `now()`, nullable)

---

## 7. Phase 2 Completion Summary
**Phase 2 is officially complete.**
The application has transitioned from a local prototype to a robust, cloud-synchronized Native Android application. The core architectural challenge—bidirectional state synchronization between a persistent local store and a relational database—has been resolved via the Sync Engine.

---

## 8. Phase 2 Accomplishments & Architecture

### Track A: The Sync Engine (`syncEngine.ts`)
*   **Architecture**: A bidirectional, offline-first synchronization system built on top of Supabase PostgREST.
*   **UPSERT Pattern**: Uses flat UPSERT patterns for all logs, ensuring that network interruptions do not result in duplicate entries.
*   **Conflict Resolution**: **Local Wins.** The Zustand store acts as the primary authority during a session. On boot, `syncPullInitialState` performs a reconciliation, pulling missing cloud data to hydrate the local store while preserving un-synced local changes.
*   **Coverage**: Synchronizes 8 distinct data domains including Daily Rituals, Anchor Definitions, Anchor Logs, Supplement Metadata/Logs, Vision Text, Notes of Life, and Weekly Momentum.

### Track B: UI/UX Resurrection
*   **Three-Layer Card System**:
    *   **Primary Widgets**: Feature a dynamic `accent-teal` left-border indicator for pending tasks, providing a clear visual priority queue.
    *   **Secondary Widgets**: (Food Diversity, Discomfort, Notes, Movement) converted into **Collapsible Accordions** using Framer Motion to maximize vertical space and minimize cognitive noise.
*   **Emotional Rewards**: 
    *   Native Haptics (`ImpactStyle.Light`) triggered on successful anchor completions.
    *   Micro-animations (scale and color flashes) provide immediate dopamine feedback for completed habits.
*   **"Why This Matters" Tooltips**: Persistent, dismissible educational overlays for every major widget, explaining the biological and psychological rationale behind each habit (e.g., Vagal tone, Microbiome diversity).
*   **Supplement Upgrade**: UI now exposes `dosage` and `instruction` metadata, transforming the stack from a simple checkbox list into a professional protocol manager.

### Track C: Gamification & Reflection
*   **Pulse Sparkline**: A minimal 7-day momentum bar chart positioned under the Hero section. It visualizes daily Pulse Scores over the last week by pulling a rolling history window on startup.
*   **The Sunday Weekly Review**: An intercepting, full-screen overlay that appears only on Sundays. It forces a weekly pause to:
    *   Calculate an "Average Pulse" for the week.
    *   Reflect on "Notes of Life."
    *   Manually "Close Out" the week, which resets the plant diversity count and marks the review as complete.

### Track D: Physical Native Build
*   **Capacitor 6**: The application is wrapped for Android, providing access to native haptics and a full-screen mobile experience.
*   **Static Export**: `next.config.ts` is optimized for `output: export`, removing server dependencies and ensuring high performance on mobile devices.
*   **Custom Branding**: A custom-generated Lattice Ring logo has been integrated as the primary Android app icon and within the navigation header, cementing the Trelis Life identity.

---

## 9. Deep Learnings, Debugging Ledger & Hidden Mechanics

If at all this project ever needs to be rebuilt from absolute scratch by a beginner, this section documents the hidden engineering caveats, complex code mechanics, and the battles fought during implementation.

### A. The Pulse Score Heuristic Formula (How it Works)
The `PulseScore` widget is a dynamic, animated SVG ring calculating the daily metric. Its logic is calculated completely client-side to ensure zero lag.
*   **Base Value**: Starts at **`50`** as a standard neutral baseline.
*   **Morning Check-in Completion**: Grants a massive flat **`+20`** points once `morningCheckInDone` is true.
*   **Sleep Quality Scaling**: Scales based on the `sleepScore` value (which exists on a client-side scale of `1` to `5`):
    *   If `sleepScore > 1`, it adds `(sleepScore - 1) * 5` points.
    *   *Examples*: Sleep score of `5` (Excellent) yields `(5 - 1) * 5 = +20` points. Sleep score of `2` yields `(2 - 1) * 5 = +5` points.
*   **Morning Mood Scaling**: Mirrors the sleep heuristic based on the `moodScore` (scale `1` to `5`):
    *   If `moodScore > 1`, it adds `(moodScore - 1) * 5` points.
*   **Anchor Completion**: Every individual anchor marked completed adds a flat **`+10`** points to the pool.
*   **Upper Cap Guard**: The score is protected by `Math.min(base, 100)` to ensure it never exceeds `100%`, providing a highly satisfying visual ring when a user completes their checklist.

---

### B. Crucial Debugging Ledger & Resolution History

#### 1. The Magic Auth Link Loop (The Authentication Trap)
*   **The Symptom**: Clicking on the login link sent via email took the user back to the login screen, entering an infinite loop.
*   **The Cause**:
    1.  **Redirection mismatch**: In the Supabase Dashboard, the Allowed Redirect URI list did not match local capacitor configurations, or the magic link callback attempted to route through a Server Component handler.
    2.  **Server component routes in a static app**: Server-side next.js route handlers (`src/app/auth/callback/route.ts`) and middleware (`src/middleware.ts`) require a Node server context. When `output: 'export'` was introduced to build for Capacitor, compilation failed because a static site cannot run Node-centric API/Route handlers or Middleware.
*   **The Fix**:
    1.  **Delete** the server handler `src/app/auth/callback/route.ts` and `src/middleware.ts`.
    2.  **Rebuild** as a client-side route `src/app/auth/callback/page.tsx` using `useSearchParams()` inside a `<Suspense>` wrapper. The browser client receives the temporary `code` and exchanges it client-side with `supabase.auth.exchangeCodeForSession(code)`.

#### 2. The UUID Casting Constraint Violations
*   **The Symptom**: Console error logs displaying `Sync Engine: Push Daily Ritual Error {}` or `Sync Engine: Push Anchor Log Error {}`.
*   **The Cause**:
    1.  The Zustand store initializes default local items on client devices using alphanumeric placeholder keys (like `default-a1`, `default-s1`).
    2.  The database schema maps these identifiers to strict PostgreSQL `UUID` primary and foreign key fields.
    3.  When the sync engine attempted to execute flat `UPSERT` queries with `default-` strings, Postgres threw cast execution failures because they were not valid UUID characters.
*   **The Fix**: Added a rigid regex validation guard inside `syncEngine.ts` to inspect keys before executing pushes:
    ```typescript
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isValidUUID(id: string): boolean {
      return UUID_RE.test(id);
    }
    ```
    Any entity carrying a `default-` key is cleanly bypassed in the sync pipeline until it is updated or regenerated natively by the database.

#### 3. Foreign Key Constraint Violations (Missing Profiles & Trigger Fix)
*   **The Symptom**: Pushing logs resulted in: `insert or update on table "daily_rituals" violates foreign key constraint "daily_rituals_user_id_fkey"`.
*   **The Cause**: The database was missing matching records in the `profiles` table for registered auth users. Since `daily_rituals` references `profiles.id` as a foreign key constraint, attempts to write rituals failed.
*   **The Fix**: Executed an SQL migration to bridge the synchronization gap:
    1.  Backfilled all existing auth users into the profiles table:
        ```sql
        INSERT INTO public.profiles (id) SELECT id FROM auth.users ON CONFLICT (id) DO NOTHING;
        ```
    2.  Established a plpgsql trigger function to guarantee profiles are created automatically for every future sign-up:
        ```sql
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id) VALUES (new.id);
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        ```

#### 4. The Space-Separated `onConflict` Query Bug
*   **The Symptom**: Silent upsert crashes or syntax warnings depending on PostgREST library versions.
*   **The Cause**: Executing `.upsert(payload, { onConflict: 'user_id, date' })` with spaces in the field string caused issues.
*   **The Fix**: Standardized string separators across all sync points, removing spaces inside configuration parameters:
    *   Use `'user_id,date'` instead of `'user_id, date'`
    *   Use `'user_id,anchor_id,date'` instead of `'user_id, anchor_id, date'`
    *   Use `'user_id,supplement_id,log_date'` instead of `'user_id, supplement_id, log_date'`

---

### C. Unresolved native Issues (Problems to Fix in Future Phases)

#### 1. Android Native Icon Rendering
*   **The Problem**: Despite the local Next.js environment cleanly serving the Lattice Ring logo (`logo-transparent.png`), the native Android app package (APK/AAB) compiled via Android Studio does not display the branded icon correctly on some devices. It occasionally defaults to the fallback Capacitor logo or a generic system placeholder.
*   **Proposed Resolution (Next Build/Phase)**: 
    *   Use native icon asset generation tooling like `@capacitor/assets`.
    *   Generate precise adaptive launcher icons in density buckets (`mipmap-anydpi-v26`, `mipmap-hdpi`, `mipmap-xhdpi`, etc.) inside the Android native directory `android/app/src/main/res/`.

