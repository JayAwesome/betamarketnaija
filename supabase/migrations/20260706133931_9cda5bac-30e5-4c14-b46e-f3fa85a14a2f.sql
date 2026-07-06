
REVOKE ALL ON FUNCTION public.is_coop_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.my_coop_ids(uuid) FROM PUBLIC, anon, authenticated;
