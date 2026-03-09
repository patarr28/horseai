-- Allow anonymous and authenticated users to insert, update, and delete expert picks
-- This is necessary because the sync-tipsters API route uses the public ANON key.

CREATE POLICY "Allow anon insert to expert_picks"
ON public.expert_picks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anon update to expert_picks"
ON public.expert_picks
FOR UPDATE
USING (true);

CREATE POLICY "Allow anon delete to expert_picks"
ON public.expert_picks
FOR DELETE
USING (true);
