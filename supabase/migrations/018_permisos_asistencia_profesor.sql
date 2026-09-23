-- V0.8.0 - Permisos efectivos para asistencia y seguridad por categoría.

-- El esquema histórico empezó con solo admin/profe, pero el sistema actual
-- utiliza también operador/portero. IF NOT EXISTS permite ejecutar la migración
-- tanto sobre bases nuevas como sobre las que ya tienen esos valores.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'operador';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'portero';

CREATE OR REPLACE FUNCTION public.puede_gestionar_asistencia(p_category_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.autorizado = TRUE
      AND (
        p.role = 'admin'
        OR (
          p.role = 'operador'
          AND 'asistencia' = ANY(COALESCE(p.allowed_views, ARRAY[]::TEXT[]))
        )
        OR (
          p.role = 'profe'
          AND 'asistencia' = ANY(COALESCE(p.allowed_views, ARRAY[]::TEXT[]))
          AND EXISTS (
            SELECT 1
            FROM public.professor_categories pc
            WHERE pc.professor_id = p.id
              AND pc.category_id = p_category_id
          )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.puede_gestionar_asistencia(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.puede_gestionar_asistencia(UUID) TO authenticated;

-- Profesores autorizados deben conservar la vista de asistencia para poder
-- entrar al módulo y operar únicamente sus categorías asignadas.
UPDATE public.profiles
SET allowed_views = ARRAY(
  SELECT DISTINCT v
  FROM unnest(COALESCE(allowed_views, ARRAY[]::TEXT[]) || ARRAY['asistencia']::TEXT[]) AS v
)
WHERE role = 'profe' AND autorizado = TRUE;


DROP POLICY IF EXISTS "attendances_profe_scope" ON public.attendances;
CREATE POLICY "attendances_read_scope" ON public.attendances FOR SELECT
  USING (public.puede_gestionar_asistencia(category_id));

CREATE POLICY "attendances_insert_scope" ON public.attendances FOR INSERT
  WITH CHECK (
    public.puede_gestionar_asistencia(category_id)
    AND (professor_id = auth.uid() OR public.is_admin() OR public.is_editor())
  );

CREATE POLICY "attendances_update_scope" ON public.attendances FOR UPDATE
  USING (public.puede_gestionar_asistencia(category_id))
  WITH CHECK (public.puede_gestionar_asistencia(category_id));

DROP POLICY IF EXISTS "attendance_details_scope" ON public.attendance_details;
CREATE POLICY "attendance_details_read_scope" ON public.attendance_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.attendances a
      WHERE a.id = attendance_details.attendance_id
        AND public.puede_gestionar_asistencia(a.category_id)
    )
  );

CREATE POLICY "attendance_details_write_scope" ON public.attendance_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.attendances a
      WHERE a.id = attendance_details.attendance_id
        AND public.puede_gestionar_asistencia(a.category_id)
    )
  );

CREATE POLICY "attendance_details_update_scope" ON public.attendance_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.attendances a
      WHERE a.id = attendance_details.attendance_id
        AND public.puede_gestionar_asistencia(a.category_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.attendances a
      WHERE a.id = attendance_details.attendance_id
        AND public.puede_gestionar_asistencia(a.category_id)
    )
  );

DROP POLICY IF EXISTS "attendance_details_delete_scope" ON public.attendance_details;
CREATE POLICY "attendance_details_delete_scope" ON public.attendance_details FOR DELETE
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.proteger_asistencia_finalizada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.finalized = TRUE AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'ASISTENCIA_FINALIZADA';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_asistencia_finalizada ON public.attendances;
CREATE TRIGGER trg_proteger_asistencia_finalizada
BEFORE UPDATE ON public.attendances
FOR EACH ROW
EXECUTE FUNCTION public.proteger_asistencia_finalizada();
