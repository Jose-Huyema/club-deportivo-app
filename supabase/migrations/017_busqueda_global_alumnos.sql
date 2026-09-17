-- V0.5.11 - Búsqueda global de alumnos.
-- Usa los índices de nombre/DNI creados en 015 y devuelve lo mínimo necesario para la navegación al legajo.

CREATE OR REPLACE FUNCTION public.buscar_alumnos_global(p_term TEXT, p_limit INTEGER DEFAULT 8)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  dni TEXT,
  is_active BOOLEAN,
  categorias TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_term TEXT := btrim(COALESCE(p_term, ''));
  v_dni TEXT := regexp_replace(v_term, '\D', '', 'g');
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 8), 1), 12);
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.autorizado = TRUE
      AND p.role IN ('admin', 'operador', 'profe')
      AND 'alumnos' = ANY(p.allowed_views)
  ) THEN
    RAISE EXCEPTION 'NO_AUTORIZADO';
  END IF;

  IF length(v_term) < 2 THEN
    RETURN;
  END IF;

  IF length(v_dni) >= 3 THEN
    RETURN QUERY
    SELECT s.id,
           s.full_name,
           s.dni,
           s.is_active,
           COALESCE(
             ARRAY_AGG(c.name ORDER BY c.name) FILTER (WHERE c.name IS NOT NULL),
             ARRAY[]::TEXT[]
           )
    FROM public.students s
    LEFT JOIN public.enrollments e ON e.student_id = s.id
    LEFT JOIN public.categories c ON c.id = e.category_id
    WHERE regexp_replace(COALESCE(s.dni, ''), '\D', '', 'g') LIKE v_dni || '%'
    GROUP BY s.id, s.full_name, s.dni, s.is_active
    ORDER BY s.is_active DESC, s.full_name
    LIMIT v_limit;
  ELSE
    RETURN QUERY
    SELECT s.id,
           s.full_name,
           s.dni,
           s.is_active,
           COALESCE(
             ARRAY_AGG(c.name ORDER BY c.name) FILTER (WHERE c.name IS NOT NULL),
             ARRAY[]::TEXT[]
           )
    FROM public.students s
    LEFT JOIN public.enrollments e ON e.student_id = s.id
    LEFT JOIN public.categories c ON c.id = e.category_id
    WHERE s.full_name ILIKE '%' || v_term || '%'
    GROUP BY s.id, s.full_name, s.dni, s.is_active
    ORDER BY s.is_active DESC, s.full_name
    LIMIT v_limit;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_alumnos_global(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_alumnos_global(TEXT, INTEGER) TO authenticated;
