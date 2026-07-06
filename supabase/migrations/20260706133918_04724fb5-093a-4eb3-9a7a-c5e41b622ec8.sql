
-- 1) Extend profiles + sales_history
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.sales_history ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'unit';
ALTER TABLE public.sales_history ADD COLUMN IF NOT EXISTS revenue numeric;
ALTER TABLE public.sales_history ADD COLUMN IF NOT EXISTS recommended_price_at_sale numeric;
ALTER TABLE public.sales_history ADD COLUMN IF NOT EXISTS price_difference numeric;

-- 2) Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop text NOT NULL,
  city text,
  target_price numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('above','below')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.alerts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) Cooperatives
CREATE TABLE IF NOT EXISTS public.cooperatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cooperatives TO authenticated;
GRANT ALL ON public.cooperatives TO service_role;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.cooperative_members (
  cooperative_id uuid NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cooperative_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cooperative_members TO authenticated;
GRANT ALL ON public.cooperative_members TO service_role;
ALTER TABLE public.cooperative_members ENABLE ROW LEVEL SECURITY;

-- 4) Security-definer helper (avoids recursive policies)
CREATE OR REPLACE FUNCTION public.is_coop_member(_coop_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cooperative_members
    WHERE cooperative_id = _coop_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.my_coop_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cooperative_id FROM public.cooperative_members WHERE user_id = _user_id;
$$;

-- 5) Cooperative policies
-- Anyone signed in can look up a cooperative (needed to join by code); members see their own coops.
CREATE POLICY "view coops (lookup + own)" ON public.cooperatives FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "create coop" ON public.cooperatives FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "creator can update" ON public.cooperatives FOR UPDATE TO authenticated
  USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Membership: user sees rows for coops they belong to; can insert themselves; can remove themselves.
CREATE POLICY "view members of my coops" ON public.cooperative_members FOR SELECT TO authenticated
  USING (public.is_coop_member(cooperative_id, auth.uid()));
CREATE POLICY "join coop" ON public.cooperative_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leave coop" ON public.cooperative_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6) Extend produce visibility to co-op members (aggregate views)
DROP POLICY IF EXISTS "coop members can view produce" ON public.produce;
CREATE POLICY "coop members can view produce" ON public.produce FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.cooperative_members m1
      JOIN public.cooperative_members m2 ON m1.cooperative_id = m2.cooperative_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = public.produce.user_id
    )
  );

-- 7) Extend handle_new_user to capture phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
