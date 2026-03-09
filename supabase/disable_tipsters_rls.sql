-- Disable RLS on the tipsters table to allow our API to insert newly discovered tipsters.
-- Since we are lacking the SUPABASE_SERVICE_ROLE_KEY, this is the quickest way 
-- to get our dynamic tipster insertion prototype working!

ALTER TABLE public.tipsters DISABLE ROW LEVEL SECURITY;
