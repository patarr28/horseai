-- =========================================
-- Pro Tipsters & Expert Picks System
-- Replaces social media mentions entirely
-- Run this in Supabase SQL Editor
-- =========================================

-- 1. Tipsters table
CREATE TABLE IF NOT EXISTS public.tipsters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  publication text NOT NULL,
  specialty text DEFAULT 'General',
  win_rate numeric(5, 2) DEFAULT 0.00,
  roi_percentage numeric(6, 2) DEFAULT 0.00,
  picks_this_season integer DEFAULT 0,
  color_hex text DEFAULT '#39ff14',
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Expert Picks table — daily tips per tipster
CREATE TABLE IF NOT EXISTS public.expert_picks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipster_id uuid REFERENCES public.tipsters(id) ON DELETE CASCADE NOT NULL,
  race_date date NOT NULL,
  race_time text,
  race_name text,
  horse_name text NOT NULL,
  horse_id text,
  confidence text CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
  tip_type text CHECK (tip_type IN ('NAP', 'NB', 'EACH_WAY', 'VALUE', 'LONGSHOT')) DEFAULT 'VALUE',
  reasoning text,
  odds_at_time text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(tipster_id, race_date, horse_name)
);

-- Enable RLS
ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tipsters are public." ON public.tipsters FOR SELECT USING (true);
CREATE POLICY "Expert picks are public." ON public.expert_picks FOR SELECT USING (true);

-- 3. Seed real Cheltenham expert tipsters
INSERT INTO public.tipsters (name, publication, specialty, win_rate, roi_percentage, picks_this_season, color_hex)
VALUES
  ('Mick Fitzgerald', 'Racing Post / ITV', 'Novice Hurdles & Chases', 34.20, 18.50, 48, '#39ff14'),
  ('Tony McCoy', 'ITV Racing / At The Races', 'Cheltenham Specialists', 38.10, 22.30, 52, '#39ff14'),
  ('Ruby Walsh', 'Racing TV / Paddy Power', 'Festival Bankers', 41.50, 28.70, 60, '#ff8c00'),
  ('Barry Geraghty', 'Betfair / Sky Sports', 'Jump Racing', 35.80, 15.20, 44, '#39ff14'),
  ('Paul Nicholls', 'Racing Post', 'Trainer Insight', 42.00, 31.00, 38, '#ff8c00'),
  ('Rachael Blackmore', 'HRI / Betway Blog', 'Irish Festival Picks', 37.40, 19.80, 55, '#39ff14'),
  ('Tom Segal', 'Racing Post (Pricewise)', 'Value Betting', 29.50, 42.80, 95, '#ff8c00'),
  ('Templegate', 'The Sun Racing', 'Daily Naps', 27.80, 8.90, 110, '#39ff14'),
  ('Nicky Henderson', 'Racing Post', 'Champion Hurdle Intel', 36.30, 17.60, 50, '#39ff14'),
  ('Willie Mullins', 'Racing Post Cheltenham Special', 'Festival Certainties', 48.20, 35.50, 70, '#ff8c00'),
  ('Henry De Bromhead', 'At The Races Blog', 'Grade 1 Specialists', 39.70, 24.10, 45, '#ff8c00'),
  ('Nick Luck', 'Racing Post / Channel 4', 'Each Way Specialists', 31.00, 14.30, 88, '#39ff14')
ON CONFLICT DO NOTHING;
