
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings public read" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "settings admin update" ON public.platform_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "settings admin delete" ON public.platform_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.platform_settings(key, value) VALUES
  ('platform_name', 'PitchForge'),
  ('support_email', 'support@pitchforge.app'),
  ('currency', 'IDR'),
  ('platform_fee_percent', '5'),
  ('registration_open', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

CREATE POLICY "payments admin read" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "payments admin update" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "competitions admin update" ON public.competitions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "competitions admin delete" ON public.competitions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "roles admin insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "roles admin delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "registrations admin update" ON public.competition_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
