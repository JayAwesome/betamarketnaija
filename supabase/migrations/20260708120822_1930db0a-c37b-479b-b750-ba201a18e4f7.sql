
DROP POLICY IF EXISTS "view coops (lookup + own)" ON public.cooperatives;

CREATE POLICY "members view own coops"
ON public.cooperatives
FOR SELECT
TO authenticated
USING (public.is_coop_member(id, auth.uid()) OR created_by = auth.uid());

CREATE OR REPLACE FUNCTION public.join_cooperative_by_code(_code text)
RETURNS TABLE (id uuid, name text, join_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _coop_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT c.id INTO _coop_id
  FROM public.cooperatives c
  WHERE c.join_code = upper(trim(_code))
  LIMIT 1;

  IF _coop_id IS NULL THEN
    RAISE EXCEPTION 'Invalid join code';
  END IF;

  INSERT INTO public.cooperative_members (cooperative_id, user_id)
  VALUES (_coop_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN QUERY
  SELECT c.id, c.name, c.join_code
  FROM public.cooperatives c
  WHERE c.id = _coop_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_cooperative_by_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.join_cooperative_by_code(text) TO authenticated;
