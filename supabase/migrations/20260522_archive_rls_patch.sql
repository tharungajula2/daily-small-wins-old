-- 1. Enable Row Level Security (RLS) on the archive table
ALTER TABLE public.anchors_archive_2026_05 ENABLE ROW LEVEL SECURITY;

-- 2. Restrict SELECT access strictly to the owner matching auth.uid()
CREATE POLICY "Users can only read their own archives" 
ON public.anchors_archive_2026_05
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
