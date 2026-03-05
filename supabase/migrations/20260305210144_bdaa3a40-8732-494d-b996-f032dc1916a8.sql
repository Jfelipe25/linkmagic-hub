
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;

-- More restrictive insert: only allow when no user_id (anonymous creation from edge function)
-- Edge functions use service role which bypasses RLS anyway
CREATE POLICY "Anon can insert profiles without user_id"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id IS NULL);
