-- V0.5.9 - Optimización del control de ingreso.
-- Reduce viajes entre navegador, servidor y Supabase y agrega índices para búsquedas frecuentes.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_students_active_name_trgm
  ON public.students USING gin (full_name gin_trgm_ops)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_students_active_dni_normalized
  ON public.students ((regexp_replace(COALESCE(dni, ''), '\D', '', 'g')))
  WHERE is_active = TRUE;

CREATE OR REPLACE FUNCTION public.buscar_alumnos_ingreso(p_term TEXT, p_limit INTEGER DEFAULT 8)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  dni TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_term TEXT := btrim(COALESCE(p_term, ''));
  v_dni TEXT := regexp_replace(v_term, '\D', '', 'g');
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 8), 1), 20);
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.autorizado = TRUE
      AND p.role IN ('admin', 'operador', 'portero')
  ) THEN
    RAISE EXCEPTION 'NO_AUTORIZADO';
  END IF;

  IF length(v_term) < 2 THEN
    RETURN;
  END IF;

  IF length(v_dni) >= 3 THEN
    RETURN QUERY
    SELECT s.id, s.full_name, s.dni, s.is_active
    FROM public.students s
    WHERE s.is_active = TRUE
      AND regexp_replace(COALESCE(s.dni, ''), '\D', '', 'g') LIKE v_dni || '%'
    ORDER BY s.full_name
    LIMIT v_limit;
  ELSE
    RETURN QUERY
    SELECT s.id, s.full_name, s.dni, s.is_active
    FROM public.students s
    WHERE s.is_active = TRUE
      AND s.full_name ILIKE '%' || v_term || '%'
    ORDER BY s.full_name
    LIMIT v_limit;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_alumnos_ingreso(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_alumnos_ingreso(TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.registrar_ingreso_rapido(p_code TEXT, p_method TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  dni TEXT,
  categorias TEXT[],
  checked_in_at TIMESTAMPTZ,
  method TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code TEXT := btrim(COALESCE(p_code, ''));
  v_method TEXT := CASE WHEN p_method IN ('qr', 'dni', 'manual') THEN p_method ELSE 'manual' END;
  v_student_id UUID;
  v_checked_at TIMESTAMPTZ := NOW();
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.autorizado = TRUE
      AND p.role IN ('admin', 'operador', 'portero')
  ) THEN
    RAISE EXCEPTION 'NO_AUTORIZADO';
  END IF;

  IF v_code LIKE 'STUDENT:%' THEN
    BEGIN
      v_student_id := substring(v_code FROM 9)::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'CODIGO_INVALIDO';
    END;
  ELSE
    SELECT s.id
      INTO v_student_id
    FROM public.students s
    WHERE s.is_active = TRUE
      AND regexp_replace(COALESCE(s.dni, ''), '\D', '', 'g') = regexp_replace(v_code, '\D', '', 'g')
    LIMIT 1;
  END IF;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'ALUMNO_NO_ENCONTRADO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = v_student_id AND s.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'ALUMNO_INACTIVO';
  END IF;

  INSERT INTO public.checkins (student_id, recorded_by, method, checked_in_at)
  VALUES (v_student_id, auth.uid(), v_method, v_checked_at);

  RETURN QUERY
  SELECT
    s.id,
    s.full_name,
    s.dni,
    COALESCE(
      ARRAY_AGG(c.name ORDER BY c.name) FILTER (WHERE c.name IS NOT NULL),
      ARRAY[]::TEXT[]
    ),
    v_checked_at,
    v_method
  FROM public.students s
  LEFT JOIN public.enrollments e ON e.student_id = s.id
  LEFT JOIN public.categories c ON c.id = e.category_id
  WHERE s.id = v_student_id
  GROUP BY s.id, s.full_name, s.dni;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.registrar_ingreso_rapido(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_ingreso_rapido(TEXT, TEXT) TO authenticated;
