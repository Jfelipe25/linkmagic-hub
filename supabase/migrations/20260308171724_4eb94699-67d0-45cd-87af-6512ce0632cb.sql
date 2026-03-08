
-- Link clicks tracking table
CREATE TABLE public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id text NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (public profiles)
CREATE POLICY "Anyone can insert link clicks"
ON public.link_clicks FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Profile owners can read their click data
CREATE POLICY "Users can read own link clicks"
ON public.link_clicks FOR SELECT
TO authenticated
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Admins can read all
CREATE POLICY "Admins can read all link clicks"
ON public.link_clicks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to track a click
CREATE OR REPLACE FUNCTION public.track_link_click(p_profile_slug text, p_link_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.link_clicks (profile_id, link_id)
  SELECT id, p_link_id FROM public.profiles WHERE slug = p_profile_slug AND paid = true
  LIMIT 1;
$$;
