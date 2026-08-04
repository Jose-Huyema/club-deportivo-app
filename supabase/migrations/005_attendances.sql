CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, date)
);
CREATE INDEX idx_attendances_category_id ON public.attendances(category_id);
CREATE INDEX idx_attendances_professor_id ON public.attendances(professor_id);
CREATE INDEX idx_attendances_date ON public.attendances(date);

CREATE TABLE public.attendance_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES public.attendances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  status attendance_status NOT NULL DEFAULT 'presente',
  UNIQUE(attendance_id, student_id)
);
CREATE INDEX idx_att_details_attendance_id ON public.attendance_details(attendance_id);
CREATE INDEX idx_att_details_student_id ON public.attendance_details(student_id);
