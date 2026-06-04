-- Add new columns to public.user_anchors
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS codename text;
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS keep_definition text;
ALTER TABLE public.user_anchors ADD COLUMN IF NOT EXISTS is_permanent boolean DEFAULT false;

-- Create public.anchor_keeps table
CREATE TABLE IF NOT EXISTS public.anchor_keeps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id uuid REFERENCES public.user_anchors(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, anchor_id, log_date)
);

-- Enable RLS for public.anchor_keeps
ALTER TABLE public.anchor_keeps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own anchor keeps" ON public.anchor_keeps
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create public.anchor_gathers table
CREATE TABLE IF NOT EXISTS public.anchor_gathers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id uuid REFERENCES public.user_anchors(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE,
    label text,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for public.anchor_gathers
ALTER TABLE public.anchor_gathers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own anchor gathers" ON public.anchor_gathers
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update existing user_anchors set is_permanent = true where title is 'The Arc' or matches 'Arc'
UPDATE public.user_anchors SET is_permanent = true WHERE title ILIKE '%Arc%';
