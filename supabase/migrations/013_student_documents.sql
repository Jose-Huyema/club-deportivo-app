-- La tabla "Documentos" del alumno (seguro, foto de DNI, autorizaciones,
-- comunicados) nunca se creó en producción — el código la usa desde el
-- inicio, pero toda consulta contra ella fallaba. Esquema tomado 1:1 de lo
-- que espera el código (src/lib/data/documentos.ts y su actions.ts).
--
-- Los permisos de escritura acá son a propósito EXPLÍCITOS por rol
-- (admin/operador/profe), en vez de depender de is_editor() — esa función
-- existe en producción pero su definición todavía no está versionada en
-- este repo, así que no sabemos con certeza si ya incluye a "profe" o no.
-- Cuando la tengamos documentada, esto se puede simplificar para usarla.

CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('seguro', 'foto_dni', 'autorizacion', 'comunicado', 'otro')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON public.student_documents(student_id);

ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_documents_read" ON public.student_documents;
CREATE POLICY "student_documents_read" ON public.student_documents FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "student_documents_write" ON public.student_documents;
CREATE POLICY "student_documents_write" ON public.student_documents FOR ALL
  USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('operador', 'profe'))
  )
  WITH CHECK (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('operador', 'profe'))
  );

-- El bucket de Storage "documentos-alumnos" debe existir y aceptar el mismo
-- criterio de acceso vía service role (la app sube/baja siempre con
-- createAdminClient(), que ya bypassea RLS de Storage). Si el bucket no
-- existe todavía, creá uno privado con ese nombre exacto desde
-- Storage → New bucket en el dashboard de Supabase.
