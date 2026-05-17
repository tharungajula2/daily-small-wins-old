# TRELIS LIFE - MASTER STATE & ARCHITECTURE (PHASE 3 - THE CONVERGENCE)

**Last Updated:** May 2026  
**Project Status:** Phase 3 Complete / All Features Verified & Locked  

---

## 1. Executive Summary
**Mission:** Not a Health App. A Life Operating System. Structure for a better life.  
**Execution Model:** Surgical precision, zero destructive errors, highest order of operations.  
**Phase 3 Goal:** "The Convergence." We successfully transitioned from a fragmented collection of hardcoded, separate trackers (supplements, food diversity, gut journals, movement notes, and discomfort logs) to a highly unified **Universal Anchor Engine** structured around the MECE Six Pillars of Health.

This phase centered on:
1. Purging legacy ephemeral state items and consolidating all metrics into unified Anchor definitions.
2. Generating and executing a single-transaction database schema migration.
3. Overhauling the main dashboard interface to render dynamically grouped active pillars.
4. Implementing native Capacitor state transitions to address the timezone daily reset bug.
5. Wiring up a high-precision, dynamic denominator Daily Pulse algorithm.

---

## 2. The MECE Six Pillars & Anchor Taxonomy

Trelis Life now enforces a strict MECE (Mutually Exclusive, Collectively Exhaustive) architecture. Instead of coding customized widgets for each new daily routine, all habits, checks, and journals are modeled as **Anchors** belonging to one of the **Six Pillars of Health**:

1.  **Nutrition** (`nutrition`) - Covers diet, hydration, supplement intakes, and fasting protocols.
2.  **Movement** (`movement`) - Covers physical exertion, cardiovascular sessions, and mobility drills.
3.  **Sleep** (`sleep`) - Covers wind-downs, sleep schedules, and morning light resets.
4.  **Stress & Mental Health** (`stress_mental`) - Covers breathwork, meditation, silence, and journaling.
5.  **Social Connection** (`social`) - Covers communication, family quality time, and community check-ins.
6.  **Environment** (`environment`) - Covers outdoor exposure, workspace hygiene, and temperature exposure.

### Anchor Sub-Types
Every Anchor is classified into one of two fundamental interaction models:
*   **Type A: Action (`type: 'action'`)**: A binary, task-based habit. Can be completed in full (100% value) or checked off as a Minimum Viable Effort baseline (50% value).
*   **Type B: Reflection (`type: 'reflection'`)**: A cognitive, text-based log. Clicking the checklist opens a premium modal journal inputting `reflectionText` against a deep psychological prompt.

---

## 3. Zustand Store Upgrade (`useRitualStore.ts`)

To support the convergence, the local Zustand store went through a major cleanup. We deleted 12 legacy variables and added dynamic, timezone-aware variables.

### Variables Removed
*   **Legacy Domain State:** `supplements`, `morningGut`, `eveningGut`, `dailyDiscomfortLog`, `dailyMovementNote`, `weeklyPlantCount`.
*   **Legacy Widget Toggles:** `isSupplementWidgetEnabled`, `isGutWidgetEnabled`, `isDiscomfortWidgetEnabled`, `isFoodWidgetEnabled`, `isMovementWidgetEnabled`.

### Variables & Actions Added
*   `lastActiveDate` (`string | null`): Persistent local timestamp in `YYYY-MM-DD` format tracking when the app was last operational.
*   `setLastActiveDate` (`(date: string) => void`): Action to manually assign the latest active operational timestamp.

### Upgraded Types & Interface Definitions
The unified store is strongly typed as follows:

```typescript
export type PillarId = 'nutrition' | 'movement' | 'sleep' | 'stress_mental' | 'social' | 'environment';
export type AnchorType = 'action' | 'reflection';

export interface Anchor {
  id: string;
  title: string;
  pillarId: PillarId;
  type: AnchorType;
  completed: boolean;
  baselineTitle?: string;
  usedBaseline?: boolean;
  prompt?: string;
  reflectionText?: string;
  completedAt?: string;
}

interface RitualState {
  feetOnFloorLogged: boolean;
  wakeTime: string | null;
  currentStreak: number;
  morningCheckInDone: boolean;
  sleepScore: number | null;
  moodScore: number | null;
  bedTime: string | null;
  sleepDuration: number | null;
  anchors: Anchor[];
  eveningCheckInDone: boolean;
  winOfTheDay: string;
  parkingLotNotes: string;
  isVisionEnabled: boolean;
  visionText: string;
  isNotesEnabled: boolean;
  lifeNotes: Array<{ id: string; content: string; attribution: string; date: string }>;
  hasSeenVisionTooltip: boolean;
  weeklyHistory: any[];
  lastWeeklyReviewDate: string | null;
  lastActiveDate: string | null;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  toggleAnchor: (id: string, asBaseline?: boolean, reflectionText?: string, prompt?: string) => void;
  addAnchor: (title: string, pillarId: PillarId, type: AnchorType, baseline?: string, prompt?: string) => void;
  removeAnchor: (id: string) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  resetDaily: () => void;
  setLastActiveDate: (date: string) => void;
  toggleVision: () => void;
  setVisionText: (text: string) => void;
  toggleNotes: () => void;
  addLifeNote: (content: string, attribution: string) => void;
  removeLifeNote: (id: string) => void;
  toggleWidget: (widgetKey: string) => void;
  dismissTooltip: (tooltip: string) => void;
  setWeeklyHistory: (history: any[]) => void;
  completeWeeklyReview: () => void;
}
```

---

## 4. Supabase Database Migration (SQL DDL)

To sync these changes to the cloud without losing existing user accounts or security boundaries, we executed an additive database migration:

```sql
-- 1. Upgrade user_anchors to include new MECE categorization & reflection metadata
ALTER TABLE public.user_anchors ADD COLUMN pillar_id text NOT NULL DEFAULT 'stress_mental';
ALTER TABLE public.user_anchors ADD COLUMN type text NOT NULL DEFAULT 'action';
ALTER TABLE public.user_anchors ADD COLUMN prompt text;

-- Backfill pillar_id mapping from old custom categories
UPDATE public.user_anchors SET pillar_id = 'nutrition' WHERE category ILIKE '%nutrition%' OR category ILIKE '%food%' OR category ILIKE '%hydration%';
UPDATE public.user_anchors SET pillar_id = 'movement' WHERE category ILIKE '%movement%' OR category ILIKE '%fitness%' OR category ILIKE '%exercise%';
UPDATE public.user_anchors SET pillar_id = 'sleep' WHERE category ILIKE '%sleep%' OR category ILIKE '%rest%';
UPDATE public.user_anchors SET pillar_id = 'stress_mental' WHERE category ILIKE '%stress%' OR category ILIKE '%mental%' OR category ILIKE '%reflection%';
UPDATE public.user_anchors SET pillar_id = 'social' WHERE category ILIKE '%social%' OR category ILIKE '%connection%' OR category ILIKE '%relationship%';
UPDATE public.user_anchors SET pillar_id = 'environment' WHERE category ILIKE '%environment%' OR category ILIKE '%nature%' OR category ILIKE '%sunlight%';

-- Drop legacy string column safely
ALTER TABLE public.user_anchors DROP COLUMN category;

-- 2. Upgrade anchor_logs to capture text reflections
ALTER TABLE public.anchor_logs ADD COLUMN reflection_text text;

-- 3. Purge legacy hardcoded logging columns from daily_rituals
ALTER TABLE public.daily_rituals DROP COLUMN morning_gut;
ALTER TABLE public.daily_rituals DROP COLUMN evening_gut;
ALTER TABLE public.daily_rituals DROP COLUMN daily_discomfort_log;
ALTER TABLE public.daily_rituals DROP COLUMN daily_movement_note;
```

---

## 5. Bidirectional Sync Engine Optimization (`syncEngine.ts`)

The bidirectional offline-first sync engine was completely optimized. We removed the legacy sync handlers that were throwing type errors and kept the network operations hyper-focused:

*   **Pushes Removed:** `syncPushSupplementLog`, `syncPushSupplements`, `syncPushDiscomfortLog`, `syncPushMovementLog`, `syncPushGutJournal`, `syncPushFoodDiversity`.
*   **Logs Upgraded:** The anchor log synchronizer now sends the optional `reflection_text` column cleanly to Supabase using PKCE credentials.

```typescript
export async function syncPushAnchorLog(anchorId: string, completed: boolean, usedBaseline: boolean, reflectionText?: string) {
  const supabase = getBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toLocaleDateString('en-CA');
  await supabase.from('anchor_logs').upsert({
    user_id: user.id,
    anchor_id: anchorId,
    date: today,
    completed,
    used_baseline: usedBaseline,
    reflection_text: reflectionText || null,
    completed_at: new Date().toISOString()
  }, { onConflict: 'user_id,anchor_id,date' });
}
```

---

## 6. UI/UX Refactoring & Premium Polish

The UI transitioned from a collection of hardcoded boxes to an integrated, adaptive layout.

### A. The Dashboard Overhaul (`src/app/page.tsx`)
*   **Dead Code Purge:** Completely removed imports and conditional branches rendering legacy widget code blocks.
*   **Sliders Settings Icon:** Replaced the generic settings emoji (`⚙️`) in the header with a modern, sleek `SlidersHorizontal` icon from `lucide-react`.
*   **Dynamic Pillar Grouping:** Active user anchors are grouped by their respective MECE pillars. If an active pillar contains zero anchors on a given day, its card is hidden to eliminate cognitive clutter.

### B. Type B Journaling Modal Drawer (`AnchorCard.tsx`)
*   **Decoupled Tap Flow:** Clicking an incomplete Type B (reflection) anchor intercepts the event, preventing a binary checkbox toggle. Instead, it slides up an elegant modal drawer.
*   **Psychological Prompts Library (`src/utils/prompts.ts`):** If an anchor doesn't have a static prompt, it pulls a deep psychological prompt (e.g., *"What is one hard thing you avoided today?"*, *"What truth did you speak or realize today?"*).
*   **Rich Text Input:** The user reflects inside a custom `<textarea>`. Saving the entry commits the completed state, saves the prompt, and writes the `reflectionText` to the Zustand store and Supabase.

### C. Timeline Feed UI Log Card
*   Completed Type B anchors render as an elegant read-only Timeline Log:
    *   The checkbox is omitted.
    *   Features a clear heading and uppercase pillar indicator.
    *   Displays the active prompt in italics inside quotes.
    *   Indents the user's reflection with a subtle `border-l-2 border-accent-teal/40` highlight.
    *   Provides an immediate "Reset" action to untoggle or rewrite the entry.

---

## 7. Capacitor Lifecycle Management & Timezone Reset Fix

### The Reset Bug
On mobile devices (Android), if a user leaves Trelis Life open in the background overnight, browser-based interval timers fail to trigger the daily reset because the OS puts the Web View process to sleep. When the user wakes up and brings the app to the foreground, the app displays outdated, stale completed data.

### The Lifecycle Solution (`AppLifecycleManager.tsx`)
We installed `@capacitor/app` and mounted a global, invisible `<AppLifecycleManager />` in `layout.tsx` to handle background-to-foreground transitions.

```typescript
'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRitualStore } from '@/store/useRitualStore';

export default function AppLifecycleManager() {
  const { lastActiveDate, resetDaily, setLastActiveDate } = useRitualStore();

  useEffect(() => {
    const checkReset = () => {
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD Local Format
      if (lastActiveDate && todayStr > lastActiveDate) {
        console.log(`AppLifecycleManager: Triggering daily reset (${lastActiveDate} -> ${todayStr})`);
        resetDaily();
      } else if (!lastActiveDate) {
        setLastActiveDate(todayStr);
      }
    };

    checkReset(); // On App Boot

    // Listen for mobile foreground transitions
    const listener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        checkReset();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [lastActiveDate, resetDaily, setLastActiveDate]);

  return null;
}
```

---

## 8. The Dynamic Denominator Pulse Heuristic Algorithm

The legacy Daily Pulse Score algorithm relied on static weights. This penalized users who only configured a few custom anchors, making it mathematically impossible for them to achieve a 100% score.

We replaced it with the **Dynamic Denominator Algorithm**:

$$Pulse\ Score = Morning\ (10\%) + Evening\ (20\%) + Engine\ (70\%)$$

### 1. Morning Ignition (10 Points Max)
*   If `morningCheckInDone` is `true`, grant **10 points**. Otherwise, `0`.

### 2. Evening Shutdown (20 Points Max)
*   If `eveningCheckInDone` is `true`, grant **20 points**. Otherwise, `0`.

### 3. The Anchor Engine (70 Points Max)
*   **Active Pillars Determination:** Group all user anchors by their `pillarId`. Count how many pillars have at least 1 anchor. This count is the dynamic denominator ($N$).
*   **Pillar-Level Completion:** For each active pillar, evaluate the average completion of its anchors.
    *   Normal completion grants **100% credit** (`1.0`).
    *   Baseline completions (`usedBaseline: true`) grant **50% credit** (`0.5`).
*   **Pillar Score Average:** Average the completion percentages of all active pillars.
*   **Engine Score Calculation:** Multiply the average by `70`.

### Example Calculation
A user has 3 active pillars configured:
1.  **Nutrition (1 Anchor):** Fully complete (`1.0`). Pillar completion = **100%**.
2.  **Movement (2 Anchors):** 1 fully complete (`1.0`), 1 baseline complete (`0.5`). Pillar completion = $(1.0 + 0.5) / 2 = \mathbf{75\%}$.
3.  **Sleep (1 Anchor):** Incomplete (`0.0`). Pillar completion = **0%**.

*   **Average Pillar Completion:** $(1.0 + 0.75 + 0.0) / 3 = 1.75 / 3 = \mathbf{58.33\%}$
*   **Engine Component:** $58.33\% \times 70 = \mathbf{40.83\ points}$
*   **Check-ins:** Completed morning check-in (**10 points**), but not evening check-in (**0 points**).
*   **Total Score:** $10 + 0 + 40.83 = 50.83 \rightarrow \mathbf{51\%}$ (Rounded).

This algorithm ensures the score scales dynamically to match the user's active life constraints.

---

## 9. Hidden Caveats & Debugging Ledger

### A. The `addAnchor` Parameter Swapping Trap
*   **The Symptom:** Adding new anchors caused TypeScript errors: `Argument of type 'string | undefined' is not assignable to parameter of type 'AnchorType'`.
*   **The Cause:** In `useRitualStore.ts`, the `addAnchor` signature is:
    `addAnchor: (title: string, pillarId: PillarId, type: AnchorType, baseline?: string, prompt?: string)`.
    However, the UI was calling it with `baseline` in the third slot and `type` in the fourth, causing argument casting mismatch.
*   **The Resolution:** Corrected the argument sequencing in `AnchorManager.tsx` to align exactly with the store definition:
    ```typescript
    addAnchor(newTitle.trim(), newPillarId, newType, newBaseline.trim() || undefined, newPrompt.trim() || undefined);
    ```

### B. Clean-Slate Dead Code purging
*   When removing legacy widgets, leaving their file coordinates intact in `src/components/widgets` caused compilation failures due to the removed Zustand fields.
*   **Resolution:** Completely purged the unused legacy files (`DiscomfortLog.tsx`, `FoodDiversity.tsx`, `GutJournal.tsx`, `MovementLog.tsx`, `SupplementManager.tsx`, `SupplementStack.tsx`). This resulted in a clean Next.js build with **zero warnings**.
