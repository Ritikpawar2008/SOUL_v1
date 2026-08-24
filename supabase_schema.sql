-- ==============================================================================
-- SOUL v1.0 — SUPABASE DATABASE SCHEMA & TABLES
-- Copy and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create single unified state table for fast full-state synchronization
CREATE TABLE IF NOT EXISTS public.soul_state (
    id TEXT PRIMARY KEY DEFAULT 'default',
    preferences JSONB DEFAULT '{}'::jsonb,
    timetable JSONB DEFAULT '[]'::jsonb,
    subjects JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    habits JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    focus_sessions JSONB DEFAULT '[]'::jsonb,
    post_gym_routine JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Individual granular tables (for direct querying or analytics if desired)

-- Preferences Table
CREATE TABLE IF NOT EXISTS public.soul_preferences (
    id TEXT PRIMARY KEY DEFAULT 'current',
    name TEXT,
    college_name TEXT,
    semester TEXT,
    gym_start_time TEXT,
    gym_end_time TEXT,
    pomodoro_work_minutes INT DEFAULT 25,
    pomodoro_break_minutes INT DEFAULT 5,
    default_revision_intervals INT[] DEFAULT ARRAY[1, 7, 21],
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS public.soul_subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    faculty TEXT,
    color TEXT,
    units JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Academic Tasks Table (Manuals & Assignments)
CREATE TABLE IF NOT EXISTS public.soul_tasks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'manual' | 'assignment' | 'study_session' | 'project'
    subject_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    priority TEXT DEFAULT 'high', -- 'critical' | 'high' | 'medium' | 'low'
    status TEXT DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
    progress INT DEFAULT 0,
    estimated_minutes INT DEFAULT 45,
    actual_minutes_spent INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Timetable Slots Table
CREATE TABLE IF NOT EXISTS public.soul_timetable (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    title TEXT NOT NULL,
    subject_code TEXT,
    type TEXT NOT NULL,
    room TEXT,
    instructor TEXT,
    batch_info JSONB,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habits & Goals Table
CREATE TABLE IF NOT EXISTS public.soul_habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    target_frequency TEXT,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    target_days_per_week INT DEFAULT 7,
    completed_dates TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_completed_date DATE,
    description TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activity History Table
CREATE TABLE IF NOT EXISTS public.soul_history (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    subject_code TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    duration_minutes INT DEFAULT 0,
    status TEXT DEFAULT 'completed',
    progress_made INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Post Gym Routine Table
CREATE TABLE IF NOT EXISTS public.soul_post_gym_routine (
    id TEXT PRIMARY KEY,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    type TEXT NOT NULL,
    subject_code TEXT,
    task_id TEXT,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.soul_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_post_gym_routine ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies (allowing read/write with anon key)
DROP POLICY IF EXISTS "Public access to soul_state" ON public.soul_state;
CREATE POLICY "Public access to soul_state" ON public.soul_state FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_preferences" ON public.soul_preferences;
CREATE POLICY "Public access to soul_preferences" ON public.soul_preferences FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_subjects" ON public.soul_subjects;
CREATE POLICY "Public access to soul_subjects" ON public.soul_subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_tasks" ON public.soul_tasks;
CREATE POLICY "Public access to soul_tasks" ON public.soul_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_timetable" ON public.soul_timetable;
CREATE POLICY "Public access to soul_timetable" ON public.soul_timetable FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_habits" ON public.soul_habits;
CREATE POLICY "Public access to soul_habits" ON public.soul_habits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_history" ON public.soul_history;
CREATE POLICY "Public access to soul_history" ON public.soul_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to soul_post_gym_routine" ON public.soul_post_gym_routine;
CREATE POLICY "Public access to soul_post_gym_routine" ON public.soul_post_gym_routine FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert initial row into soul_state if not exists
INSERT INTO public.soul_state (id, preferences, timetable, subjects, tasks, habits, history, post_gym_routine)
VALUES ('default', '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 'SOUL Database Setup Completed Successfully!' AS status;
