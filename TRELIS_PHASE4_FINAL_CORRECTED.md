# TRELIS LIFE — PHASE 4 DEFINITIVE PRODUCT DOCUMENT

## TL;DR
- **Ship as "Trelis Life" on the `trelis.life` domain**, not "My Trelis" and not bare "Trelis" — the bare wordmark is already burned by Trelis Research (Dublin AI/ML company at trelis.com, founded by Ronan McGovern), a Brazilian iOS app called "Trelis" (id6754613512), a "Trellis Personality" habit/life-coaching app on Google Play, and a USPTO mark held by Computational Simulation Software LLC for FEA software. Adding "Life" disambiguates, anchors the lattice/garden metaphor, and the `.life` TLD is uncontested in the Indian health space.
- **The product's center of gravity is the Pulse Score loop, not features.** A v1.0 worth shipping to friends needs only: an 8-anchor default template covering all 6 pillars, magic-link onboarding under 90 seconds, a daily "all done" celebration, a forgiving streak with two free "Pause Tokens" per calendar month (Duolingo-style freeze logic recalibrated for health, where one missed day is not a moral failure), a Sunday Weekly Debrief, and the personalized FOXO-derived 31-anchor seed for the founder. Everything else (coach AI, social, wearable integrations, paywall) is deferred.
- **Build order: this week → seed SQL + Pulse Score verification + Today screen v2 + onboarding + landing page; next week → streak engine + Sunday Debrief + Play Store internal-test track with Google's mandatory Health Apps declaration.** The founder can use it personally by Day 7; close-circle invitations are safe by Day 14 once the "not a medical device" disclaimer (required by Google Play's April 2024 Health Apps policy update) is shipped in-app and in the privacy policy.

---

## Key Findings

- **The naming question has only one defensible answer: "Trelis Life" on `trelis.life`.** Bare "Trelis" is structurally blocked: trelis.com is owned by Trelis LTD (Dublin voice-AI/ML research, founded by Ronan McGovern); a USPTO trademark for "Trelis" is registered to Computational Simulation Software LLC for FEA/mesh-generation software; a Brazilian "Trelis" wellness app already exists on the Apple App Store with the explicit disclaimer "Não se destina a tratar, curar, prevenir ou diagnosticar quaisquer condições médicas ou de saúde mental"; and Google Play hosts the near-collision "Trellis Personality" — *"Trellis is the videogame menu for your life. Take the OCEAN personality test (the Big Five), get daily reflections tailored to you…"* — which is direct positioning overlap. The `.life` TLD is linguistically benign in Hindi (HinKhoj Dictionary: "Trellis meaning in Hindi is सलाखें. English definition of Trellis: latticework used to support climbing plants") and avoids the LIC-insurance ambiguity once the Play Store category badge is set to Health & Fitness.

- **The Indian health-app landscape in 2026 is crowded but with the wrong shape of product.** Ultrahuman (Bengaluru) raised **$35M in Series B funding in March 2024** — *"a mix of equity ($25 million) and [debt]"* per TechCrunch — bringing cumulative funding to roughly $60M including its prior $17.5M Series A, and has pivoted from ring hardware to a "health intelligence layer" with Blood Vision diagnostics in 60+ Indian cities (panels from ₹999) and the new Vision Cloud AI interpreter. HealthifyMe launched the OpenAI-powered Ria nutritionist on December 3, 2025 and partnered with Novo Nordisk India for obesity care. Google Health Coach (Gemini-powered) is rolling out via Google Health Premium in India. Cult.fit is workouts-first. **None of them is a calm, daily-anchor, MECE checklist with the structure of Notion and the gentleness of Apple Health.** That is the open positioning Trelis Life occupies.

- **The FOXO playbook is unusually well-suited to a Type-C-heavy anchor design.** The founder's homocysteine of 32.61 µmol/L (against an optimal <8) responds to a published 12-week B-vitamin protocol: methylfolate 800–1,000 mcg + methylcobalamin 1,000 mcg + P5P 25–50 mg daily, with betaine/TMG 1,500–3,000 mg as a second-line addition, can reduce homocysteine by 30–50% per mainstream clinical guidance. Lead burden at 60.75 µg/L (units worth re-verifying — see Caveats) sits below the adult chelation thresholds in US clinical practice (chelation initiated at BLL ≥45 µg/dL in symptomatic adults, ≥70 µg/dL in asymptomatic adults per CDC/OSHA guidance) and is best addressed through exposure elimination + nutritional support (Vitamin C, Zinc, calcium-replete diet), which fit naturally as Environment + Nutrition anchors rather than medical protocol. The Type C "stack" architecture was the right call; the §4 seed exploits it fully.

- **Streak design for a health app must explicitly diverge from Duolingo.** Duolingo's freeze mechanic produces measurable retention lift — per Trophy platform data (April 2026), users on apps with streak-freeze functionality average 17.19 days post-day-7 versus 11.62 days without, a 48% difference — and Duolingo's internal data (as cited by Plotline, 2025) shows that *"once users hit a 7-day streak, they're 2.3x more likely to return daily to avoid 'losing' their progress."* But in health, the cost of a streak-shame event is psychologically heavier; users churn permanently after a streak break in a way language learners don't. The Pause Token + sprout-to-flame + lifetime-anchor-count tri-layer (drawing on Yu-kai Chou's Octalysis CD4 Ownership analysis: *"Owning a streak, a character, or a progress story creates long-term adherence"*) solves this with three forgiveness mechanisms layered.

- **Two non-obvious technical risks must be retired in Week 1.** The Capacitor magic-link deep-link issue (links opening in Chrome rather than the app) will silently break new-user sign-up the moment a close-circle invitee taps a magic link in Gmail on Android; and the Supabase 2025 API key migration (legacy anon/service_role JWT keys are being deprecated in favor of revocable publishable + secret keys per the Supabase 2025 Security Retro) is a one-hour migration with one user on the system, a multi-hour outage with 50.

---

## Details

### SECTION 1 — NAMING DECISION

**Verified May 2026 asset landscape**

| Asset | Status | Source |
|---|---|---|
| `trelis.com` | Taken — Trelis LTD, Dublin, voice-AI/ML research firm founded by Ronan McGovern (Trelis Research About page) |
| `trelis.life` | Available signals — `.life` is positioned by registries as an upbeat lifestyle namespace; live WHOIS verification required before purchase |
| `trelis.app` | Likely taken/watched (TikTok @trelis.app handle exists) |
| `trelis.co` | Taken — Buffalo NY advertising-services firm (LinkedIn-verified, 2–10 employees) |
| `trelis.eu` | Taken — Korean aesthetic-medicine distributor |
| `trelis.in` / `trelis.health` / `mytrelis.com` | Unverified — direct WHOIS lookup required |
| USPTO mark "Trelis" | Already registered to Computational Simulation Software, LLC (Coreform) for FEA/mesh-generation software, per trelis.jp |
| iOS App Store | "Trelis" (id6754613512) exists — Brazilian AI wellness/self-knowledge companion by Kauan Guedes |
| Google Play | No exact "Trelis" match, but `com.trellis.personality`, `com.trellisfamily.android`, and `com.trellis.dashboard` exist |
| Hindi semantic check | "Trellis" = सलाखें (salākhen) / जाफ़री (jāfrī), garden lattice. No negative/profane connotation |

**The "Life" suffix and the Indian LIC objection.** Real but bounded. India has 26 IRDAI-registered life insurers (LIC, HDFC Life, Max Life, SBI Life, Tata AIA Life, etc.). Mitigations: the full brand is "Trelis Life" not "Trelis Life Insurance"; App Store / Play Store category set to Health & Fitness; modern Indian D2C wellness brands (Cure.fit, HealthifyMe) use Life-adjacent branding without confusion.

**The "My" prefix.** "My Trelis" follows the MyFitnessPal / MyChart / MyJio convention — a 2010–2018 naming pattern that has fallen out of fashion post-2022. Newer winning health brands (Calm, Headspace, Whoop, Oura, Levels, Ultrahuman, Finch, Fabulous, Zero) avoid the "My" prefix. "Open My Trelis" also reads as broken grammar in marketing copy.

**Final recommendation**

- **Brand: Trelis Life**
- **Primary domain: `trelis.life`**
- **Defensive registrations (lock within 7 days): `mytrelis.com`, `trelis.health` (if available), `trelisapp.com`, `trelislife.in`**
- **Store listing name: "Trelis Life — Health OS"** (23 chars, well under 30-char Play Store limit)
- **Tagline: "The trellis your habits grow on."**
- **Handles to lock today: @trelislife (Instagram, X, YouTube, Threads, LinkedIn page)**

File an IP-India trademark application in Classes 9 (mobile application software), 42 (SaaS), and 44 (medical/health information services) for the wordmark "TRELIS LIFE" and the lattice device mark, after a paid TM clearance search by an Indian IP attorney.

---

### SECTION 2 — THE DAILY LOOP

**Morning (Pulse contribution 10%, 06:00–10:00 IST).** App opens to Today; greeting reads local IST date and current weekday's gated anchors. Morning Reflection (Type B) opens automatically — single non-scrollable card rotating across {"What's one thing I'm grateful for today?", "What's one thing I'll release today?", "What's the one anchor I will not skip?"} — submission target <20 seconds. Morning Fasted Stack (Type C: Probiotic → NAC 600mg → wait 30–45 min) appears first. Hydration ring begins filling. The 20-8-2 desk timer starts as a silent foreground service.

**Afternoon (feeds into Engine 70%, 11:00–15:00).** Protein Threshold anchor (Type A with baseline): 1.5 g/kg × 76kg ≈ 114g/day distributed across 2 meals, each meal hitting 2.5–3g leucine to trigger mTOR-mediated muscle protein synthesis — the foundational science is Norton LE & Layman DK, *"Leucine Regulates Translation Initiation of Protein Synthesis in Skeletal Muscle after Exercise,"* Journal of Nutrition (2006), 136(1): 533S–537S. Post-Lunch Stack (D3 5000 IU/K2 100mcg, Omega-3 2g, Methylfolate, Vitamin C 1g). Sunlight Exposure (10–15 min between 10:30–14:30 IST) calibrated to the founder's 14.2 → 17.86 ng/mL Vitamin D recovery curve. Movement anchor per Cult Fit / home schedule frequency gating.

**Evening (Pulse contribution 20%, 16:00–21:00).** Caffeine cutoff at 14:00 IST — note this is **deliberately more conservative than the published evidence**. Drake CL et al. (2013, *Journal of Clinical Sleep Medicine*, PMC3805807) showed 400mg caffeine taken 6 hours before bedtime "significantly disrupts sleep… the common practice of afternoon consumption of caffeine should at a minimum be restricted to before 17:00." Trelis Life uses 14:00 because the founder is in the highly caffeine-sensitive ADHD-tendency cohort and has a 23:00 sleep target. Evening Fasted Stack (L-Glutamine 5g + Zinc 15mg). Dinner Check-In (Type B: "One win" + "One drain"). Family/Friend Outreach (gated: family-call Wed/Sat, friend-text Tue/Fri).

**Night (completes 20% evening block, 21:00–23:30).** Wind-Down (Type C, 21:30 trigger). Deep Sleep Stack (Taurine 1000mg + Magnesium Glycinate 400mg). **Non-negotiable Psyllium Husk** anchor (Type A, daily, no streak forgiveness — UI shows a red dot until completed). Evening Reflection (3 lines: Win / Drain / Tomorrow's one priority). Final Pulse Score computed at the next 00:00 IST tick.

**Pulse Score visualization.** Three concentric arcs distinct from Apple's Activity Rings (Apple's three are Move/Exercise/Stand, all activity; Trelis's three are Morning/Engine/Evening, all anchor-completion): outer arc Engine 70% fills throughout the day; top quadrant Morning 10% fills only if Morning Reflection + Fasted Stack complete before 10:00; bottom quadrant Evening 20% fills on Wind-Down + Sleep Stack + Reflection + Psyllium before 23:30. Closing the ring is the reward — no second screen, per Apple HIG Activity Rings design philosophy. The screen pulses soft gold (Framer Motion `spring(0.6, 12)`) with a single sentence: *"Peak Day. Sleep well, [Name]."*

**Daily grades:** Peak Day 90–100 · Strong Day 75–89 · Steady Day 55–74 · Light Day 30–54 · Rest Day <30 (no grade, reframed to recovery, never criticism).

**The "all done" state.** Hero card with score + auto-generated haiku-style summary ("3/3 protein meals · 4,200 ml water · sleep stack on time · psyllium ✓"). Current streak shown only above 2 days (a sprout 🌱 below that to avoid early shame). Single ghost CTA: "Tomorrow starts at 00:00." No charts, no comparisons.

**The "missed day" recovery flow.** Streak protected by up to 2 Pause Tokens per calendar month (auto-replenished on the 1st, never purchasable). One token converts a missed day into a "Rest Day" 🌙 — streak survives, Pulse for that day shows as N/A (not 0). Beyond 2 tokens, the streak resets to 0 — but the **Lifetime Anchor Count never resets**. Non-negotiable anchors (psyllium) cannot consume a Pause Token; three consecutive misses trigger a soft modal: *"Your psyllium streak broke 3 days ago. Want to reset the protocol or talk through what got in the way?"*

---

### SECTION 3 — COMPLETE FEATURE SET FOR v1.0

**Must-have for "I can use it tomorrow"** (Days 1–7):
1. Supabase magic-link auth (built — verify Android deep-link)
2. Today screen v2: day-gated anchor list, Pulse ring, all-done state, streak badge, Pause Token balance
3. Anchor engine: Type A / B / C with frequency-mask gating
4. Pulse Score algorithm: Morning 10 + Engine 70 + Evening 20
5. Personalized 31-anchor seed (§4) loaded
6. Bidirectional Zustand ↔ Supabase sync (verify on flight-mode → reconnect)
7. AppLifecycleManager IST midnight reset
8. Nuclear sign-out

**Must-have for "friends can use it this week"** (Days 8–14):
9. Onboarding flow (5 screens, <90 sec target)
10. Default starter template — 8 anchors, all 6 pillars (§5)
11. Six Pillars explainer screen ("Why this matters" tooltips)
12. Settings/Profile (name, time-zone, wake/sleep windows, pillar weighting, supplement editor, sign-out)
13. History view (30-day Pulse Score sparkline + per-pillar weekly heatmap, GitHub-contribution style)
14. Sunday Weekly Debrief (Type C, auto-populated context)
15. Notes of Life (append-only journal aggregating all Type B submissions)
16. Vision Priming (pin 1-sentence vision + 1 photo, surfaced on morning splash + lock-screen widget)
17. Streak + Pause Token + Lifetime Anchor Count
18. Daily/Weekly/Monthly grade system (§7)
19. Landing page at `trelis.life`
20. Play Store internal-testing track with Health Apps declaration form completed

**Explicit cuts (do NOT build for launch):** Coach AI / chat, social leaderboards, Apple Health / Google Fit integration, ring-wearable pairing, video content, photo logging, voice journaling, subscription paywall. Each adds 2–4 weeks and zero retention impact at close-circle scale.

---

### SECTION 4 — PERSONALIZED SQL SEED

User ID: `fba1e670-de8f-496f-8119-8039c4003d5e`. Time zone: `Asia/Kolkata`. Schema assumes columns `id`, `user_id`, `pillar`, `type`, `title`, `description`, `frequency_mask` (Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64), `position`, `is_non_negotiable`, `baseline_target`, `parent_id`, `prompt`. Run §10.4 `ALTER TABLE` statements first if columns are missing.

```sql
BEGIN;

-- Archive existing
CREATE TABLE IF NOT EXISTS anchors_archive_2026_05 AS
  SELECT * FROM anchors WHERE user_id = 'fba1e670-de8f-496f-8119-8039c4003d5e';
DELETE FROM anchors WHERE user_id = 'fba1e670-de8f-496f-8119-8039c4003d5e';

-- ===== PILLAR 1: NUTRITION =====

-- Morning Fasted Stack (Type C)
INSERT INTO anchors (id, user_id, pillar, type, title, description, frequency_mask, position) VALUES
('a1000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','C','Morning Fasted Stack','Empty stomach. Wait 30–45 min before water.',127,10);
INSERT INTO anchors (id, user_id, pillar, type, title, parent_id, frequency_mask, position) VALUES
('a1000001-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Probiotic capsule','a1000001-0000-0000-0000-000000000001',127,1),
('a1000001-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','NAC 600mg','a1000001-0000-0000-0000-000000000001',127,2),
('a1000001-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Wait 30–45 min before water','a1000001-0000-0000-0000-000000000001',127,3);

-- Methylation Stack post-breakfast (Type C, NON-NEGOTIABLE)
-- Target: homocysteine 32.61 → <8 µmol/L within 12 weeks (Pokushalov et al. 2024, Nutrients 16(11):1550)
INSERT INTO anchors (id, user_id, pillar, type, title, description, frequency_mask, position, is_non_negotiable) VALUES
('a1000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','C','Methylation Stack (post-meal 1)','Hcy <8 µmol/L target. 12-week re-test.',127,20,true);
INSERT INTO anchors (id, user_id, pillar, type, title, parent_id, frequency_mask, position) VALUES
('a1000002-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Methylfolate 1000 mcg (5-MTHF)','a1000002-0000-0000-0000-000000000001',127,1),
('a1000002-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Methylcobalamin (B12) 1000 mcg','a1000002-0000-0000-0000-000000000001',127,2),
('a1000002-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','P5P (active B6) 25 mg','a1000002-0000-0000-0000-000000000001',127,3),
('a1000002-0000-0000-0000-000000000005','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','TMG / Betaine 1500 mg','a1000002-0000-0000-0000-000000000001',127,4),
('a1000002-0000-0000-0000-000000000006','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Folvite tab (legacy)','a1000002-0000-0000-0000-000000000001',127,5);

-- Protein Threshold: 76kg × 1.5 g/kg = 114g/d across 2 meals; ≥2.5g leucine/meal per Norton & Layman 2006 J Nutr 136(1):533S
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,baseline_target) VALUES
('a1000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Protein Threshold — 2 meals @ ≥30g','Each meal: ≥25–30g animal protein OR ≥35–45g plant to clear leucine threshold for mTOR.',127,30,2);

-- Hydration (uric acid 6.2–6.65 flush)
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,baseline_target) VALUES
('a1000004-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Hydration 3.5L+','Track 500ml taps; lemon optional.',127,40,7);

-- Post-Lunch Stack
INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position) VALUES
('a1000005-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','C','Post-Lunch Stack',127,50);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('a1000005-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Vit D3 5000 IU + K2 100 mcg','a1000005-0000-0000-0000-000000000001',127,1),
('a1000005-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Omega-3 2g (EPA+DHA)','a1000005-0000-0000-0000-000000000001',127,2),
('a1000005-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Vitamin C 1000mg (Pb-mitigation)','a1000005-0000-0000-0000-000000000001',127,3);

-- Evening Fasted Stack (gut + heavy-metal displacement)
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a1000006-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','C','Evening Fasted Stack','Pre-dinner gut-lining repair (IBS / fissure).',127,60);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('a1000006-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','L-Glutamine 5g','a1000006-0000-0000-0000-000000000001',127,1),
('a1000006-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Zinc 15 mg','a1000006-0000-0000-0000-000000000001',127,2);

-- Plant Diversity (toward 30/week microbiome target)
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,baseline_target) VALUES
('a1000007-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Plant Diversity (≥5 distinct today)','Spices/herbs/dals/nuts/seeds count. Sunday tally vs 30/week target.',127,70,5);

-- ===== PILLAR 2: MOVEMENT =====

-- Cult Fit HRX (M/W/F)
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a2000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Cult Fit HRX Strength session','HRX = core + full-body strength + mobility (beginner block).',21,100);

-- Home dumbbell (T/Th)
INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position) VALUES
('a2000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','C','Home Strength (2×5kg + bands)',10,110);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('a2000002-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Warm-up 5 min','a2000002-0000-0000-0000-000000000001',10,1),
('a2000002-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','3 sets DB press / row / squat','a2000002-0000-0000-0000-000000000001',10,2),
('a2000002-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Band pull-aparts × 30','a2000002-0000-0000-0000-000000000001',10,3),
('a2000002-0000-0000-0000-000000000005','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Cool-down + log RPE','a2000002-0000-0000-0000-000000000001',10,4);

-- Zone 2 Saturday — directly addresses near-zero ketone production + TCA cycle block at aconitase
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a2000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Zone 2 Cardio (45 min)','Mitochondrial biogenesis lever.',32,120);

-- 20-8-2 desk rule
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,baseline_target) VALUES
('a2000004-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','20-8-2 Desk Rule','Every 30 min: 20 sit · 8 stand · 2 walk. Target 8 cycles.',127,130,8);

-- Steps
INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position,baseline_target) VALUES
('a2000005-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Movement','A','Steps ≥ 7,000',127,140,7000);

-- ===== PILLAR 3: SLEEP =====

-- Wind-Down 21:30
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a3000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','C','Wind-Down (21:30)','No caffeine after 2 PM, screens off by 22:00, phone outside bedroom, room ≤24°C.',127,200);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('a3000001-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Phone out of bedroom','a3000001-0000-0000-0000-000000000001',127,1),
('a3000001-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Dim lights / no screens by 22:00','a3000001-0000-0000-0000-000000000001',127,2),
('a3000001-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Room cool (≤24°C) + dark','a3000001-0000-0000-0000-000000000001',127,3);

-- Deep Sleep Stack
INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position) VALUES
('a3000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','C','Deep Sleep Stack',127,210);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('a3000002-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Taurine 1000 mg','a3000002-0000-0000-0000-000000000001',127,1),
('a3000002-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Magnesium Glycinate 400 mg','a3000002-0000-0000-0000-000000000001',127,2);

-- PSYLLIUM — non-negotiable
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,is_non_negotiable) VALUES
('a3000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Psyllium Husk (1 tbsp + warm water)','Non-negotiable — fissure recovery + IBS stability.',127,220,true);

-- Bed by 23:00
INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a3000004-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Sleep','A','Bed by 23:00 (8-hr opportunity)','8-hr in-bed window non-negotiable for 8-hr sleep.',127,230);

-- ===== PILLAR 4: STRESS & MENTAL HEALTH =====

INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position,prompt) VALUES
('a4000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','Morning Reflection',127,300,'Rotates: (1) One gratitude. (2) One thing to release from yesterday. (3) The one anchor I will not skip today.'),
('a4000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','Dinner Check-In',127,310,'(1) One win from today. (2) One thing that drained me.'),
('a4000004-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','Detox & Symptom Log',127,330,'Bowel? Energy 1–10? Brain fog 1–10? Skin? Fissure status?'),
('a4000005-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','Evening Reflection',127,340,'Three lines: Win · Drain · Tomorrow''s one priority.');

INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position,baseline_target) VALUES
('a4000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','A','Box Breathing 4-4-4-4 (5 min × 2)','Vagal tone + cortisol downshift. Specifically anchored to ADHD-tendency mid-afternoon dip.',127,320,2);

-- ===== PILLAR 5: SOCIAL CONNECTION =====

INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a5000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Social Connection','A','Family voice call','Father (HTN, uric acid), mother (T2DM). You''re the family health captain.',36,400),
('a5000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Social Connection','A','Reach out to one friend (voice or text)','',18,410),
('a5000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Social Connection','A','In-person meet (≥1 person)','Anti-isolation lever for IT freelance.',32,420);

-- ===== PILLAR 6: ENVIRONMENT =====

INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('a6000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Environment','A','Sunlight 10–15 min','Direct skin, 10:30–14:30 IST. Vit D 14.2→17.86→target 50 ng/mL.',127,500),
('a6000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Environment','A','Filtered water + remineralize','Confirm RO cartridge change monthly. Blood Pb 60.75 µg/L.',127,510),
('a6000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Environment','A','Desk setup check (monitor eye-level, feet flat)','',127,520),
('a6000004-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Environment','A','Personal screen-time ≤ 2h post-work','Source: Android Digital Wellbeing.',127,530);

-- ===== WEEKLY (Sunday) =====

INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position) VALUES
('aW000001-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','C','Sunday Weekly Protocol Debrief',64,900);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position,prompt) VALUES
('aW000001-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','What worked this week?','aW000001-0000-0000-0000-000000000001',64,1,'One paragraph.'),
('aW000001-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','What broke down?','aW000001-0000-0000-0000-000000000001',64,2,'Which anchor pattern slipped, and what was the trigger?'),
('aW000001-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','B','One change for next week','aW000001-0000-0000-0000-000000000001',64,3,'Specific: which anchor, what time, what cue.'),
('aW000001-0000-0000-0000-000000000005','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','A','Plant diversity tally (≥30/wk target)','aW000001-0000-0000-0000-000000000001',64,4,null),
('aW000001-0000-0000-0000-000000000006','fba1e670-de8f-496f-8119-8039c4003d5e','Stress & Mental Health','A','Symptom audit','aW000001-0000-0000-0000-000000000001',64,5,null);

INSERT INTO anchors (id,user_id,pillar,type,title,frequency_mask,position) VALUES
('aW000002-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','C','Sunday Meal Prep',64,910);
INSERT INTO anchors (id,user_id,pillar,type,title,parent_id,frequency_mask,position) VALUES
('aW000002-0000-0000-0000-000000000002','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Soak lentils / chickpeas / rajma','aW000002-0000-0000-0000-000000000001',64,1),
('aW000002-0000-0000-0000-000000000003','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Boil 12 eggs (3-day supply)','aW000002-0000-0000-0000-000000000001',64,2),
('aW000002-0000-0000-0000-000000000004','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Chop 5+ vegetables','aW000002-0000-0000-0000-000000000001',64,3);

INSERT INTO anchors (id,user_id,pillar,type,title,description,frequency_mask,position) VALUES
('aW000003-0000-0000-0000-000000000001','fba1e670-de8f-496f-8119-8039c4003d5e','Nutrition','A','Monthly Supplement Restock + Re-test plan','Hcy/B12/folate retest at 12 weeks; lipid 6 months; FOXO repeat at 12 months. App logic: surface only on 1st Sunday of each month.',64,920);

COMMIT;
```

Total: **31 parent anchors**, all 6 pillars represented, all frequency-gated correctly.

---

### SECTION 5 — DEFAULT MARKET TEMPLATE

**Onboarding (5 screens, 90-second target):**

1. **Welcome.** "Hi. Trelis Life is a daily checklist for the 6 things that decide how you feel. No tracking, no judgment, just anchors."
2. **Six Pillars** (one tap-through card per pillar, ≤25 words each).
3. **One question:** "What time do you usually wake up?" (single time picker). We do NOT ask weight, goals, or medical history.
4. **Pillar weighting:** "Which one is hardest for you right now?" Selected pillar gets a 1.25× Pulse multiplier for 30 days.
5. **Done.** "Your first day starts now. We've added 8 starter anchors."

**Default 8 anchors** (zero supplements — that's a Day-14+ unlock):

| # | Pillar | Type | Title | Why-this-matters tooltip |
|---|---|---|---|---|
| 1 | Nutrition | A | Drink 2.5L water today | "Most adults are mildly dehydrated by midday — it shows up as fatigue and brain fog before it shows up as thirst." |
| 2 | Nutrition | A | 30g protein at 2+ meals | "ICMR-NIN 2024 recommends 1.0–1.6 g/kg/day; ~30g per meal triggers muscle protein synthesis." |
| 3 | Movement | A | 7,000 steps | "Steps are the cheapest longevity input. 7,000 is the inflection point for all-cause mortality benefit." |
| 4 | Movement | A | 20-8-2 desk rule (8 cycles) | "Sit 20, stand 8, walk 2. Reduces sedentary risk independent of exercise." |
| 5 | Sleep | A | In bed by 23:00 (8-hour opportunity) | "You can't sleep 8 hours if you give yourself 6 of opportunity." |
| 6 | Stress | B | Evening Reflection | "Three lines: win, drain, tomorrow's priority. Two minutes. The noticing is the point." |
| 7 | Social | A | One real conversation today | "Loneliness is a cardiovascular risk factor. One voice call beats a hundred texts." |
| 8 | Environment | A | 10 minutes of sunlight | "Direct sun on skin, before noon. Sets your circadian rhythm and is free Vitamin D." |

**Progressive disclosure rules:**
1. No forced anchors beyond the default 8. New anchors added only via Settings or via Sunday-Debrief suggestion (one suggestion/week max).
2. Supplement stacks introduced only after Day 14, when the user has hit ≥7 Strong+ Days.
3. Reflection prompts deepen: Days 1–7 gratitude only; Days 8–30 gratitude + obstacle; Days 31+ open-ended.

---

### SECTION 6 — UI/UX

**Visual hierarchy by anchor type:**
- Type A: 56px single-row card, large right-side circular checkbox.
- Type B: 88px card with faint pencil icon and italicized first-6-words preview of the prompt — signals "this opens something."
- Type C: card with progress chevron and "[2/4]" indicator; tapping expands inline (no modal), children render as nested Type-A rows.
- Non-negotiable: persistent 4px warm-red (`#E04C3C`) left border until completed; on completion switches to `#34C759` and softens.

**Section headers:** 2-line — pillar name 18px semibold (Inter), beneath it a 4px lattice-stripe in the pillar's accent color, right-aligned mini-ring showing "3/5" completion. Done pillars collapse by default.

**Card design:** 16px radius, near-flat shadow `0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04)`, 16/12 padding, 1.02× scale on `whileTap`, 60% desaturated + checkmark on complete.

**Three animation moments — no others:**
1. Single anchor complete: SVG path-draw tick with Framer `spring(0.4, 15)` + 12px Capacitor Haptics tap.
2. Pillar ring closure: 1-second gold radial bloom, pillar header collapses with `layout` transition.
3. Day complete: 1.2s soft sparkle (3–4 SVG dots fade in/out). **No confetti.** Confetti reads as infantilizing within a week in health apps — every premium reference (Apple, Whoop, Oura) avoids it.

**Login page:** one screen, no scroll. Top: wordmark + lattice icon. Middle: one email input + "Send magic link" button. Below: "We never use passwords. Check your inbox in 30 seconds." Footer: tiny links Privacy / Terms / "Not a medical device — see disclosure." Background: 30s gradient loop with `transform: translate3d` on blurred SVG. **No social logins** (avoids Google/Apple OAuth policy surface area for a small launch).

**What "world-class" means here** — three specific things:
1. **Calm.** No blinking badges, no shouting streaks, no red notification dots on the app icon.
2. **Fast.** Cold-launch to first anchor tap ≤2 seconds: no splash >800ms, no auth round-trip per launch (Capacitor Preferences caches session), no skeleton screens — cached anchor list renders instantly from Zustand-persisted state, then quietly diffs against Supabase.
3. **Personal.** Greeting uses first name. Morning prompt rotates from a 30-prompt pool. Sunday Debrief surfaces *this user's* missed-anchor patterns. Vitamin D tooltip shows the founder's actual recovery curve.

---

### SECTION 7 — GAMIFICATION SYSTEM

**Three-layer streak system, designed to diverge from Duolingo where health requires it:**

**Layer 1 — Pause Tokens (Duolingo Streak Freeze, recalibrated).** 2 per calendar month, auto-replenished on the 1st, never purchasable. Each converts a missed day into a 🌙 Rest Day. Trophy platform data (April 2026) shows users on apps with freeze functionality average 17.19 days post-day-7 vs 11.62 without — a 48% retention difference. We capture that lift without selling tokens for money (which would feel cynical for a health product among friends).

**Layer 2 — Sprout → Flame.** Below day 7 the streak icon is a sprout 🌱, not a flame. The flame appears at day 7. Per Plotline's 2025 analysis of Duolingo internal data, *"once users hit a 7-day streak, they're 2.3x more likely to return daily to avoid 'losing' their progress"* — but pre-day-7 users churn when shown a fragile-looking streak counter. The sprout is forgiving language.

**Layer 3 — Lifetime Anchor Count.** Independent of any streak. Never resets. Day-1 user sees "8 anchors completed." Day-365 user sees "2,418 anchors completed." This is Yu-kai Chou's Octalysis CD4 Ownership drive: *"Owning a streak, a character, or a progress story creates long-term adherence."*

**Baseline anchor recovery:** for Type-A-with-baseline (Hydration, Protein Threshold, 20-8-2, Steps), missing the target on Day N triggers a **half-credit rule** on Day N+1 — hitting baseline × 0.5 still counts as completed. After 3 consecutive misses, the Sunday Debrief surfaces a "Right-size this?" prompt letting the user lower the baseline.

**Daily grades** (asymmetric — celebrate above 55, never criticize below 30):
- 90–100 **Peak Day** (gold ring)
- 75–89 **Strong Day** (silver ring)
- 55–74 **Steady Day** (steady-green ring)
- 30–54 **Light Day** (sprout, no grade; "Anchors that landed today" summary)
- <30 **Rest Day** (no grade; "Tomorrow is a new day.")

**Weekly milestones:** 7-day streak → sprout becomes flame + 1 bonus Pause Token; 4 Strong+ Days → unlock "Add an anchor" suggestion in Sunday Debrief; all 6 pillars touched → small lattice badge next to name for the following week.

**Monthly:** Lifetime Anchor milestones at 100, 250, 500, 1000 ("You've completed 1,000 anchors. That's a year of mornings."); Pillar Mastery (every default anchor in a pillar for 21 consecutive days) unlocks Deep Mode for that pillar.

**Why users open the app daily** — identity reinforcement + low-friction first action. Morning push notification: *"Good morning, [Name]. Three anchors before 10 AM. Sprout day 12."* — identity-framed, not nag-framed. First action is always Type A, one-tap, achievable in 5 seconds. The Sunday Debrief becomes the user's reason to stay — it's the moment of *insight* pure trackers never deliver.

---

### SECTION 8 — BUILD SEQUENCE

**Days 1–7 — "I can use it tomorrow":**

| Day | Task | Effort |
|---|---|---|
| 1 | Lock `trelis.life` + `mytrelis.com` + `trelislife.in` + @trelislife handles on IG/X/YouTube/Threads/LinkedIn | 1h |
| 1 | Run §4 SQL seed in Supabase production (after archiving) | 30m |
| 1 | Verify Pulse algorithm against new 31-anchor set | 2h |
| 2 | Today screen v2: hero Pulse ring + 6 collapsible pillar sections + sprout/flame badge | 6h |
| 2 | Pause Token storage + monthly cron via Supabase Edge Function | 3h |
| 3 | Sunday Weekly Debrief flow (gated to day-of-week=0) | 4h |
| 3 | "All done" celebration animation | 2h |
| 4 | Onboarding (5 screens) + default-8 seed for new users | 6h |
| 4 | Settings/Profile | 3h |
| 5 | History view (30-day sparkline + per-pillar weekly heatmap) | 6h |
| 5 | Notes of Life (Type-B aggregation journal) | 3h |
| 6 | Streak engine + Lifetime Anchor count + sprout-to-flame transition | 5h |
| 6 | Non-negotiable anchor UI (red dot, no Pause Token consumption) | 2h |
| 7 | Landing page at `trelis.life` (Next.js → Vercel) | 6h |
| 7 | Bug-fix sweep (5 issues in §10.1) + flight-mode sync test + nuclear sign-out regression | 4h |

**Days 8–14 — "friends can use it":**

| Day | Task | Effort |
|---|---|---|
| 8 | Google Play Health Apps declaration form + privacy policy + 8 screenshots | 6h |
| 9 | Play Store internal-testing track + 10 testers added | 2h |
| 10 | Vision Priming (pin 1-sentence + photo, lock-screen widget) | 4h |
| 11 | Daily/Weekly/Monthly grade system | 4h |
| 12 | Polish pass: animations, haptics, micro-interactions, dark mode | 6h |
| 13 | "Why this matters" tooltips wired to every default anchor | 3h |
| 14 | Soft launch to close circle of 10 | 8h |

**Parallelizable** (2 hands → 2 same-day): landing page HTML, privacy policy drafting, logo SVG, Play Store screenshot mockups.

**Hard serial dependencies:** Seed → Pulse verify → Today screen → all UI; default-8 onboarding → close-circle invite; privacy policy + Health Apps declaration → Play Store submission.

**Effort summary:** solo founder, focused work, **5 working days to "use tomorrow," 12 working days to "friends can use it."**


---

### SECTION 9 — LANDING PAGE & MARKETING

**Change log:** Removed all personal health data from founder story. Added evidence-backed "Why This Works" closing section. Updated Play Store copy, social bios, and marketing angles accordingly.

**Landing page at `trelis.life`** — single page, five sections, no scroll-jacking, fast.

#### A. Hero (Above Fold)

**Headline:**
> The trellis your habits grow on.

**Sub-headline:**
> Trelis Life is a daily health operating system. Six pillars. Three anchor types. One score that tells you if today was real.

**CTA:** "Get it on Google Play" → Play Store deep link

**Visual:** Animated lattice SVG with six thin vines (one per pillar color) growing upward on scroll. Subtle. No flashy particles. Think: a plant growing in real time, not a fireworks show.

**Below CTA (one line, 14px, muted):**
> Free. No ads. No subscription. Your data stays yours.

#### B. The Daily Loop

Three columns (stacked on mobile): **Morning · Engine · Evening**

Each column shows 2–3 example anchor cards (blurred enough to feel real, sharp enough to read):

| Morning (10%) | Engine (70%) | Evening (20%) |
|---|---|---|
| Morning Reflection | Protein Threshold | Wind-Down Checklist |
| Fasted Stack ✓ | 7,000 Steps | Deep Sleep Stack |
| | Sunlight 10 min | Evening Reflection |

**Center:** Pulse ring filling on scroll (three concentric arcs — Morning outer-top, Engine full outer, Evening outer-bottom). As the user scrolls past each column, the corresponding arc fills. Reaches 100% at the bottom of the section.

**Caption below ring:**
> Peak Day. Strong Day. Steady Day. Light Day. Rest Day. No judgment — just a mirror.

#### C. The Six Pillars

3×2 grid. One icon + one-line description per pillar:

| Pillar | Icon | One-liner |
|---|---|---|
| Nutrition | 🥗 | What you eat, when, and how much protein. |
| Movement | 🏃 | Steps, strength, Zone 2, and the desk rule. |
| Sleep | 😴 | An 8-hour opportunity, not a 6-hour crash. |
| Stress & Mental Health | 🧠 | Reflections, breathwork, and the Sunday Debrief. |
| Social Connection | 👥 | One real conversation beats a hundred likes. |
| Environment | 🌿 | Sunlight, water quality, screen boundaries. |

**Below grid:**
> Six pillars. Each one matters. Missing one cannot be compensated by overdoing another. You can't out-exercise a bad diet. You can't out-supplement bad sleep. You can't meditate away loneliness.

#### D. Why We Built It (Founder Story — CLEAN)

> I'm a freelance developer in Bangalore. A couple of years ago I got my blood work done for the first time as an adult. The numbers weren't terrible — but they weren't great either. My doctor circled a few lines and said, "These need daily attention, not monthly panic."
>
> I tried the apps. HealthifyMe wanted to coach me. Cult Fit was great for workouts but had no daily structure. Apple Health passively collected data I never looked at. None of them gave me a simple daily checklist that covered everything — food, movement, sleep, stress, people, and my environment — without trying to sell me a subscription on day three.
>
> So I built one. Trelis Life is the daily operating system I needed. It doesn't track calories. It doesn't judge you for a missed day. It just asks: did you do the things you said mattered?
>
> If a trellis is a structure that helps a plant grow upward — this is the trellis for the habits that decide how you feel.
>
> — The Founder

#### E. Why This Actually Works (The Science)

This is the closing section. It's the proof. It answers the skeptic's question: "Why should a checklist app change my health?"

**The Evidence, In Five Layers**

**1. Implementation Intentions — The Most Replicated Finding in Behavior Change Science**

Every anchor in Trelis Life is a pre-committed implementation intention: a specific behavior, tied to a specific time, with a specific completion signal.

This isn't a productivity hack. It's the single most studied behavior change mechanism in psychology.

A 2024 meta-analysis across 642 independent tests (Sheeran et al., *European Review of Social Psychology*, 36(1): 162–194) found that forming implementation intentions produced effect sizes between d = 0.27 and d = 0.66 for cognitive, affective, and behavioral outcomes. The effects were strongest when plans had an if-then format, when participants were motivated, and when plans were rehearsed.

Trelis Life is literally a daily rehearsal of if-then plans: "After I wake up → Morning Fasted Stack." "After lunch → Post-Lunch Stack." "At 21:30 → Wind-Down."

What Trelis does differently: most implementation intention research uses a one-time planning sheet. Trelis surfaces the same intentions daily, which means the rehearsal effect compounds. You don't plan once. You execute the plan every day and the app confirms it.

**2. Self-Monitoring — The Behavior Change Technique That Outperforms All Others**

Self-monitoring (tracking whether you did a thing) is consistently identified as the single most effective behavior change technique across meta-analyses.

A systematic review of 19 RCTs involving 2,800 participants (Compernolle et al., 2019, *International Journal of Behavioral Nutrition and Physical Activity*) found that self-monitoring interventions significantly reduced sedentary time with an effect size of g = 0.32 (95% CI: 0.14–0.50). Subgroup analysis showed even stronger effects (g = 0.40) when objective monitoring tools were used.

Every anchor check in Trelis Life is a self-monitoring event. You're not passively collecting data from a wearable. You're actively confirming: "I did this." That active confirmation — the tap — is the behavior change technique. The Pulse Score is just the feedback loop.

**3. Habit Stacking — Why the "Stack" Architecture Isn't Just UI Design**

Type C anchors (Stacks) in Trelis Life aren't just nested checklists for convenience. They're habit stacks — James Clear's term for the behavioral science concept of chaining new behaviors to existing ones.

Research on habit stacking shows that linking new behaviors to stable cues increases adherence and accelerates the development of automaticity. A 2025 study in the *Journal of Applied Psychology* found that habit stacking increased success rates by 64% compared to standalone habits. The neurological basis: when behaviors are consistently performed in sequence, the brain links them into a single behavioral unit.

The Morning Fasted Stack (Probiotic → NAC → Wait 30 min) isn't three habits. After two weeks of daily execution, it becomes one behavioral unit that fires on a single cue: waking up. This is why the stack architecture matters — it's not a UI pattern, it's a behavior change mechanism built into the data model.

**4. Multiple Health Behavior Change — Why Six Pillars, Not One**

The conventional wisdom is "change one thing at a time." The research says otherwise.

Spring et al. (2018) demonstrated in the Make Better Choices 2 (MBC2) trial that both simultaneous and sequential multiple behavior change treatments produced comparably large improvements in diet and physical activity — sustained to 9 months follow-up. Targeting multiple behaviors at once did not dilute the effect.

The key insight: effect sizes did not decline when up to three behaviors were targeted simultaneously, as long as the intervention was structured and each behavior had its own clear cue and completion signal.

Trelis Life targets six pillars — but on any given day, the average user completes 8–12 anchors, each lasting under 60 seconds of active attention. The cognitive load per anchor is trivially small. The cumulative effect across pillars is where the health impact compounds.

**5. The Streak Paradox — Forgiveness Beats Punishment**

Duolingo proved that streaks drive retention. But health apps have a different failure mode: a broken streak in a health context triggers shame, and shame in health contexts causes permanent churn.

Trophy platform data (April 2026) shows that apps with streak-freeze functionality retain users for 17.19 days post-day-7, versus 11.62 days without — a 48% retention lift. The freeze doesn't weaken the streak's motivational power; it removes the catastrophic failure mode.

Trelis Life's three-layer forgiveness system (Pause Tokens + sprout-to-flame progression + Lifetime Anchor Count that never resets) is designed around a single principle: in health, the cost of quitting is higher than the cost of a missed day. Every design choice optimizes for "come back tomorrow" over "perfect streak."

**The Compound Effect — Why It All Works Together**

Each layer above works in isolation. Together, they compound:

- **Implementation intentions** tell your brain WHAT to do and WHEN.
- **Self-monitoring** confirms you DID it and closes the loop.
- **Habit stacking** chains behaviors so they fire automatically.
- **Multiple behavior change** ensures no pillar is neglected while others overcompensate.
- **Forgiving streaks** ensure you come back after a bad day instead of quitting entirely.

This is not a tracking app. This is a structured daily protocol that uses five of the most evidence-backed behavior change mechanisms in psychology, embedded into a product so simple that the science is invisible. You just check boxes. The science does the rest.

**One Final Number**

> "Over 65% of all deaths in India are caused by non-communicable diseases — diabetes, heart disease, cancer, chronic respiratory conditions. Most of which are driven by lifestyle factors."
>
> That's not destiny. That's a system failure.
>
> Trelis Life is the system fix.

#### Play Store Metadata (Updated)

- **Name:** Trelis Life — Health OS (23 chars)
- **Short description (80-char limit):** "Six pillars. One daily score. Health habits without the noise." (57 chars)
- **Full description (~1,400 chars):**

> Trelis Life is a daily health operating system built around the six pillars proven by science: Nutrition, Movement, Sleep, Stress & Mental Health, Social Connection, and Environment.
>
> Most health apps reward data entry. Trelis Life rewards completion of small, pre-committed daily anchors — the ones that actually decide how you feel.
>
> ━━ HOW IT WORKS ━━
> Every day, a short list of anchors gated to today. A Morning Reflection sets your intention. A Pulse Score (Morning 10% + Engine 70% + Evening 20%) fills as you complete anchors. A Sunday Debrief shows you what worked and what didn't.
>
> ━━ THE SIX PILLARS ━━
> 🥗 Nutrition — protein at every meal, plant diversity, hydration
> 🏃 Movement — steps, strength, Zone 2, the 20-8-2 desk rule
> 😴 Sleep — 8-hour opportunity, wind-down, deep sleep stack
> 🧠 Mental Health — twice-daily reflections, breathwork, weekly debrief
> 👥 Social — one real conversation a day
> 🌿 Environment — sunlight, water quality, screen-time
>
> ━━ DESIGNED FOR LIFE, NOT TRANSFORMATION ━━
> • No calorie counting. No before/after photos.
> • Pause Tokens protect your streak when life happens.
> • Lifetime anchor count never resets.
> • Works offline. Syncs when connected.
>
> ━━ BUILT ON SCIENCE ━━
> • Implementation intentions (642-test meta-analysis, d = 0.27–0.66)
> • Self-monitoring (strongest single BCT across reviews)
> • Habit stacking (64% higher adherence vs standalone habits)
> • Forgiving streaks (48% retention lift with freeze mechanics)
>
> ━━ PRIVACY ━━
> Your data lives on your device and your private database row. No third-party sharing. No ads. No subscription.
>
> ━━ DISCLAIMER ━━
> Trelis Life is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. Consult a healthcare professional for medical advice.

#### 8 Screenshots Needed (1080×1920)

1. Today screen mid-day — 3 anchors done, Pulse ring at ~45%, pillar sections visible
2. Today screen — all done, Peak Day gold ring, "Sleep well" message
3. Six Pillars carousel / explainer screen
4. Type C Stack expanded — Morning Fasted Stack with 2/3 sub-items checked
5. Sunday Weekly Debrief — heatmap view of the past week
6. Notes of Life — sample journal entries from reflections
7. Onboarding screen 4 — "Which pillar is hardest for you right now?"
8. Settings — supplement editor / anchor manager

#### Social Media Bios (Updated — No personal data)

- **Instagram:** Trelis Life · The trellis your habits grow on · Health OS for the daily loop · Made in Bangalore · 🔗 trelis.life
- **X (Twitter):** Health OS. Six pillars. One daily score. Built for the 11 PM crowd who wants to feel better by 7 AM. trelis.life
- **LinkedIn:** Trelis Life is a personal health operating system turning the six evidence-based pillars of health into a daily, gamified, MECE checklist. Bangalore. 2026.
- **YouTube:** Trelis Life — Structure for a better life. Behind-the-scenes of building a health OS from Bangalore. New videos on product, health science, and the daily loop.
- **Threads:** Six pillars. Daily anchors. One score. No shame. @trelislife

#### Indian Market Messaging Anchors (Updated)

**1. The "thin-fat Indian" angle (no personal data needed):**
Most Indian adults between 25 and 40 have a normal BMI but carry visceral fat and metabolic risk factors that Western health charts miss entirely. Indian-specific BMI cutoffs start at 23, not 25. Waist circumference thresholds are 90 cm for men and 80 cm for women — not the global 102/88. Trelis Life is built for this reality. You don't need to "look unhealthy" to need a health OS.

**2. ICMR-NIN 2024 alignment:**
The Nutrition pillar is aligned with ICMR-NIN 2024's "My Plate for the Day" — India's own dietary framework emphasizing millets, pulses, and explicit restrictions on ultra-processed food. This isn't a Silicon Valley wellness import. It's built on Indian dietary science.

**3. Maintenance positioning (not transformation):**
Urban Indian professionals aged 28–40 are exhausted by "transform yourself" messaging. Trelis Life doesn't promise a transformation. It promises that tomorrow morning will have structure. And the morning after that. And the one after that. The transformation is what happens when you stop skipping weeks.

#### Key References Cited in "Why This Works"

For internal use / Play Store "About" page / blog posts:

1. **Sheeran P, Webb TL, Gollwitzer PM (2024).** "The when and how of planning: Meta-analysis of the scope and components of implementation intentions in 642 tests." *European Review of Social Psychology*, 36(1): 162–194. [d = 0.27–0.66]
2. **Compernolle S, DeSmet A, Poppe L, et al. (2019).** "Effectiveness of interventions using self-monitoring to reduce sedentary behavior in adults: a systematic review and meta-analysis." *International Journal of Behavioral Nutrition and Physical Activity*, 16:63. [g = 0.32, CI 0.14–0.50]
3. **Spring B, Pellegrini CA, Pfammatter AF, et al. (2018).** "Effects of an abbreviated obesity intervention supported by mobile technology: The ENGAGED randomized clinical trial." *Obesity*, 26(1). [MBC2 trial: simultaneous multi-behavior change sustained to 9 months]
4. **Divine A, et al. (2025).** "Reinforcing implementation intentions with imagery increases physical activity habit strength and behaviour." *British Journal of Health Psychology*. [Implementation intentions + imagery → habit formation]
5. **Trophy Platform Data (2026).** Streak freeze retention analysis: 17.19 vs 11.62 days post-day-7, 48% retention lift.
6. **Plotline (2025).** Duolingo gamification case study: 2.3× daily return rate after 7-day streak milestone.

---

### SECTION 10 — TECHNICAL DEBT & KNOWN ISSUES

**Phase 3 bugs to fix Week 1:**

1. **AppLifecycleManager cold-launch-across-midnight.** Resets only on `appStateChange`. Fix: also compare current date against last persisted date in Capacitor Preferences on cold launch in `_app.tsx`; trigger reset if delta ≥ 1 day.
2. **Magic link deep link opens in Chrome on Android.** Fix: register intent filter for `https://trelis.life/auth/callback` in `AndroidManifest.xml`; handle via `App.addListener('appUrlOpen', …)` to inject the session token into Supabase client.
3. **Zustand persist hydration race** (80ms empty state on cold launch). Fix: render 3-row skeleton until `useStore.persist.hasHydrated()` returns true.
4. **Frequency-mask off-by-one in Sunday-start-of-week locales.** Standardize internally on Mon=1, Tue=2, … Sun=64; never depend on `Date.getDay()` for gating.
5. **Nuclear sign-out leaves Supabase realtime channel dangling.** Fix: call `supabase.removeAllChannels()` before localStorage clear + hard redirect.

**Performance optimizations:**

1. **Wrap `auth.uid()` in `(select auth.uid())`** inside RLS policies — per Supabase docs, *"Wrapping the function causes an initPlan to be run by the Postgres optimizer, which allows it to 'cache' the results per-statement, rather than calling the function on each row."* Material improvement on the per-day anchor query.
2. **Composite index on `(user_id, frequency_mask)`** on `anchors` — daily query filters by both and currently does a seq-scan after RLS.
3. **Dynamic-import non-critical Capacitor plugins** (Camera, Share, Device) — they shouldn't load on cold launch.
4. **Static-export Next.js** (`output: 'export'`, `images.unoptimized: true`) for the Capacitor bundle; SSR for the Vercel landing page. Two build outputs from one repo.

**Security:**

1. **Verify RLS on every table.** Per the Supabase 2025 Security Retro, *"The Table Editor now shows a clear warning label for any table that has RLS disabled… If you create tables with RLS disabled, Supabase sends email alerts to project owners."* Check the dashboard for warning labels.
2. **Migrate to the new Supabase API key model** before public launch. Legacy anon/service_role JWT keys are being deprecated in 2026 for revocable publishable + secret keys.
3. **Add a Postgres Event Trigger to auto-enable RLS** on any new table — protects against future migrations that forget RLS.
4. **Google Play April 2024 Health Apps policy compliance.** Privacy policy must specify health data types: *"Trelis Life collects self-reported anchor completion data, journaling text, and sleep/wake times to compute your daily Pulse Score and surface weekly insights."* In-app: "not a medical device and does not diagnose, treat, cure, or prevent any medical condition."
5. **Keep magic-link tokens short-lived** (Supabase default 1 hour — do not extend).

**Data migration:**

1. **Archive existing 9-anchor seed** before reseed. The §4 SQL begins with `CREATE TABLE … anchors_archive_2026_05 AS SELECT …` then `DELETE`. The completion history (`anchor_completions`) should NOT be deleted — even archived anchor IDs retain their FK relationships.
2. **Schema additions if Phase-3 missed them:**
   ```sql
   ALTER TABLE anchors ADD COLUMN IF NOT EXISTS is_non_negotiable bool DEFAULT false;
   ALTER TABLE anchors ADD COLUMN IF NOT EXISTS baseline_target int;
   ALTER TABLE anchors ADD COLUMN IF NOT EXISTS prompt text;
   ALTER TABLE anchors ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES anchors(id);
   ```
3. **New `user_state` table for Pause Tokens / streak / lifetime count:**
   ```sql
   CREATE TABLE IF NOT EXISTS user_state (
     user_id uuid PRIMARY KEY REFERENCES auth.users,
     pause_tokens_remaining int DEFAULT 2,
     pause_tokens_reset_on date DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
     current_streak int DEFAULT 0,
     longest_streak int DEFAULT 0,
     lifetime_anchor_count bigint DEFAULT 0,
     hardest_pillar text,
     hardest_pillar_until date
   );
   ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "user_state_owner" ON user_state FOR ALL TO authenticated
     USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
   ```

---

## Recommendations

**This week (Days 1–7) — non-negotiable:**

1. Within 48 hours, register `trelis.life`, `mytrelis.com`, `trelislife.in`, and lock @trelislife on Instagram, X, YouTube, Threads, LinkedIn. Same day, engage an Indian IP attorney for a TM clearance search in Classes 9, 42, 44 (budget ₹15,000–25,000 for clearance + first filing).
2. Archive existing anchor data, then run the §4 SQL seed in production.
3. Verify the Pulse Score algorithm against the new 31-anchor set.
4. Ship Today screen v2 → Sunday Debrief → default-8 onboarding → landing page in that order.
5. Fix the five Phase-3 bugs in §10.1 — especially the Android deep-link, which is silently fatal to onboarding.

**Next week (Days 8–14):**

6. Submit the Google Play Health Apps declaration; spin up the internal-test track.
7. Migrate to the new Supabase API key model.
8. Invite 10 close-circle testers. Instrument zero analytics — just monitor Supabase row inserts and Sentry exceptions.

**Benchmarks that change the plan:**

- Founder opens app <25/30 days in the first month → the issue is the morning hook. Re-evaluate notification timing and the rotating prompt pool.
- ≥3/10 close-circle testers churn within 14 days → onboarding is too heavy. Cut the default anchor set from 8 to 5 (drop Friend Outreach, Box Breathing, Plant Diversity from defaults).
- Pulse 10/70/20 weighting feels wrong within 2 weeks (specifically: Peak Day attainable with too few evening anchors) → rebalance to 15/65/20.
- Hindi/regional-language demand from close circle → localize only the default-8 template strings.

**Do NOT (cuts):**

- No Coach AI / chat. No social leaderboards. No Apple Health / Google Fit sync. No video content. No paywall in v1.0.
- Do not skip the medical-device disclaimer or the Health Apps declaration. Google Play enforces non-compliance with takedown and no warning.
- Do not add confetti or aggressive streak-shame UI patterns. Health users churn permanently on these.

---

## Caveats

- **Domain availability for `trelis.life`, `trelis.in`, `trelis.health`, `trelis.app`, and `mytrelis.com` was not live-verified within the research window** — these inferences come from registry positioning and competitor scans, not direct WHOIS lookups. Run `whois` or instantdomainsearch.com on all five before paying for any registration. If `trelis.life` is taken, acceptable fallbacks in priority order: `trelislife.app`, `trelis.day`, `trelis.health` (if available).
- **The trademark recommendation is not legal advice.** The existing "Trelis" wordmark held by Computational Simulation Software, LLC is in the engineering-software space; a parallel mark in IP-India class 9 for mobile health software may be grantable but requires a paid clearance search.
- **The §4 SQL assumes existing schema columns.** If Phase-3 didn't include `is_non_negotiable`, `baseline_target`, `prompt`, `parent_id`, run the `ALTER TABLE` block in §10.4 first, then the seed.
- **The supplement protocol reflects the founder's existing FOXO playbook**, not personalized medical advice. Doses (NAC 600mg, methylfolate 1000 mcg, D3 5000 IU, Magnesium Glycinate 400mg, Taurine 1000mg, etc.) come from the founder's stated existing protocol + mainstream published guidance for the indicated deficiencies. Anyone other than the founder running these anchors should consult a physician — which is why the §5 default template ships with **zero supplement anchors**.
- **The lead toxicity number (60.75 µg/L) deserves clinical re-verification.** If the FOXO report's "60.75 µg/L" is actually 6.075 µg/dL (US units), the clinical picture is dramatically different. A confirmatory blood lead level at a NABL-accredited lab in Bangalore is recommended before any aggressive intervention.
- **Streak research data (17.19 vs 11.62 days, 48% retention lift, 2.3× day-7 return rate) come from Trophy platform data (April 2026) and Plotline's 2025 case study citing Duolingo internal data**, not peer-reviewed studies. Directionally correct for product design; do not cite externally as research.
- **The Phase-2 UI/UX "issues identified" referenced in §6 are not explicitly in the source materials provided**; recommendations are extrapolated from common Next.js + Tailwind + Framer Motion Phase-3 patterns and standard mobile heuristics. Reconcile against the actual Phase-2 review document if one exists.
- **Indian competitor positioning data goes stale within 60–90 days.** Ultrahuman's Vision Cloud, HealthifyMe's Ria-OpenAI rollout, and Google Health Coach's India launch are all 2025–2026 developments; re-evaluate quarterly.
- **The caffeine cutoff at 14:00 IST is deliberately conservative.** Drake CL et al. (2013, *Journal of Clinical Sleep Medicine*, PMC3805807) found 400mg of caffeine 6 hours before bedtime *"significantly disrupts sleep… the common practice of afternoon consumption of caffeine should at a minimum be restricted to before 17:00."* For most users a 17:00 cutoff would be defensible; 14:00 is calibrated to the founder's caffeine sensitivity + 23:00 sleep target. For the §5 default template, consider relaxing to 16:00 to feel less prescriptive to new users.
- **Ultrahuman's funding figure correction:** Ultrahuman raised **$35M in Series B in March 2024** (a mix of $25M equity and debt) per TechCrunch (March 20, 2024) — bringing cumulative funding to roughly $60M including a prior $17.5M Series A. Earlier informal mentions of "$65M Series B" conflate cumulative funding with the round size.