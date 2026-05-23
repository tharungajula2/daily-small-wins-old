-- Migration: 20260524_quiet_partner.sql
-- Create quiet_partners and partner_nudges tables with strict RLS

-- 1. quiet_partners table
CREATE TABLE IF NOT EXISTS public.quiet_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_partner UNIQUE (user_id, partner_email)
);

-- 2. partner_nudges table
CREATE TABLE IF NOT EXISTS public.partner_nudges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nudge_type TEXT NOT NULL CHECK (nudge_type IN ('thinking', 'proud', 'walk')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on both tables
ALTER TABLE public.quiet_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_nudges ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for quiet_partners
-- Allow select if auth.uid() is either the user_id or if the user's email is partner_email
CREATE POLICY "Users can view their own partner relations" ON public.quiet_partners
    FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = partner_email);

CREATE POLICY "Users can insert their own partner relations" ON public.quiet_partners
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner relations" ON public.quiet_partners
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = partner_email)
    WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = partner_email);

CREATE POLICY "Users can delete their own partner relations" ON public.quiet_partners
    FOR DELETE
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = partner_email);

-- 5. RLS Policies for partner_nudges
-- Allow select if user is sender or receiver
CREATE POLICY "Users can view nudges sent or received by them" ON public.partner_nudges
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow insert if user is the sender
CREATE POLICY "Users can insert nudges they send" ON public.partner_nudges
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Allow update if user is the receiver (e.g. to mark as read)
CREATE POLICY "Users can update nudges they receive" ON public.partner_nudges
    FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete nudges they send or receive" ON public.partner_nudges
    FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
