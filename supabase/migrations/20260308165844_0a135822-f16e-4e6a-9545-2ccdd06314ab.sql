
CREATE TABLE public.pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL UNIQUE,
  country_name text NOT NULL,
  currency_id text NOT NULL,
  price numeric NOT NULL,
  display_price text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing"
ON public.pricing FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage pricing"
ON public.pricing FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.pricing (country_code, country_name, currency_id, price, display_price, is_default) VALUES
('CO', 'Colombia', 'COP', 20000, '$20.000 COP', true),
('CL', 'Chile', 'CLP', 2990, '$2.990 CLP', false),
('AR', 'Argentina', 'ARS', 3500, '$3.500 ARS', false),
('MX', 'México', 'MXN', 99, '$99 MXN', false),
('US', 'Estados Unidos', 'USD', 5, '$5 USD', false);
