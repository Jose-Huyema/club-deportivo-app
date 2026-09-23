-- V0.9.0 - Cuotas, planes y cobranzas

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly','one_time','other')),
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  ended_at DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_active_membership
  ON public.student_memberships(student_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_student_memberships_student ON public.student_memberships(student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_memberships_plan ON public.student_memberships(plan_id, status);

CREATE TABLE IF NOT EXISTS public.charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.student_memberships(id) ON DELETE SET NULL,
  period_month DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','waived','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (membership_id, period_month)
);

CREATE INDEX IF NOT EXISTS idx_charges_student_status ON public.charges(student_id, status, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_charges_period ON public.charges(period_month, status);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charge_id UUID REFERENCES public.charges(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method TEXT NOT NULL CHECK (method IN ('cash','transfer','card','mercadopago','other')),
  reference TEXT,
  notes TEXT,
  registered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student_date ON public.payments(student_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_charge ON public.payments(charge_id, payment_date DESC);

CREATE OR REPLACE FUNCTION public.cuotas_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_membership_plans_updated_at ON public.membership_plans;
CREATE TRIGGER trg_membership_plans_updated_at BEFORE UPDATE ON public.membership_plans
FOR EACH ROW EXECUTE FUNCTION public.cuotas_updated_at();

DROP TRIGGER IF EXISTS trg_student_memberships_updated_at ON public.student_memberships;
CREATE TRIGGER trg_student_memberships_updated_at BEFORE UPDATE ON public.student_memberships
FOR EACH ROW EXECUTE FUNCTION public.cuotas_updated_at();

DROP TRIGGER IF EXISTS trg_charges_updated_at ON public.charges;
CREATE TRIGGER trg_charges_updated_at BEFORE UPDATE ON public.charges
FOR EACH ROW EXECUTE FUNCTION public.cuotas_updated_at();

CREATE OR REPLACE FUNCTION public.puede_gestionar_cuotas()
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
      AND p.role IN ('admin','operador')
      AND (
        p.role = 'admin'
        OR 'cuotas' = ANY(COALESCE(p.allowed_views, ARRAY[]::TEXT[]))
      )
  );
$$;

REVOKE ALL ON FUNCTION public.puede_gestionar_cuotas() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.puede_gestionar_cuotas() TO authenticated;

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "membership_plans_finance" ON public.membership_plans;
CREATE POLICY "membership_plans_finance" ON public.membership_plans
FOR ALL USING (public.puede_gestionar_cuotas()) WITH CHECK (public.puede_gestionar_cuotas());

DROP POLICY IF EXISTS "student_memberships_finance" ON public.student_memberships;
CREATE POLICY "student_memberships_finance" ON public.student_memberships
FOR ALL USING (public.puede_gestionar_cuotas()) WITH CHECK (public.puede_gestionar_cuotas());

DROP POLICY IF EXISTS "charges_finance" ON public.charges;
CREATE POLICY "charges_finance" ON public.charges
FOR ALL USING (public.puede_gestionar_cuotas()) WITH CHECK (public.puede_gestionar_cuotas());

DROP POLICY IF EXISTS "payments_finance" ON public.payments;
CREATE POLICY "payments_finance" ON public.payments
FOR ALL USING (public.puede_gestionar_cuotas()) WITH CHECK (public.puede_gestionar_cuotas());

CREATE OR REPLACE FUNCTION public.asignar_plan_alumno(
  p_student_id UUID,
  p_plan_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_membership_id UUID;
BEGIN
  IF NOT public.puede_gestionar_cuotas() THEN
    RAISE EXCEPTION 'SIN_PERMISO_CUOTAS';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RAISE EXCEPTION 'ALUMNO_NO_EXISTE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE id = p_plan_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'PLAN_NO_DISPONIBLE';
  END IF;

  UPDATE public.student_memberships
  SET status = 'cancelled', ended_at = CURRENT_DATE, updated_at = NOW()
  WHERE student_id = p_student_id AND status = 'active';

  INSERT INTO public.student_memberships(student_id, plan_id, started_at, status, notes)
  VALUES (p_student_id, p_plan_id, CURRENT_DATE, 'active', NULLIF(TRIM(p_notes), ''))
  RETURNING id INTO v_membership_id;

  RETURN v_membership_id;
END;
$$;

REVOKE ALL ON FUNCTION public.asignar_plan_alumno(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.asignar_plan_alumno(UUID, UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.registrar_pago_cuota(
  p_charge_id UUID,
  p_amount NUMERIC,
  p_method TEXT,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_charge public.charges%ROWTYPE;
  v_payment_id UUID;
  v_new_paid NUMERIC(12,2);
BEGIN
  IF NOT public.puede_gestionar_cuotas() THEN
    RAISE EXCEPTION 'SIN_PERMISO_CUOTAS';
  END IF;

  SELECT * INTO v_charge
  FROM public.charges
  WHERE id = p_charge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CUOTA_NO_EXISTE';
  END IF;

  IF v_charge.status = 'cancelled' OR v_charge.status = 'waived' THEN
    RAISE EXCEPTION 'CUOTA_NO_COBRABLE';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'MONTO_INVALIDO';
  END IF;

  IF p_amount > (v_charge.amount - v_charge.paid_amount) THEN
    RAISE EXCEPTION 'MONTO_SUPERA_SALDO';
  END IF;

  INSERT INTO public.payments(charge_id, student_id, amount, method, reference, notes, registered_by)
  VALUES (p_charge_id, v_charge.student_id, p_amount, p_method, NULLIF(TRIM(p_reference), ''), NULLIF(TRIM(p_notes), ''), auth.uid())
  RETURNING id INTO v_payment_id;

  v_new_paid := v_charge.paid_amount + p_amount;

  UPDATE public.charges
  SET paid_amount = v_new_paid,
      status = CASE WHEN v_new_paid >= amount THEN 'paid' ELSE 'pending' END,
      updated_at = NOW()
  WHERE id = p_charge_id;

  RETURN v_payment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_pago_cuota(UUID, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_pago_cuota(UUID, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;

-- Plan inicial del club: no genera deuda ni requiere cobro.
INSERT INTO public.membership_plans(code, name, description, amount, currency, billing_period, is_free, is_active)
VALUES ('FREE', 'Gratis / Comunitario', 'Plan sin cuota, pensado para la situación actual del club.', 0, 'ARS', 'monthly', TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Admin y operador pueden ver el módulo de cuotas; profes y porteros no.
UPDATE public.profiles
SET allowed_views = ARRAY(
  SELECT DISTINCT v
  FROM unnest(COALESCE(allowed_views, ARRAY[]::TEXT[]) || ARRAY['cuotas']::TEXT[]) AS v
)
WHERE role IN ('admin','operador') AND autorizado = TRUE;
