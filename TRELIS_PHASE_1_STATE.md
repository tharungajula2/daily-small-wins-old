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

**Migrated Tables:**
1.  `profiles`: User metadata and `current_streak`.
2.  `daily_rituals`: Core daily logs (`wake_time`, `sleep_quality`, `morning_mood`, `win_of_the_day`, `pulse_score`, `bed_time`, `sleep_duration`, `morning/evening_gut`, `daily_discomfort_log`, `daily_movement_note`).
3.  `user_anchors`: Definitions of habits (`title`, `category`, baseline support pending schema addition).
4.  `anchor_logs`: Daily completion tracking.
5.  `weekly_stats`: Tracks `weekly_plant_count`.
6.  `user_supplements`: Supplement definitions (`timing: AM/PM/Evening`).
7.  `supplement_logs`: Daily taken status.
8.  `user_vision`: Stores the permanent `vision_text`.
9.  `notes_of_life`: Stores individual notes (`content`, `attribution`).

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
