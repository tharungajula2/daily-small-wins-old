-- supabase/migrations/20260524_security_linter_patch.sql

-- 1. Lock down search paths for database triggers to mitigate function_search_path_mutable warnings
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_anchor_completion_increment() SET search_path = public;

-- 2. Revoke all execution rights from public, anon, and authenticated roles to prevent execution via REST API RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_anchor_completion_increment() FROM PUBLIC, anon, authenticated;
