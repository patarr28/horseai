-- Re-enable RLS on our tipster tables now that the backend uses the Secure Service Role Key
-- This ensures no unauthorized clients can write to these tables from the frontend.

ALTER TABLE public.expert_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;
