CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discipline_id UUID REFERENCES public.disciplines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_quantity INT NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  min_warning_quantity INT DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inventory_items_discipline_id ON public.inventory_items(discipline_id);

CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  type movement_type NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inv_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX idx_inv_movements_user_id ON public.inventory_movements(user_id);
CREATE INDEX idx_inv_movements_created_at ON public.inventory_movements(created_at DESC);
