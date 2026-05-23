-- Migration: 20260525_partner_read_policy.sql
-- Allow partners to view each other's anchors and logs for social pulse sharing

-- 1. Check and drop existing policies if they conflict (usually user_id = auth.uid())
-- 2. Add SELECT policies to public.user_anchors
CREATE POLICY "Partners can view each other's anchors" ON public.user_anchors
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.quiet_partners QP
            WHERE QP.user_id = user_id AND QP.partner_email = auth.jwt() ->> 'email'
        )
    );

-- 3. Add SELECT policies to public.anchor_logs
CREATE POLICY "Partners can view each other's logs" ON public.anchor_logs
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.quiet_partners QP
            WHERE QP.user_id = user_id AND QP.partner_email = auth.jwt() ->> 'email'
        )
    );
