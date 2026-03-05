
-- Create profiles table for LinkBio Pro
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  avatar TEXT,
  template TEXT DEFAULT 'minimal' CHECK (template IN ('minimal', 'dark', 'gradient')),
  accent_color TEXT DEFAULT '#d4a432',
  social_links JSONB DEFAULT '{}'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  paid BOOLEAN DEFAULT false,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles (paid=true) are viewable by anyone
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (paid = true);

-- Users can view their own profile regardless of paid status
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow inserts from service role (edge functions) - anon can also insert for initial creation
CREATE POLICY "Anyone can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Allow service role to update any profile (for webhook payment confirmation)
CREATE POLICY "Service role can update any profile"
  ON public.profiles FOR UPDATE
  USING (true);

-- Create index on slug for fast lookups
CREATE INDEX idx_profiles_slug ON public.profiles (slug);

-- Create index on session_id for payment webhook
CREATE INDEX idx_profiles_session_id ON public.profiles (session_id);
