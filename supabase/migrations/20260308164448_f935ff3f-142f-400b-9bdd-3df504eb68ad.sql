
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter';

CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET views = views + 1 WHERE slug = profile_slug;
$$;
