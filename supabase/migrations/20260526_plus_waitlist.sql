-- Create public.plus_waitlist table
CREATE TABLE IF NOT EXISTS public.plus_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    desired_features TEXT,
    willingness_to_pay TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plus_waitlist ENABLE ROW LEVEL SECURITY;

-- Insert policy
CREATE POLICY "Users can insert their own waitlist response" 
ON public.plus_waitlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Select policy
CREATE POLICY "Users can view their own waitlist response" 
ON public.plus_waitlist 
FOR SELECT 
USING (auth.uid() = user_id);
