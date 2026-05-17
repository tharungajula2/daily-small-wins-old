# TRELIS LIFE - MASTER STATE & ARCHITECTURE (PHASE 3 & 3.5 CONVERGENCE)

**Last Updated:** May 2026  
**Project Status:** Phase 3.5 Complete / All Features & UI Drawer Verified & Locked  

---

## 1. Executive Summary
**Mission:** Not a Health App. A Life Operating System. Structure for a better life.  
**Execution Model:** Surgical precision, zero destructive errors, highest order of operations.  
**Core Milestones (Phase 3 & 3.5):** 
1. **Universal Anchor Engine Conversion:** Transitioned from a fragmented collection of hardcoded, separate trackers to a unified **Universal Anchor Engine** structured around the MECE Six Pillars of Health.
2. **Phase 3.5 Sub-Stack Architecture & Frequency Matrix:** Extended the engine to support nested checklists (Type C Stacks) and weekday frequency time-gates on both frontend and backend, with seamless offline-first synchronization.

---

## 2. The MECE Six Pillars & Anchor Taxonomy

Trelis Life enforces a strict MECE (Mutually Exclusive, Collectively Exhaustive) architecture. Instead of coding customized widgets for each new daily routine, all habits, checks, and journals are modeled as **Anchors** belonging to one of the **Six Pillars of Health**:

1. **Nutrition** (`nutrition`) - Diet, hydration, supplement intakes, and fasting protocols.
2. **Movement** (`movement`) - Physical exertion, cardiovascular sessions, and mobility drills.
3. **Sleep** (`sleep`) - Wind-downs, sleep schedules, and morning light resets.
4. **Stress & Mental Health** (`stress_mental`) - Breathwork, meditation, silence, and journaling.
5. **Social Connection** (`social`) - Communication, family quality time, and community check-ins.
6. **Environment** (`environment`) - Outdoor exposure, workspace hygiene, and temperature exposure.

### Expanded Anchor Taxonomy (Types A, B, and C)
Every Anchor in the system is classified into one of three interaction models:
*   **Type A: Action (`type: 'action'`)**: A binary, task-based habit. Can be completed in full (100% value) or checked off as a Minimum Viable Effort baseline (50% value).
*   **Type B: Reflection (`type: 'reflection'`)**: A cognitive, text-based log. Clicking the checklist opens a premium modal journal inputting `reflectionText` against a deep psychological prompt.
*   **Type C: Stack (`subItems` Checklist)**: A compound, nested list of sub-items. Tapping the card opens a bottom drawer checklist. Completing all sub-items automatically completes the parent anchor.

---

## 3. Zustand Store Upgrade (`useRitualStore.ts`)

The local Zustand store serves as the offline-first source of truth, persisting state securely.

### Upgraded Types & Interface Definitions
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
  subItems?: { id: string; title: string; completed?: boolean }[];
  frequency?: string[];
}

export interface AnchorLog {
  id?: string;
  userId?: string;
  anchorId: string;
  date?: string;
  completed: boolean;
  usedBaseline: boolean;
  reflectionText?: string;
  completedAt?: string;
  subItemsState?: { id: string; completed: boolean }[];
}
```

### Advanced Actions Added (Phase 3.5 Checklist Actions)
*   `toggleAnchor`: Recursively marks the parent anchor and all child `subItems` as complete or incomplete.
*   `toggleSubItem`: Toggles the completion status of an individual child item. Automatically marks the parent anchor as `completed: true` if (and only if) every sub-item is successfully checked.
*   `addAnchor`: Upgraded to support configuring and persisting custom `subItems` and `frequency` constraints.

---

## 4. Supabase Database Migration (SQL DDL)

To upgrade the cloud architecture without losing streak records or account integrity, we executed a unified set of additive migrations:

```sql
-- Phase 3 & 3.5 Unified Database Schema Alignment

-- 1. Upgrade user_anchors for MECE, Reflections, Checklists, and Frequencies
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS pillar_id text NOT NULL DEFAULT 'stress_mental';
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'action';
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS prompt text;
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS sub_items jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS frequency text[] NOT NULL DEFAULT ARRAY['all']::text[];

-- 2. Upgrade anchor_logs to capture text reflections and checklist states
ALTER TABLE public.anchor_logs ADD COLUMN IF NOT EXISTS reflection_text text;
ALTER TABLE public.anchor_logs ADD COLUMN IF NOT EXISTS sub_items_state jsonb DEFAULT NULL;

-- Backfill pillar_id mapping from old custom categories
UPDATE public.user_anchors SET pillar_id = 'nutrition' WHERE category ILIKE '%nutrition%' OR category ILIKE '%food%' OR category ILIKE '%hydration%';
UPDATE public.user_anchors SET pillar_id = 'movement' WHERE category ILIKE '%movement%' OR category ILIKE '%fitness%' OR category ILIKE '%exercise%';
UPDATE public.user_anchors SET pillar_id = 'sleep' WHERE category ILIKE '%sleep%' OR category ILIKE '%rest%';
UPDATE public.user_anchors SET pillar_id = 'stress_mental' WHERE category ILIKE '%stress%' OR category ILIKE '%mental%' OR category ILIKE '%reflection%';
UPDATE public.user_anchors SET pillar_id = 'social' WHERE category ILIKE '%social%' OR category ILIKE '%connection%' OR category ILIKE '%relationship%';
UPDATE public.user_anchors SET pillar_id = 'environment' WHERE category ILIKE '%environment%' OR category ILIKE '%nature%' OR category ILIKE '%sunlight%';

-- Drop legacy columns safely
ALTER TABLE public.user_anchors DROP COLUMN IF EXISTS category;
ALTER TABLE public.daily_rituals DROP COLUMN IF EXISTS morning_gut;
ALTER TABLE public.daily_rituals DROP COLUMN IF EXISTS evening_gut;
ALTER TABLE public.daily_rituals DROP COLUMN IF EXISTS daily_discomfort_log;
ALTER TABLE public.daily_rituals DROP COLUMN IF EXISTS daily_movement_note;
```

---

## 5. Bidirectional Sync Engine Optimization (`syncEngine.ts`)

The bidirectional offline-first sync engine maps database snake_case structures to camelCase store fields seamlessly.

### Mapped Push Operations
*   `syncPushAnchors`: Packages and upserts local definitions, including the newly introduced `sub_items` JSONB array and `frequency` array.
*   `syncPushAnchorLog`: Syncs daily completion logs alongside their detailed `reflection_text` and checklist `sub_items_state`.

### Mapped Pull Operations
During startup or foreground reboots, `syncPullInitialState` pulls and merges:
1. **Anchor Configuration Merges:** Updates local checklist schemas and weekday gating arrays if modified in the cloud.
2. **Log Fills Merges:** Overlays today's logged checklist completion fills (`sub_items_state`) cleanly, keeping the client 100% current.

---

## 6. Frontend Frequency Gating & Pulse Math

To make sure custom schedules do not penalize users, Trelis Life enforces real-time weekday time-gating on the dashboard.

### 1. Active Day Matcher
The dashboard dynamically matches today's local date against custom scheduled frequencies:
```typescript
const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayStr = dayMap[new Date().getDay()];
const activeTodayAnchors = anchors.filter(
  a => !a.frequency || a.frequency.length === 0 || a.frequency.includes('all') || a.frequency.includes(todayStr)
);
```

### 2. High-Precision Dynamic Pulse Algorithm
Only anchors active on the current weekday (`activeTodayAnchors`) count towards the Engine score. If an anchor is unscheduled for the day, it is excluded from the denominator.

$$Pulse\ Score = Morning\ (10\%) + Evening\ (20\%) + Engine\ (70\%)$$

*   **Engine Component (70 Points Max):** Group `activeTodayAnchors` by active pillars. Divide total completion credits (1.0 for full, 0.5 for baseline) by the number of active anchors within each pillar, average the score across active pillars, and multiply by 70.

---

## 7. UI/UX Refactoring & Premium Drawer Interfaces

### A. The Dashboard Overhaul (`src/app/page.tsx`)
*   **Double Dates Purged:** Date displays are removed from check-in cards and kept in the top header.
*   **Time-Gated Feed:** Loops exclusively over `activeTodayAnchors`, dynamically grouping active pillars while hiding pillars with no scheduled routine for the day.

### B. Type B Journaling Modal Drawer
*   Clicking an incomplete reflection anchor intercepts the toggle, sliding up a premium backdrop-blurred modal.
*   Pulls from a deep psychological prompts library (`src/utils/prompts.ts`) and commits inputs cleanly.

### C. Type C Checklist Stack Bottom Drawer (`AnchorCard.tsx`)
*   **Visual Progression Indicator:** Displays a checklist counter (e.g. `2/5 Items`) instead of the standard type string.
*   **Checking Checklist Drawer:** Tapping a Stack card slides up a bottom drawer checklist. Checked checklist fills immediately push logs using Capacitor-backed Light Haptics.
*   **Auto-Promotion:** Once all sub-items are checked, the parent anchor immediately transitions to the green completed checkmark status.

---

## 8. Capacitor Lifecycle Management & Timezone Reset Fix

### The Reset Bug
On mobile devices (Android), overnight background state suspends web view interval loops, leaving yesterday's completed checkmarks visible on morning launches.

### The Lifecycle Solution (`AppLifecycleManager.tsx`)
An invisible `<AppLifecycleManager />` in `layout.tsx` uses `@capacitor/app` to monitor foreground transitions. It compares local dates against Zustand's `lastActiveDate` and instantly triggers `resetDaily()` on component mount and resume events.

---

## 9. Hidden Caveats & Debugging Ledger

### A. The `addAnchor` Parameter Swapping Trap
*   **Issue:** Argument sequencing mismatch between the store definition and `AnchorManager.tsx` parameter calling slots caused TypeScript compiler errors.
*   **Fix:** Aligned the variable calling slots exactly: `addAnchor(title, pillarId, type, baseline, prompt, subItems, frequency)`.

### B. Clean-Slate Dead Code purging
*   Unused components or files referencing defunct Zustand properties are completely purged, resulting in a production build with **zero warnings** and superfast page load speeds.
