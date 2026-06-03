# TRELIS — FINAL PHASE BLUEPRINT (The Great Strip-Down)

> **Version:** 2.0.0 (Calm-Game Rebuild)
> **Date:** June 2026
> **Status:** Master plan — ready to generate step-by-step IDE prompts from.
> **One-line soul of this phase:** *Stop building a cathedral. Build the one door a tired person will actually walk through.*

---

## 0. HOW TO USE THIS DOCUMENT (read first — instructions for the AI assisting with the build)

You are being handed this blueprint cold, with no prior context. Your job is **not** to write the whole app at once. Your job is to read this entire document, then produce **clean, surgical, step-by-step prompts for an IDE coding agent (e.g. Cursor / Antigravity / Claude Code)** — one focused prompt at a time, in the build order given in Section 11.

Hard rules for you:
1. **One phase per prompt.** Never bundle the purge with the rebuild. Removal first, then construction.
2. **Always include a safety instruction** in each IDE prompt: after any deletion, the agent must verify the project still builds (`npm run build`) and fix any now-broken imports/references before moving on. Nothing half-deleted.
3. **No feature creep.** This phase is about *subtraction* and *polish*, not new systems. If the user asks for something not in this doc, flag it as "next iteration."
4. **Preserve the design philosophy in Section 1** in every prompt. The aesthetic is the product.
5. The existing repo is a Next.js (App Router, static export) + Capacitor (Android) + Supabase + Zustand + Tailwind v4 + Framer Motion app. Tech stack stays. We are removing weight, not changing foundations.

---

## 1. THE LAW (the philosophy that governs every decision)

Trelis is a calm operating ritual for a life — built for people who are intelligent, capable, and stuck in a loop of grand systems that collapse on the first imperfect day. The first user is the founder, who fits that description exactly. Everything below serves one person on their worst Tuesday, then generalizes.

**The Calm-Game Law (non-negotiable):**
Every other app is engineered to *keep you in*. Trelis is engineered to *get you out — into your life — fast*, and the only thing it ever celebrates is that you went. The reward never lives inside the app; it lives in the user's body, gut, sleep, and morning. The "game" is **self-trust momentum** — the quiet high of "I kept my word again" — not points, not slot-machine novelty, not streak-panic.

This means **forbidden** by design:
- No guilt notifications, no "you'll lose your streak!" panic, no variable-reward dark patterns, no infinite feeds, no engagement-maximizing anything.
- No friction on the worst day. Every core action must be completable while depleted, flat on the floor.
- No exposed jargon ("OS", "modules", "engine"). The app explains itself by being obvious.

**The five operating principles (carry into every screen):**
1. **Subtraction over addition.** When in doubt, remove. The win is the smallest version someone will do tired.
2. **The smallest kept promise.** Start a user at *one* unfailable thing. Make them *earn* the right to add more.
3. **Kill the reset loop.** Imperfect execution is the plan, not the failure. Never frame a miss as "breaking" anything. Buffer and forgiveness are built into the architecture.
4. **Action before insight.** The app exists to make one real thing happen today, not to be admired or read.
5. **No shame machine.** Celebrate; never accuse. A metric may go up and may pause — it may never punish.

**Premium standard:** Same calm palette as today, executed at "two Steve Jobs built this" level. Premium = restraint executed perfectly, not more ornament. The current build is functional but plain; the target is a Minimum *Lovable* Product.

---

## 2. CURRENT STATE → TARGET STATE (the shift in one table)

| Dimension | Current Trelis | Target Trelis |
| :--- | :--- | :--- |
| Identity | "Life Operating System", clinical, feature-dense | A calm daily ritual + a small set of personal anchors; self-evident, lovable |
| Core structure | 6 fixed MECE pillars, 8+ seeded protocol anchors | No pillars. One default keystone ("The Arc") + up to 5 personal anchors |
| First action | Tap a Pulse ring; nothing obvious follows | Do The Arc (night→morning ritual); everything flows from it |
| Tone of metrics | Streak / tokens / pillar scores (felt like pressure) | Promises Kept (only-goes-up) + a non-accusing streak |
| Journaling | Standalone encrypted "Notes of Life" vault | No vault. One-line reflections living inside The Arc & anchors |
| AI | On-device Gemma 4, founder-gated | Removed entirely. Returns post-MLP, deliberately |
| Wearables | Health Connect step auto-complete (broken) | Removed entirely |
| Social | Quiet Partner (silent, scoreless) | Kept — the one social mechanic that fits |
| Feel | Plain, static, jargon-exposed | Premium, intuitive, lightly animated, zero jargon |

---

## 3. THE PURGE (what is removed this phase — be explicit and surgical)

Remove these completely. After each block, the agent verifies the build is green.

**A. All AI / on-device LLM**
- Delete the Gemma model asset (`gemma-4-E2B-it.litertlm`) from `android/.../assets` and the repo.
- Delete `TrelisLLMPlugin.kotlin` and its registration.
- Remove the `litertlm-android` dependency from `android/app/build.gradle`, and the related `noCompress`/`aaptOptions` lines that exist *only* for the model.
- Remove the founder email gate (`isFounder` / `tharune4ir@gmail.com` checks) everywhere.
- Remove any "neural echo assistant" / "local AI" copy from Settings and elsewhere.

**B. Wearables / Health Connect**
- Remove `@capgo/capacitor-health` from `package.json`.
- Delete `useWearableSync.ts` and any step auto-complete logic in the dashboard.
- Remove `android.permission.health.READ_STEPS`, `READ_SLEEP`, and the `com.google.android.apps.healthdata` `<queries>` block from `AndroidManifest.xml`.
- Remove the "Device Integration / CONNECTED" card from Settings.

**C. The 6 Pillars**
- Remove pillar grouping from the dashboard (no pillar folders).
- Remove the pillar education grid from onboarding.
- Remove `hardest_pillar` logic and the **1.25× hardest-pillar multiplier** from the score calc.
- `pillar_id` on anchors becomes deprecated/optional (see Section 10 — do not hard-break existing rows; make it nullable and stop using it in UI).

**D. Standalone Journal ("Notes of Life")**
- Remove the `/notes` page and the `/journal-setup` passphrase wall.
- Remove the "Notes of Life" toggle/module entry.
- **Decision flagged (see Section 8):** retire the zero-knowledge passphrase flow (`keyVault` passphrase gating, "write down your key" screen). Reflection survives elsewhere as plain one-liners under standard row-level security.

**E. Membership / Plus**
- Remove the "Trelis Plus / Join the Plus Waitlist" card and the `/plus` page for now (nothing to sell without AI). Defer.

**F. Jargon & chrome**
- Remove "OS Configuration", "Active Modules", and any internal vocabulary from all user-facing screens.

> Everything in the `shelf/` folder stays untouched (it is gitignored). Do not delete planning docs.

---

## 4. THE CORE: "THE ARC" (the permanent default keystone)

This is the heart of the rebuild. **The Arc** is the one anchor every user has by default, can never delete, and that — held even at baseline — keeps a life from tearing.

**What it is:** the interconnected night-to-morning chain:
> **Wind-down → Sleep → Wake → "Still breathing" tap (gratitude) → Morning start.**

**Why it's named The Arc:** it operationalizes the founder's own symbol — *"I step through the seam and resume the arc."* Completing it each day = *you resumed the arc.* It matches the logo (see Section 9), it's calm rather than gamey, and it is the single highest-leverage daily behavior for sleep, rhythm, energy, and gut health.

**Structure of The Arc (kept deliberately tiny):**
1. **Evening Wind-down** (opens near the user's sleep window): two optional one-line fields — *"Park tomorrow's thoughts"* and *"One win today."* One calm "Close the Day" action. This is where reflection now lives.
2. **Sleep** — bounded by the user's wake/sleep windows from Settings (no tracking, no numbers).
3. **The Morning Tap** — the first thing on waking: a single, almost-sacred tap that means *"I'm here, still breathing, resuming."* This is the daily floor — the unfailable promise. It must be completable in one second, half-asleep.
4. **Morning start** — an optional light cue toward the user's chosen morning action (e.g. vision priming).

**Baseline / floor:** even if everything else in the day is skipped, **the Morning Tap alone counts as keeping The Arc.** That is the promise nobody can fail.

**The completion feeling:** when The Arc closes for the day, the moment must feel earned and calm — the single dopamine beat we *do* want (see Section 9, "The Completion Moment").

---

## 5. THE ANCHOR SYSTEM (the flexible structure that replaces pillars)

Anchors are "the structure that upholds a life on a daily basis." No categories, no pillars — just a small set of personal commitments, adaptable to any human.

### 5.1 How many — the triple-checked number
The folk belief is "humans manage ~7 things" (Miller's 7±2). That is half-myth — Miller meant it loosely. The replicated modern finding (Cowan) is that the focus of attention holds about **four** items, with a real working range of **three to five**; seven only appears when items can be grouped into bigger chunks. But daily anchors are *cued one at a time*, not held in memory simultaneously — so the true limiter is **how many new promises a person can keep at once without the perfectionist spiral.** Conclusion:
- **A new user starts with exactly ONE anchor: The Arc.** Nothing else.
- They **earn** more by keeping it. **Soft cap of 5 total** (The Arc + up to 4 personal anchors).
- At the cap, the app *gently resists* adding more: *"Five is plenty. Master these first."* The resistance is a feature — it prevents rebuilding a cathedral.

### 5.2 Discovery (how a user finds their anchors)
Never present a blank "add anchor" box to a new user. **Ask, and turn answers into anchors.** A short, calm set of prompts, e.g.:
- *"What's the one thing that, when you skip it, the day quietly falls apart?"*
- *"What do you keep promising yourself — and breaking?"*
- *"What would 'a good day' need to contain to feel like one?"*
The user's answers pre-fill anchor names. (Keep this set short; 2–3 questions.)

### 5.3 Privacy & play — "Mission Codenames"
If a user doesn't want a literal name (privacy, or sharing with a Quiet Partner), offer a **suggested cinematic codename** — calm, a little fun, the kind of thing a film gives a mission. Only they know what it means. Privacy and play in one move. (Suggest, never force; literal names are fine too.)

### 5.4 The universal anchor structure (one primitive, fits everything)
Every anchor — including The Arc — is made of four parts:
- **Name** — real, or a Mission Codename.
- **Shape** — exactly one of three:
  - **Check** — binary (did it / didn't). Most anchors.
  - **Chain** — 2–4 micro-steps that fire together (a habit-stack). Cap the steps low (same cognitive limit).
  - **Line** — one optional sentence of reflection. (This is where the old journal's value survives.)
- **Floor** — the one-tap baseline version for bad days (the existing "drop to baseline" logic — keep it; it is the anti-shame heart of the app). Every anchor should support a floor.
- **Quiet Track** — its own private history, calm color-coding, **never red**. Replaces the old pillar heatmap.

Examples: *"Sleep by 11"* = Check + floor ("in bed by 12"). *"Morning stack"* = Chain. *"One honest line"* = Line. Any human, any anchor.

### 5.5 Anchor Priority
Replaces both "Hardest Pillar Priority" and "Focus Three Priority." The user may mark a few anchors as priority; the rest quietly step back visually. No multiplier math — priority is about attention and visual weight, not score inflation.

---

## 6. SCREEN-BY-SCREEN SPEC

### 6.1 Routing & Landing
- The **landing page** becomes the real public home for logged-out visitors (root `/` when unauthenticated). Fix the current bug where it only appears at `/landing`.
- Logged-in users land on the **Dashboard** at `/`.
- Tagline + landing-page *copy* are **deferred** to a later pass (finalize after the app itself is locked). For now, just fix routing so the link opens the landing → sign-in flow correctly.

### 6.2 Login (`/login`)
- Keep essentially as-is (it's clean). Email + magic-link / password, Create Account, Forgot password, the required medical disclaimer line.
- No new elements needed.

### 6.3 First-Run Onboarding (replaces the old multi-step + pillar grid)
- A **light 2–3 step coachmark tour** that teaches by *doing*, then disappears forever:
  1. *Set your windows* (wake + sleep) → this defines The Arc.
  2. *Meet The Arc* (one sentence: "this is the one promise you keep every day").
  3. *Name your first personal anchor* (via the discovery question) — optional; can skip and add later.
- Calm focus-highlights and step dots are fine. After completion, never show chrome again. No jargon ("OS", "modules") anywhere.

### 6.4 Dashboard (`/`) — the redesign
Keep the design *language* (the circadian themes, the soft cards, the ring you both love) and repurpose it. Layout, top to bottom:
- **Header:** date, and **one** gentle number — **"Promises Kept"** (lifetime, only ever rises). The streak indicator is kept per your decision but shown in non-accusing form (see Section 7).
- **The Arc Ring:** the central ring becomes the **seam-and-arc** shape (an open ring with a visible gap — see Section 9). It fills as the day's anchors complete. On a zero/rest day it does **not** glare red; the seam simply sits open and calm — *"the door's open, resume tomorrow."*
- **Vision Priming card:** stays, prominent. It is the soul layer and the one feature the founder reliably used. Keep it editable.
- **The Arc** as the first, pinned item (with its Morning Tap + Wind-down).
- **Personal anchors** (up to 4) listed below as clean cards — no pillar groupings.
- **Add Anchor** — leads to the discovery flow, respects the soft cap of 5.
- **Completion Moment** when the day's arc is full (Section 9).

### 6.5 Settings — stripped to essentials
Keep only:
- Profile (email).
- **Daily Structure:** wake window + sleep window (these feed The Arc).
- **Vision Priming** text (editable).
- **Anchor Priority** (replaces Hardest Pillar + Focus Three).
- **Quiet Partner** (invite/manage).
- Sign out.
- The required medical/privacy disclaimer line.
Remove: Membership/Plus, Device Integration, Notes/Reflection links, Hardest Pillar, Focus Three, any AI mentions. **Fix typography everywhere** — current font sizes are too small and hurt legibility (this is a top complaint). Apply the real type scale from Section 9.

### 6.6 Quiet Partner — kept as-is in spirit
Silent, scoreless, presence-only. "Invite one person to silently share your journey. No scores, no details. Just presence." Keep the invite flow and the numbers-free nudges. Polish the UI to the premium standard; otherwise unchanged.

### 6.7 History / Tracks
- The old **pillar heatmap is dead** (no pillars). Replace with **per-anchor Quiet Tracks** (calm color, never red) plus an optional simple overall trend line. Keep it minimal — a glance, not a dashboard.

---

## 7. STREAKS & PAUSE TOKENS (founder decision + flagged reconciliation)

**Founder's decision:** keep the streak engine and Pause Tokens **as-is** (data model and logic unchanged). Honored.

**⚠️ FRIEND'S FLAG — DECIDE AT BUILD TIME (do not skip reading this):**
Earlier analysis (agreed by the founder) identified the visible streak counter as the single biggest reason the app went unused: for someone whose core wound is *relapse → shame → quit*, a number that can announce "STREAK BROKEN" is a trigger aimed at the softest spot. Keeping the *mechanic* is fine. The risk is in the *presentation*.

**Recommended reconciliation (keep the engine, defuse the wound):**
- Keep `current_streak`, `longest_streak`, `pause_tokens` exactly as built.
- Change only how they're **shown**: the streak may *celebrate* ("12 days strong 🌱→🔥") and may quietly **pause** on a rest/token day, but it must **never** display "broken", red, or accusatory states. A reset, if it happens, is shown as a soft "fresh arc" — never a punishment.
- Keep **"Promises Kept"** (the renamed lifetime count) as the primary, always-rising number — the emotional anchor.

Builder: implement the engine as-is; implement the **non-accusing presentation as the default**; leave the founder a clear toggle/decision point to revert to raw streak display if they insist.

---

## 8. REFLECTION — where it lives now (Notes of Life retired)

- **No standalone journal, no vault, no passphrase wall.**
- Reflection survives **only** as:
  - The **Line** shape on any anchor (one optional sentence).
  - The Arc's wind-down fields ("Park tomorrow's thoughts" / "One win today").
  - The editable Vision Priming string.
- **Storage / privacy decision (flagged):** retire the zero-knowledge passphrase encryption for these one-liners — it's too heavy for a calm, low-friction reflection model and the non-recoverable-key wall actively kills first-day use. Store reflections privately under existing Supabase row-level security (user-only access). The heavier client-side encryption can return later, together with AI, when there's a real vault to protect. *(If the founder wants ZK retained even for one-liners, that's a build-time choice — but it reintroduces the passphrase friction.)*

---

## 9. DESIGN SYSTEM & UX STANDARDS (the MLP bar)

**Palette:** unchanged. Canvas `#F7F6F2`, surface `#FFFFFF`, ink `#1C1C1E` / `#5C5C5E`, accent teal `#2A7F7F`, plus the circadian themes (morning canvas / day crisp / evening sepia / night dark). Do not change colors.

**The logo & the Arc Ring (the philosophy made visible):**
- The Trelis mark is an **open ring — an arc with a seam (gap)**, not a closed circle. Keep it. A closed circle = a loop you can't escape (the reset loop); the open ring = *"the loop is broken; there's always a door."* This is the brand's whole meaning and it is already in the mark.
- The dashboard ring must **echo the logo**: an open arc with a visible seam that fills with the day. It never closes into a pressure-gauge and never turns red. The brand mark and the daily ring say the same sentence.

**Typography:** establish a real type scale (clear hierarchy, legible body — fix the current too-small text on Settings and the old Notes screens). Never more than two font weights on a screen (400 / 600), per the existing rule.

**Motion:** use the existing Framer Motion spring (`stiffness 300, damping 30`). Motion should *feel* — calm, intentional, never bouncy or attention-grabbing. Every state change is a soft spring, not a cut.

**Emoji policy:** strip default-library emoji clutter. Allow at most a few intentional, meaningful glyphs (e.g. the sprout→flame streak symbol). Premium = restraint.

**The Completion Moment (design this with obsessive care):**
- When the day's arc fills, deliver the one dopamine beat we *want*: a brief, beautiful, calm celebration that says *"you resumed the arc"* — then gently points the user *out of the app* and into their life. It is the most important emotional beat in the product. The current "Close the Day" is too weak; this is where lovability is won.

**Notifications (where wellness apps betray their philosophy — don't):**
- At most **one** gentle, opt-in nudge, tied to the user's wind-down window. Never guilt, never a pull, never "you forgot!" If in doubt, send nothing.

---

## 10. DATA MODEL CHANGES (conceptual — no SQL here; the IDE agent writes migrations)

Describe changes; let the coding agent implement safe migrations.
- **`user_anchors`:** make `pillar_id` nullable / deprecated (stop using in UI; don't hard-delete to avoid breaking existing rows). Introduce the concept of a **shape** (check / chain / line) — may reuse existing `type` + `sub_items`; consolidate cleanly. Ensure The Arc is a special, undeletable default anchor.
- **`anchor_logs`:** keep. The `reflection_text` field now stores plain one-liners under RLS (per Section 8 decision) rather than ZK ciphertext — confirm at build time.
- **`user_state`:** keep `current_streak`, `longest_streak`, `pause_tokens`. **Remove** `hardest_pillar` / `hardest_pillar_until` usage. Rename `lifetime_anchor_count` to surface as **"Promises Kept"** (UI rename; column can stay).
- **`daily_rituals`:** keep what supports The Arc (wake/sleep windows, morning/evening completion, win-of-the-day). Drop anything tied to step counts / wearables.
- **`quiet_partners` / `partner_nudges`:** keep unchanged.
- **Remove** any tables/columns existing solely for the journal vault or AI, if present.
- Keep RLS on everything.

---

## 11. BUILD SEQUENCE (the order to generate IDE prompts in)

Generate one IDE prompt per step. Verify green build after each.

1. **[COMPLETED]** **Purge — AI/Gemma** (Section 3A). Build check.
2. **[COMPLETED]** **Purge — Wearables/Health** (Section 3B). Build check.
3. **[COMPLETED]** **Purge — Journal vault + passphrase wall** (Section 3D, 8). Build check.
4. **[COMPLETED]** **Purge — Membership/Plus + jargon/chrome** (Section 3E, 3F). Build check.
5. **[COMPLETED]** **De-pillar** the data layer and UI (Section 3C, 10) — make `pillar_id` optional, remove pillar folders/grid/multiplier. Build check.
6. **[COMPLETED]** **The Arc** — implement the keystone anchor: wind-down, Morning Tap floor, windows binding, completion (Section 4).
7. **[COMPLETED]** **Anchor system** — the universal primitive (name/shape/floor/track), 1-start / 5-cap, discovery questions, codenames, Anchor Priority (Section 5).
8. **[COMPLETED]** **Dashboard redesign** — seam-and-arc ring, Promises Kept header, vision priming, anchor cards, completion moment (Section 6.4, 9).
9. **[COMPLETED]** **Streak presentation** — non-accusing display layer over the kept engine (Section 7).
10. **[COMPLETED]** **Settings strip + typography fix** (Section 6.5, 9).
11. **[COMPLETED]** **First-run onboarding tour** (Section 6.3).
12. **[COMPLETED]** **History → per-anchor Quiet Tracks** (Section 6.7).
13. **[COMPLETED]** **Quiet Partner polish** (Section 6.6).
14. **[COMPLETED]** **Routing/landing fix** (Section 6.1).
15. **[COMPLETED]** **Full design polish pass** — motion, spacing, completion moment, emoji cleanup, premium QA against Section 9.
16. **[COMPLETED]** **Final:** regenerate `TRELIS_LIFE_SOURCE_OF_TRUTH.md` to reflect the as-built v2.0 app.

---

## 12. DEFERRED / OUT OF SCOPE (revisit after this iteration)

- AI / on-device model (returns deliberately, post-MLP, with a real reason to exist).
- Landing-page copy + final tagline.
- Monetization / Plus.
- Any additional anchors beyond the core flexible system.
- iOS / App Store.

---

## 13. OPEN DECISIONS FOR THE FOUNDER (resolve while generating prompts)

1. **Streak presentation** (Section 7): accept the non-accusing default, or insist on raw streak display?
2. **Reflection storage** (Section 8): plain-under-RLS (recommended, low friction) vs. keep ZK passphrase even for one-liners (heavier)?
3. **The keystone name:** "The Arc" (recommended) vs. The Crossing / The Seam / The Keystone.
4. **Onboarding length:** confirm 2–3 steps max.
5. **Codename starter set:** want a curated list of suggested mission codenames authored now, or generated later?

---

*End of blueprint. Subtraction first. One kept promise tomorrow morning. Resume the arc.*
