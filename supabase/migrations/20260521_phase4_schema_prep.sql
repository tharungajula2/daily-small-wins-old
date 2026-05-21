-- supabase/migrations/20260521_phase4_schema_prep.sql

-- 1. Add Phase 4 metrics columns to the existing user_anchors table
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS is_non_negotiable bool DEFAULT false;
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS baseline_target int;

-- 2. Create the user_state table for Pause Tokens & Streaks tracking
CREATE TABLE IF NOT EXISTS public.user_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  pause_tokens_remaining int DEFAULT 2 CHECK (pause_tokens_remaining >= 0 AND pause_tokens_remaining <= 3),
  pause_tokens_reset_on date DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
  current_streak int DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak int DEFAULT 0 CHECK (longest_streak >= 0),
  lifetime_anchor_count bigint DEFAULT 0 CHECK (lifetime_anchor_count >= 0),
  hardest_pillar text,
  hardest_pillar_until date
);

-- 3. Enable RLS on the new table
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

-- 4. Create Owner Policy for user_state table
CREATE POLICY "user_state_owner" ON public.user_state
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
