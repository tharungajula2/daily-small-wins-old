# TRELIS LIFE — THE DEFINITIVE SYSTEM BLUEPRINT & SOURCE OF TRUTH

> **Document Version:** 2.0.0  
> **Last Updated:** June 2026  
> **Philosophy:** "Structure for a better life."  

---

## 1. PROJECT EXECUTIVE SUMMARY & PRODUCT IDENTITY

Trelis Life is a premium daily routine companion designed to instill structural clarity into a chaotic existence. It rejects standard quantified-self metrics, gamified pressure, and alarmist notifications in favor of a clinical, calm, and structured habit check-in flow.

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

---

### The 6 MECE Behavioral Pillars
The ecosystem partitions human daily routines into six Mutually Exclusive, Collectively Exhaustive (MECE) pillars:

| Pillar Key | Behavioral Scope | Visual Signifier (Emoji) | Base Color / Hex Token |
| :--- | :--- | :--- | :--- |
| `nutrition` | Metabolic intake, hydration, and nutritional boundary habits. | 🥑 | `bg-accent-teal` (`#2A7F7F`) |
| `movement` | Calisthenics, physical mobility, daily movement checks. | 💪 | `#2A7F7F` |
| `sleep` | Chronotype sleep quality, duration metrics, bedtime rituals. | 🌙 | `#6A5ACD` |
| `stress_mental` | Reflection journaling, meditative breathing, grounding metrics. | 🧘 | `#D97706` |
| `social` | Silent peer support networks, toxicity-free companion checks. | 🤝 | `#C084FC` |
| `environment` | Contextual exposure, morning sun capture, physical space layout. | 🌱 | Green |

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
    - `@capacitor/core`: `^8.3.4`
    - `@capacitor/android`: `^8.3.4`
    - `@capacitor/app`: `^8.1.0`
    - `@capacitor/haptics`: `^8.0.2`
    - `@capacitor/preferences`: `^8.0.1`
    - `date-fns`: `^4.1.0`
*   **Development Dependencies:**
    - `typescript`: `^5`
    - `@tailwindcss/postcss`: `^4`
    - `tailwindcss`: `^4`
    - `@capacitor/cli`: `^8.3.4`
    - `@capacitor/assets`: `^3.0.5`
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
    pillar_id text NOT NULL CHECK (pillar_id IN ('nutrition', 'movement', 'sleep', 'stress_mental', 'social', 'environment')),
    type text NOT NULL CHECK (type IN ('action', 'reflection')),
    prompt text,
    baseline_title text,
    baseline_target integer,
    is_active boolean DEFAULT true,
    frequency text[] DEFAULT '{all}'::text[],
    sub_items jsonb DEFAULT '[]'::jsonb
);
```

#### Table 2: `public.anchor_logs`
Tracks completed habits, baselines used, and reflections.
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
    lifetime_anchor_count bigint DEFAULT 0,
    hardest_pillar text, -- Deprecated/Ignored in 2.0.0
    hardest_pillar_until date -- Deprecated/Ignored in 2.0.0
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

---

### Row-Level Security (RLS) & Performance Optimizations
RLS is active on all tables. Queries utilize optimized caching subqueries to bypass standard statement execution overhead.

---

## 3. SYSTEM ENGINES & ALGORITHMS

### A. Zustand Offline-First Sync Store (`useRitualStore.ts`)
The offline cache acts as the single source of truth for immediate UI rendering.
- **State Properties:**
  - `anchors`: Array of UserAnchor objects.
  - `todayLogs`: Array of AnchorLog objects for the current date.
  - `hasHydrated`: Hydration completion boolean.
  - `pauseTokens`: Count of remaining streak freezes.
  - `currentStreak`, `longestStreak`, `lifetimeAnchorCount`: Habit gamification scores.
  - `lastActiveDate`: Calendar date string of the user's last interactive action.
  - `isVisionEnabled`: Vision priming enabled toggle.
- **Actions:**
  - `toggleAnchor(anchorId, usedBaseline, reflectionText)`: Toggles anchor completion locally and queues Supabase background synchronization.
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

### C. The Circadian Theme Engine (`CircadianProvider.tsx`)
A clock evaluator evaluates system variables at 5-minute intervals, applying transition styles to coordinate with chronological circadian flows:

| Profile Timeframe | Local Hour Boundaries | Tailwind Color Theme Tokens | Ambient Tone |
| :--- | :--- | :--- | :--- |
| **Morning** | `06:00 - 09:59` | `bg-[#F7F6F2] text-[#1C1C1E]` | Warm museum canvas |
| **Day** | `10:00 - 17:59` | `bg-[#FFFFFF] text-[#1C1C1E]` | Clean neutral crisp |
| **Evening** | `18:00 - 20:59` | `bg-[#F1EAD9] text-[#2A2520]` | Muted sepia warmth |
| **Night** | `21:00 - 05:59` | `bg-[#1E1B18] text-[#E5DDCB]` | Luxury dark ambient |

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
- `/history`: Sparkline completion view showing 30-day behavioral adherence rates and the Quiet Tracks component (which displays a simple row of small dots for the last 7 days per anchor).
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

### C. The 4-Step Onboarding Experience (`/onboarding`)
1. **Step 1: Philosophical Welcome**:
   - Large, high-impact typography: `Hi.` followed by a simple paragraph statement.
   - Tap `Continue` (light haptic tap) to slide horizontally into Step 2.
2. **Step 2: Pillar Education Grid**:
   - A 2x3 grid detailing the 6 MECE pillars with descriptive emojis (🥑, 💪, 🌙, 🧘, 🤝, 🌱) and short explanations.
   - Tap `Continue` to slide into Step 3.
3. **Step 3: Wake Window Picker**:
   - Displays a large, visual digital clock face input setting the wake-up time.
   - Tap the clock to open the device's native time picker utility. The user selects a time (e.g., `07:30`).
   - Tap `Continue`.
4. **Step 4: Starter Templates Seeding**:
   - Displays the 8 default starter habits pre-configured for the user.
   - Tapping `Enter Trelis Life` initiates database upsertion:
     * **Upserts** default user state to `public.user_state` setting current streak to 0, longest streak to 0, and pause tokens remaining to 2.
     * **Inserts** the 8 default anchors into `public.user_anchors` under the generated user ID.
     * Redirects the user to the dashboard (`/`).

---

### D. The Dashboard (`/` when authenticated)
1. **Visual State**:
   - Changes colors dynamically based on the current hour of the day (Canvas, Crisp White, Warm Sepia, or Luxury Dark).
   - **Header Bar**: Display of active streak score. A clean SVG leaf icon sits adjacent to the numeric indicator. A small card displays remaining Pause Tokens (e.g., `2 Tokens`). If the streak is 0, it displays "Fresh Arc" in a soft, non-punitive layout. If a rest token is active, it displays "Resting" with a calm pause icon.
   - **Concentric Pulse Score Ring (The Arc Ring)**: An open vector circular ring (with a visible gap/seam) representing today's flat progress score.
   - **Flat Anchor List**: Displays today's active anchors in a clean, flat card list (no folders, categories, or filters).
   - **Partner Presence (Quiet Partner)**: A card showing the linked partner's email address and exactly 6 binary completion dots (colored green/teal when completed, gray when incomplete) for their active anchors today. Absolutely zero numbers, scores, or streaks are shared. Shows 3 pre-written nudge buttons: "Thinking of you", "Proud of you", "Want to walk?".
2. **User Interaction**:
   - **Toggling Anchors**:
     * **Action Anchor**: Tapping the checkbox completes the item. The checkbox fills with solid green, the title gets struck through, and a light haptic vibration fires.
     * **Baseline Anchor**: If a user is having a low-energy day, incomplete anchors display a secondary link: `↳ Drop to Baseline: [Title]`. Tapping this registers a "Baseline Completion," turning the card gold/amber. The streak is preserved.
3. **Internal Mechanics & Database Outputs**:
   - Completed anchors invoke a background upsert to `public.anchor_logs` recording the status, timestamp, and baseline variables.

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

### F. Historical Sparklines (`/history`)
1. **Visual Layout**:
   - **Section 1: The Sparkline**: A minimal, smooth vector wave representing the user's Pulse Score over the last 30 days. No axis labels, no grids—just a clean trend line.
   - **Section 2: Quiet Tracks**: A minimalist history showing a row of small dots for the last 7 days per anchor. A completed day is filled with a calm teal color, while a missed day is represented by an empty dot. No red highlights or guilt mechanics are used.

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

---

## 8. GOOGLE PLAY COMPLIANCE & DISCLAIMERS

### Medical Disclaimer
> "Trelis Life is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. Do not make clinical decisions based on application outputs. Consult a physician before changing nutritional, metabolic, or physical regimens."

### Privacy Statement
> "Trelis Life respects your visual and mental privacy. Your personal reflections, debriefs, and intentions are stored securely, and no data is shared with third-party advertisers."
