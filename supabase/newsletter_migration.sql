-- Migration to create subscriptions table for lead generation
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (public insert)
-- We use a policy that allows insert but not select for public to protect emails
CREATE POLICY "Enable public insertions for anonymous subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins should be able to see the list (for future dashboard)
CREATE POLICY "Enable read for authenticated admins"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (true);
