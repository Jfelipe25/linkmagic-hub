
-- Contacts table for data capture
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add enable_contact_form to profiles
ALTER TABLE public.profiles ADD COLUMN enable_contact_form boolean NOT NULL DEFAULT false;

-- RLS for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "Anyone can insert contacts" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Profile owners can read their contacts
CREATE POLICY "Owners can read contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Admins can read all contacts
CREATE POLICY "Admins can read all contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_contacts_profile_id ON public.contacts(profile_id);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);
