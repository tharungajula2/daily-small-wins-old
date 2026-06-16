# TRELIS LIFE — THE DEFINITIVE SYSTEM BLUEPRINT & SOURCE OF TRUTH

> **Document Version:** 2.0.0  
> **Last Updated:** June 2026  
> **Philosophy:** "Structure for a better life."  

---

## 1. PROJECT EXECUTIVE SUMMARY & PRODUCT IDENTITY

Trelis Life is a premium daily routine companion designed to instill structural clarity into a chaotic existence. It rejects standard quantified-self metrics, gamified pressure, and alarmist notifications in favor of a clinical, calm, and structured habit check-in flow.

**Architectural Pivot (v2.0.0):** The application is now a **100% Progressive Web App (PWA)**. All `@capacitor` and native Android wrappers have been eradicated. The app runs optimally when added to the user's home screen via mobile Safari/Chrome, functioning as a standalone native-like experience.

### Core Philosophy: "The Calm-Game Law"
1. **Subtraction over Addition**: Features are kept minimal, self-evident, and focused. There are no waitlists, monetization hooks, or commercial tiers.
2. **Anti-Quantified-Self Metrics**: The system forbids displaying raw, anxious counts (such as "7,432 steps") on primary dashboards. Metrics are mapped to simple binary progress indicators or concentric progress arcs.
3. **Aesthetic Dominance**:
   - `bg-canvas` (`#F7F6F2`): A high-end, slightly warm, museum-grade canvas background.
   - `bg-surface` (`#FFFFFF`): Pristine white cards casting diffused, soft shadows.
   - `text-ink-primary` (`#1C1C1E`): Solid, readable near-black.
   - `text-ink-secondary` (`#5C5C5E`): Muted grey for supporting text.
   - `bg-accent-teal` (`#2A7F7F`): Luxurious warm teal reserved for positive structural moments.
4. **Grayscale Visual Muting**: Secondary elements and inactive options fade into elegant low-contrast grayscale mode rather than using bright alerts or red warnings.
5. **Motion Dampening**: Every animation is powered by `framer-motion` and conforms to a standard spring configuration to ensure smooth, non-distracting visual transitions:
   ```typescript
   export const TRELIS_SPRING_CONFIG = {
     type: "spring",
     stiffness: 300,
     damping: 30
   };
   ```
6. **Two Font-Weights Rule**: Never use more than two font weights (400 and 600) on any single screen.
7. **Unified Local Timezone Rule**: All date-string evaluations, log indexing, and review conditions strictly use device local time via `toLocaleDateString('en-CA')` (YYYY-MM-DD local format). This completely eliminates off-by-one or dropped-logs bugs common with UTC-based date operations.
   - **Playlists (Anchors)**: The primary container mechanism. Rather than a checklist of habits to "complete", users maintain Playlists (categories like 'Body-Mind').
   - **Gems (Small Wins)**: Users capture "Gems" within Playlists to track positive structural moments. The total number of Gems ever captured represents the user's "Total Wins".
   - **The Arc**: The keystone of the day, tracking Morning and Evening bookend rituals. 
   - **The Vault**: A chronological ledger of all Gems, Wins of the Day, and Debrief Reflections. No binary pass/fail metrics are displayed.

The legacy six Mutually Exclusive, Collectively Exhaustive (MECE) pillars (Nutrition, Movement, Sleep, Stress/Mental, Social, Environment) and binary "Promises/Keeps" architecture have been completely purged from the application layer. Instead of rigid folders, checkboxes, or completion metrics, the app is centered on:
1. **The Arc**: The permanent, non-deletable daily keystone anchor containing the night-to-morning cycle.
2. **Playlists (Custom Categories)**: Up to 4 custom, user-defined Playlists (soft cap of 5 total including The Arc) acting as containers to capture positive "Gems" throughout the day.

---

### Production Dependencies & Build Environment
Extracted exactly from `package.json`:

*   **Production Dependencies:**
    - `next`: `16.2.6` (React 19.2.4 & React-DOM 19.2.4)
    - `zustand`: `^5.0.13`
    - `framer-motion`: `^12.38.0`
    - `lucide-react`: `^1.16.0`
    - `@supabase/ssr`: `^0.10.3`
    - `@supabase/supabase-js`: `^2.105.4`
    - `date-fns`: `^4.1.0`
*   **Development Dependencies:**
    - `typescript`: `^5`
    - `@tailwindcss/postcss`: `^4`
    - `tailwindcss`: `^4`
    - `eslint`: `^9`
    - `eslint-config-next`: `16.2.6`

---

## 2. DATABASE SCHEMAS & RLS (SUPABASE)

- **Supabase Project Reference:** `lhqtqofjrqoyscobsfud`
- **Database Engine:** PostgreSQL 15

### Relational Schema Blueprint

#### Table 1: `public.user_anchors`
Stores the default or user-defined habit anchors.
```sql
CREATE TABLE public.user_anchors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    pillar_id text CHECK (pillar_id IN ('nutrition', 'movement', 'sleep', 'stress_mental', 'social', 'environment')), -- Deprecated in v2.0.0
    type text, -- Deprecated in favor of Keep + Gather model
    prompt text,
    baseline_title text, -- Deprecated in favor of Keep + Gather model
    baseline_target integer, -- Deprecated in favor of Keep + Gather model
    is_active boolean DEFAULT true,
    frequency text[] DEFAULT '{all}'::text[],
    sub_items jsonb DEFAULT '[]'::jsonb, -- Deprecated in favor of Keep + Gather model
    codename text,
    keep_definition text,
    is_permanent boolean DEFAULT false
);
```

#### Table 2: `public.anchor_keeps`
Tracks completed Keep layers for anchors (one-tap checkbox log).
```sql
CREATE TABLE public.anchor_keeps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id uuid REFERENCES public.user_anchors(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, anchor_id, log_date)
);
```

#### Table 2b: `public.anchor_gathers`
Tracks Gather layers for anchors (context logs, tags, simple text label).
```sql
CREATE TABLE public.anchor_gathers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id uuid REFERENCES public.user_anchors(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE,
    label text,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now()
);
```

#### Table 2c: `public.anchor_logs` (Legacy/Deprecated)
Tracks completed legacy habits. Deprecated in favor of `public.anchor_keeps` and `public.anchor_gathers`.
```sql
CREATE TABLE public.anchor_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anchor_id uuid NOT NULL REFERENCES public.user_anchors(id) ON DELETE CASCADE,
    date date NOT NULL,
    completed boolean DEFAULT false,
    used_baseline boolean DEFAULT false,
    reflection_text text,
    sub_items_state jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT unique_user_anchor_date UNIQUE (user_id, anchor_id, date)
);
```

#### Table 3: `public.user_state`
Manages game logic metadata, streak buffers, and Pause Tokens.
```sql
CREATE TABLE public.user_state (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pause_tokens_remaining integer DEFAULT 2,
    pause_tokens_reset_on date DEFAULT ((date_trunc('month'::text, (CURRENT_DATE + '1 month'::interval)))::date),
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    lifetime_anchor_count bigint DEFAULT 0, -- Deprecated/Purged in v2.0.0 (dynamically selected from aggregate keep counts)
    hardest_pillar text, -- Deprecated/Ignored in 2.0.0
    hardest_pillar_until date, -- Deprecated/Ignored in 2.0.0
    is_journal_enabled boolean DEFAULT false,
    is_todo_enabled boolean DEFAULT false,
    is_vault_notes_enabled boolean DEFAULT false
);
```

#### Table 4: `public.quiet_partners`
Handles quiet peer-to-peer companion networks.
```sql
CREATE TABLE public.quiet_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_email text NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'active'))
);
```

#### Table 5: `public.partner_nudges`
Tracks numbers-free pre-set silent nudges passed between active partners.
```sql
CREATE TABLE public.partner_nudges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nudge_type text NOT NULL CHECK (nudge_type IN ('thinking', 'proud', 'walk')),
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);
```

#### Table 6: `public.daily_rituals`
Stores metrics and indicators logged over daily cycles.
```sql
CREATE TABLE public.daily_rituals (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    wake_time text,
    feet_on_floor_logged boolean DEFAULT false,
    morning_ritual_done boolean DEFAULT false,
    sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    morning_mood integer CHECK (morning_mood >= 1 AND morning_mood <= 5),
    win_of_the_day text,
    parking_lot_notes text,
    bed_time text,
    sleep_duration numeric,
    pulse_score integer,
    PRIMARY KEY (user_id, date)
);
```

#### Table 7: `public.journal_entries`
Stores ultra-premium Apple-grade journal entries.
```sql
CREATE TABLE public.journal_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    word_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
```

#### Table 8: `public.todos`
Tracks frictionless tasks utilizing visual muting upon completion.
```sql
CREATE TABLE public.todos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task text NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);
```

#### Table 9: `public.vault_notes`
Secure ledger for long-form thoughts and structure.
```sql
CREATE TABLE public.vault_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

---

### Row-Level Security (RLS) & Performance Optimizations
RLS is active on all tables. Queries utilize optimized caching subqueries to bypass standard statement execution overhead.

---

## 3. SYSTEM ENGINES & ALGORITHMS

### A. Zustand Offline-First Sync Store (`useRitualStore.ts`)
The offline cache acts as the single source of truth for immediate UI rendering.
- **State Properties:**
  - `anchors`: Array of UserAnchor objects with UUID, title, codename, is_active, is_permanent, frequency, and keep_definition.
  - `anchorKeeps`: List of today's logged Keep instances.
  - `anchorGathers`: List of today's logged Gather context records.
  - `hasHydrated`: Hydration completion boolean.
  - `pauseTokens`: Count of remaining streak freezes.
  - `currentStreak`, `longestStreak`, `lifetimeAnchorCount`: Habit gamification scores.
  - `lastActiveDate`: Calendar date string of the user's last interactive action.
  - `isVisionEnabled`: Vision priming enabled toggle.
- **Actions:**
  - `toggleKeep(anchorId)`: Toggles Keep completion status locally and queues background upsert/delete on `anchor_keeps`.
  - `addGather(anchorId, label, tags)`: Add gather details with tags and context labels to `anchor_gathers`.
  - `setSyncState(...)`: Synchronizes local caches with backend database snapshots.
- **Conflict Resolution Hierarchy:** **Local State Always Wins.**

---

### B. The Streak Engine (`streakEngine.ts`)
Streaks are calculated utilizing high-forgiveness guidelines that reject pressure-based patterns:
1. **Pause Tokens (Streak Freeze)**: Hitting a missed day consumes one Pause Token (limit: 2 per calendar month, reset on the 1st). The day is re-labeled as a `Rest Day` 🌙. The streak survives, and the day's Pulse Score is bypassed as N/A.
2. **Sprout-to-Flame Transition**: A streak under 7 days displays a forgiving sprout 🌱 icon. The fire/flame 🔥 indicator unlocks only upon reaching day 7.
3. **Lifetime Anchor Count**: Never resets, serving as a permanent record of cumulative behavioral alignment.
4. **Resets**: If a user runs out of Pause Tokens and misses a cycle, the active streak resets to 0.

---

### C. The Circadian Theme Engine (`page.tsx` & layout hooks)
A clock evaluator evaluates system variables at 1-minute intervals, applying high-fidelity gradient shift styles to coordinate with chronological circadian flows:

| Profile Timeframe | Local Hour Boundaries | Tailwind Color Theme Tokens | Ambient Tone |
| :--- | :--- | :--- | :--- |
| **Morning / Dawn** | `05:00 - 09:59` | `bg-gradient-to-b from-[#FFFDF9] via-[#F7F6F2] to-[#F3EFE0]` | Warm dawn aura |
| **Day / Meridian** | `10:00 - 16:59` | `bg-gradient-to-b from-[#F2F7F7] via-[#F7F6F2] to-[#EFF5F5]` | Clean daylight |
| **Evening / Dusk** | `17:00 - 20:59` | `bg-gradient-to-b from-[#FAF4EC] via-[#F7F6F2] to-[#ECE5D8]` | Twilight amber glow |
| **Night / Vigil** | `21:00 - 04:59` | `bg-gradient-to-b from-[#F3EFE9] via-[#F7F6F2] to-[#E3DDD1]` | Cooling nightwatch slate/dark |

---

## 4. NATIVE ANDROID CONTAINER & DEVICE INTEGRATIONS

- **App Identifier:** `com.trelislife.app`
- **Capacitor Configuration (`capacitor.config.ts`):**
  ```typescript
  import { CapacitorConfig } from '@capacitor/cli';
  const config: CapacitorConfig = {
    appId: 'com.trelislife.app',
    appName: 'Trelis Life',
    webDir: 'out',
  };
  export default config;
  ```

---

## 5. FRONTEND NAVIGATION & PAGES

The frontend is built on Next.js 15 App Router structures optimized to export static components (`output: 'export'`) for Capacitor WebView wrapper compatibility.

### Application Routing Map
- `/`: Main entry point of the application. If the visitor is unauthenticated, it renders the public Landing Page natively (with custom animations and science layers). If the user is authenticated, it renders the primary Dashboard.
- `/login`: Magic-link authenticated landing page. Bypasses passwords. Surfaced terms state compliance disclaimers.
- `/debrief`: Sunday Weekly Debrief screen. Gated to standard Sundays (`Date.getDay() === 0`).
- `/settings`: Configurations for targets, wakeup hours, custom supplements, vision intentions, and account termination.

---

## 6. END-TO-END USER MANUAL & VISUAL WALKTHROUGH

This section details exactly how a user experiences and interacts with every system interface, feature, and visual node.

### A. The Public Landing Page (`/` when unauthenticated)
1. **Visual State**:
   - High-end dark aesthetic utilizing the dark background (`#1C1C1E`) and canvas/accent-teal highlights.
   - An interactive centerpiece circle that fills progressively based on scrolling, displaying a completed percentage indicator.
   - Animated SVG lattice vines that grow organically in response to the user's scroll depth.
2. **User Interaction**:
   - The user can scroll to read the Founders' philosophy, core ritual areas, and the science-backed behavioral principles.
   - Tapping "Sign In" or "Get Started" navigates to the login screen (`/login`).

---

### B. Authentication & Magic Link Sign-In (`/login`)
1. **Visual State**:
   - Clean, vertically-centered layout utilizing the museum-grade `#F7F6F2` canvas background.
   - A single, unbordered text input box centered on the page, displaying a placeholder: `Enter your email`.
   - Muted, low-contrast grayscale subtext at the bottom displaying compliance disclaimers and medical exclusions.
2. **User Interaction**:
   - The user taps the input box (triggering the default mobile native keyboard layout).
   - Enter email address (e.g., `user@example.com`).
   - Tap the clinical, solid black execution button labeled `Send Magic Link`.
3. **Internal Mechanics & Database Outputs**:
   - The button transitions to a spinning loader state with haptic feedback.
   - Pings Supabase Auth to send a passwordless magic link to the recipient email.

---

### C. The 3-Step Onboarding Experience (`/onboarding`)
1. **Step 1: Set your windows**:
   - Establish wake and sleep window targets.
   - Saves these targets into local storage and synchronizes them with the user's daily schedule setup.
2. **Step 2: Meet The Arc**:
   - Short explanation of "The Arc" foundational daily rhythm and the one promise kept every day.
3. **Step 3: Your First Anchor**:
   - Name the user's first optional custom daily anchor.
   - Clicking "Enter Trelis Life" upserts the default user state (`user_state`) to Supabase, registers the custom anchor (if provided) to the user's database store, and redirects the user to the Dashboard at `/`.

---

### D. The Dashboard (`/` when authenticated)
1. **Visual State**:
   - Changes colors dynamically based on the current hour of the day (Canvas, Crisp White, Warm Sepia, or Luxury Dark).
   - **Header Bar**: Display of active streak score. A clean SVG leaf icon sits adjacent to the numeric indicator. A small card displays remaining Pause Tokens (e.g., `2 Tokens`). If the streak is 0, it displays "Fresh Arc" in a soft, non-punitive layout. If a rest token is active, it displays "Resting" with a calm pause icon.
   - **Total Wins HUD**: Displays the lifetime total of all Gems captured and Wins logged. This replaces the old "Promises Kept" counter.
   - **Concentric Daily Arc Ring**: An open vector circular ring representing the completion of Morning and Evening Arc bookends (no longer connected to custom anchors).
   - **Playlists List**: Displays today's active Playlists in a clean, flat card list. Playlists contain no checkboxes and cannot be "completed".
   - **Partner Presence (Quiet Partner)**: A card showing the linked partner's email address and exactly 6 binary completion dots (colored green/teal when completed, gray when incomplete) for their active anchors today. Absolutely zero numbers, scores, or streaks are shared. Shows 3 pre-written nudge buttons: "Thinking of you", "Proud of you", "Want to walk?".
2. **User Interaction**:
    - **Capturing a Gem**:
      * Tapping the "+ ✨ GEM" button opens a clean input drawer.
      * The user adds a simple text label and selects tags.
      * The Gem instantly drops into the Playlist, increasing Total Wins and saving to the Vault permanently.
3. **Internal Mechanics & Database Outputs**:
    - Logged Gems invoke a background sync to `public.anchor_gathers` (upsert/delete).

---

### E. The Gated Sunday Debrief (`/debrief`)
1. **Access Gating**:
   - If accessed Monday through Saturday, the screen displays a lock graphic: `This portal opens on Sunday. Enjoy your week.` Tapping the return button redirects back to `/`.
   - On Sunday, the gate unlocks, displaying the Weekly Review workbook.
2. **Workbook Walkthrough**:
   - Form fields:
     * **Drain Box**: `What drained your mental reserve this week?`
     * **Win Box**: `What was your primary structural win?`
     * **Main Priority**: `What is the single focus for next week?`
3. **Submission**:
   - Tap `Commit Weekly Reflection`.
   - Returns to the dashboard with success notifications.

---

### F. Trellis Garden Visualization (Dashboard Core)
1. **Visual Layout**:
   - **Organic Vine Structure**: Located at the bottom of the main dashboard page. Displays a set of up to 5 climbing vines representing the user's anchors (including the permanent Arc keystone anchor).
   - **Daily Growth Nodes**: Each day's checked status is evaluated. If an anchor was completed (Keep), the vine grows a round green node for that day. Missed days remain as a thin line thread.
   - **Blossoming Gathers**: For user-defined custom anchors, logged gathers sprout leaves and flower blooms dynamically along the vine. The keystone Arc vine remains clean and unbloomed (representing purely keep status), preserving a clean, calm aesthetic.
   - **Grayscale Visuals**: Inactive or retired anchors are displayed in a muted gray aesthetic, maintaining the calm and quiet UI philosophy.

---

### G. Settings Portal (`/settings`)
1. **Visual Layout**:
   - Visual rows divided into groups: Profile settings, Target adjustments, Vision intention settings (including a toggle for enabling/disabling Vision Priming), and Account Operations.
2. **User Interactions**:
   - **Wake Window Slider**: Slide to adjust the default wake-up target.
   - **Vision Priming Intention**: Toggle the Vision Priming feature on/off and edit the daily morning intention string.
   - **Nuclear Reset Button**: A distinct button labeled `Delete Local Cache & Sign Out`. Tapping it prompts a confirmation modal.

---

## 7. DEVELOPER OPERATIONS RUNBOOK

### A. Environment Seeding
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lhqtqofjrqoyscobsfud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
```

---

### B. Local Web Development Workflow
To launch the live-reloading dev server:
```powershell
npm install
npm run dev
```
Open `http://localhost:3000` in the browser to run and test features.

---

### C. Android Device Build & Live Run
To compile and test on a physical Android device or emulator:
```powershell
# 1. Compile NextJS project to static files
npm run build

# 2. Synchronize built files into Capacitor platforms
npx cap sync

# 3. Launch Android Studio to compile and run APK
npx cap open android
```

### D. Hotfixes & Database Wiping (v2.0.0 Polish)
1. **Morning Tap Time Format**: Modified `TheArcCard.tsx` to parse the raw ISO 8601 strings stored in the database/Zustand store and format them nicely to standard localized hours (e.g. `7:33 AM`), utilizing a client-side mount state check (`mounted` boolean) to completely eliminate React hydration warnings.
2. **Database Cleansing & Blank Slate**: Executed PostgreSQL scripts to delete all records from `public` tables (`anchor_logs`, `daily_rituals`, `user_anchors`, etc.) and all users from `auth.users` to provide a true "Day 1" blank slate.
3. **PWA Landing Page & Circadian Mapping**: Rewrote `LandingPage.tsx` using exact product copy and integrated the `useCircadian` provider to ensure colors adapt beautifully to the time of day.
4. **Production SEO & Open Graph (OG) Integration**: Upgraded `src/app/layout.tsx` metadata with complete OG tags, separate `Viewport` structure for light/dark theme color media queries, and configured `/manifest.json` for proper iOS and Android home screen installability.
5. **Production Security Headers & Env Audit**: Injected production-grade HTTP security headers (`X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`) inside `next.config.ts` and a root `vercel.json` file. Verified that only standard, safe public variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are exposed to client browsers.
6. **Onboarding Guided Tour & Reset Flow**: Implemented a 10-step spotlight onboarding tour on the Dashboard (`/`). It walks users through the new Playlist & Gems mechanics, the Arc, the Vault, and the hardcoded Jan 1, 2027 D-Day timer. Replaying the tour is accessible in Settings, which resets state and triggers the tour overlay.
7. **Authentication SignUp Verification**: Added a dedicated "Create Account" toggle on `/login` that requires password confirmation matching and prompts for email verification before redirecting.
8. **Erase Data Feature**: Added a highly visible, permanent nuclear reset option in Settings to wipe all legacy table rows (`user_state`, `anchor_gathers`, etc.) so the user can wipe all ghost data and start fresh perfectly mapped to the new paradigm.

---

## 8. GOOGLE PLAY COMPLIANCE & DISCLAIMERS

### Medical Disclaimer
> "Trelis Life is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. Do not make clinical decisions based on application outputs. Consult a physician before changing nutritional, metabolic, or physical regimens."

### Privacy Statement
> "Trelis Life respects your visual and mental privacy. Your personal reflections, debriefs, and intentions are stored securely, and no data is shared with third-party advertisers."
