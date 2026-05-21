-- Trigger to increment lifetime_anchor_count in public.user_state when an anchor_log is completed
CREATE OR REPLACE FUNCTION public.handle_anchor_completion_increment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (TG_OP = 'INSERT' OR OLD.completed = false) THEN
    INSERT INTO public.user_state (
      user_id,
      pause_tokens_remaining,
      current_streak,
      longest_streak,
      lifetime_anchor_count
    )
    VALUES (
      NEW.user_id,
      2,
      0,
      0,
      1
    )
    ON CONFLICT (user_id) DO UPDATE
    SET lifetime_anchor_count = public.user_state.lifetime_anchor_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to make it idempotent
DROP TRIGGER IF EXISTS on_anchor_log_completed ON public.anchor_logs;

CREATE TRIGGER on_anchor_log_completed
  AFTER INSERT OR UPDATE ON public.anchor_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_anchor_completion_increment();
