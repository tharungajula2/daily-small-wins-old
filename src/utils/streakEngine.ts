import { SupabaseClient } from '@supabase/supabase-js';

export interface StreakEvaluationResult {
  yesterdayScore: number;
  oldStreak: number;
  newStreak: number;
  oldTokens: number;
  newTokens: number;
  actionTaken: 'increment' | 'paused' | 'reset';
  message: string;
}

/**
 * Evaluates yesterday's completion state and updates streaks/tokens accordingly.
 * Designed to run securely on App rollover or daily boundary crossings.
 */
export async function evaluateYesterdayStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakEvaluationResult> {
  // 1. Calculate yesterday's date string in YYYY-MM-DD local format
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toLocaleDateString('en-CA');

  // 2. Fetch yesterday's ritual log to extract pulse_score
  const { data: ritualData } = await supabase
    .from('daily_rituals')
    .select('pulse_score')
    .eq('user_id', userId)
    .eq('date', yesterdayStr)
    .maybeSingle();

  const yesterdayScore = ritualData?.pulse_score ?? 0;

  // 3. Fetch current user_state
  const { data: userState, error: fetchErr } = await supabase
    .from('user_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(`Failed to retrieve user state: ${fetchErr.message}`);
  }

  // Set safe defaults if state doesn't exist yet
  const oldStreak = userState?.current_streak ?? 0;
  const oldLongest = userState?.longest_streak ?? 0;
  const oldTokens = userState?.pause_tokens_remaining ?? 2;

  let newStreak = oldStreak;
  let newLongest = oldLongest;
  let newTokens = oldTokens;
  let actionTaken: 'increment' | 'paused' | 'reset' = 'reset';
  let message = '';

  // 4. Streak & Pause Token logic tree
  if (yesterdayScore >= 30) {
    // Light Day or better: increment streak
    newStreak = oldStreak + 1;
    if (newStreak > oldLongest) {
      newLongest = newStreak;
    }
    actionTaken = 'increment';
    message = `Yesterday score was ${yesterdayScore} (>=30). Streak incremented to ${newStreak}.`;
  } else {
    // Rest Day / Missed Day: Check pause tokens
    if (oldTokens > 0) {
      newTokens = oldTokens - 1;
      actionTaken = 'paused';
      message = 'Pause Token Used';
    } else {
      newStreak = 0;
      actionTaken = 'reset';
      message = `Yesterday score was ${yesterdayScore} (<30) and no pause tokens left. Streak reset to 0.`;
    }
  }

  // 5. Commit evaluation to Supabase
  const { error: upsertErr } = await supabase
    .from('user_state')
    .upsert({
      user_id: userId,
      current_streak: newStreak,
      longest_streak: newLongest,
      pause_tokens_remaining: newTokens
    });

  if (upsertErr) {
    throw new Error(`Failed to commit streak evaluation: ${upsertErr.message}`);
  }

  return {
    yesterdayScore,
    oldStreak,
    newStreak,
    oldTokens,
    newTokens,
    actionTaken,
    message
  };
}
