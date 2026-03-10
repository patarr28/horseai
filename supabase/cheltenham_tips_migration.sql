-- ============================================================
-- Cheltenham Tips: AI-extracted live tipster picks
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Main table: denormalized, AI-insertable
CREATE TABLE IF NOT EXISTS cheltenham_tips (
  id          UUID  DEFAULT uuid_generate_v4() PRIMARY KEY,
  race_date   DATE  NOT NULL,
  race_time   TEXT,                        -- e.g. "13:30"
  race_name   TEXT,                        -- e.g. "Supreme Novices' Hurdle"
  horse_name  TEXT  NOT NULL,
  tipster_name TEXT NOT NULL,              -- e.g. "Ruby Walsh", "Racing Post"
  tip_type    TEXT  DEFAULT 'Win',         -- "Win" | "Each Way" | "NAP"
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Unique constraint: one row per tipster/horse/date
ALTER TABLE cheltenham_tips
  DROP CONSTRAINT IF EXISTS cheltenham_tips_unique;

ALTER TABLE cheltenham_tips
  ADD CONSTRAINT cheltenham_tips_unique
  UNIQUE (race_date, horse_name, tipster_name);

-- 3. Disable RLS so the anon key can insert (matches existing expert_picks setup)
ALTER TABLE cheltenham_tips DISABLE ROW LEVEL SECURITY;

-- 4. Consensus view: count votes per horse per day
CREATE OR REPLACE VIEW consensus_picks AS
SELECT
  race_date,
  race_time,
  race_name,
  horse_name,
  COUNT(tipster_name)::int                          AS consensus_votes,
  array_agg(DISTINCT tipster_name ORDER BY tipster_name) AS tipsters,
  array_agg(DISTINCT tip_type)                      AS tip_types,
  -- NAP flag: true if ANY tipster called it their NAP
  bool_or(tip_type = 'NAP')                         AS has_nap
FROM cheltenham_tips
GROUP BY race_date, race_time, race_name, horse_name
ORDER BY consensus_votes DESC;
