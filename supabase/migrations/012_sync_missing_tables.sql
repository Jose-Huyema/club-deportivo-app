-- Estas 3 tablas existen y funcionan en producción (confirmado con un export
-- del esquema real), pero nunca tuvieron una migración en el repo — se
-- crearon a mano en algún momento. Esta migración las deja versionadas,
-- reproduciendo exactamente el esquema y las políticas RLS que ya tienen
-- en producción, para que el repo vuelva a ser la fuente de verdad.
--
-- Es seguro correrla sobre la base actual: usa CREATE TABLE IF NOT EXISTS,
-- CREATE POLICY con DROP POLICY IF EXISTS antes, y el seed de app_settings
-- usa ON CONFLICT DO NOTHING para no pisar el nombre del club ya cargado.

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT4 PRIMARY KEY,
  club_name TEXT NOT NULL,
  club_subtitle TEXT NOT NULL
);

INSERT INTO public.app_settings (id, club_name, club_subtitle)
VALUES (1, 'Club Deportivo', 'Asistencia e inventario')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method TEXT NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_checkins_student_id ON public.checkins(student_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON public.checkins(checked_in_at DESC);

CREATE TABLE IF NOT EXISTS public.invited_emails (
  email TEXT PRIMARY KEY,
  role public.user_role NOT NULL,
  genero TEXT,
  allowed_views TEXT[] NOT NULL DEFAULT '{}',
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invited_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_read" ON public.app_settings;
CREATE POLICY "app_settings_read" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_settings_write" ON public.app_settings;
CREATE POLICY "app_settings_write" ON public.app_settings FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "checkins_read" ON public.checkins;
CREATE POLICY "checkins_read" ON public.checkins FOR SELECT USING (auth.role() = 'authenticated');

-- OJO: esta policy depende de public.is_editor(), que existe en producción
-- pero todavía no está versionada (ver 013_missing_functions.sql).
DROP POLICY IF EXISTS "checkins_write" ON public.checkins;
CREATE POLICY "checkins_write" ON public.checkins FOR INSERT
  WITH CHECK (
    public.is_editor() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'portero')
  );

DROP POLICY IF EXISTS "invited_emails_admin_only" ON public.invited_emails;
CREATE POLICY "invited_emails_admin_only" ON public.invited_emails FOR ALL USING (public.is_admin());
