
-- Remove public-exposed SECURITY DEFINER function callable by authenticated users.
-- Join logic will move to a server function using the service role.
DROP FUNCTION IF EXISTS public.join_cooperative_by_code(text);

-- Revoke EXECUTE on the auth trigger function from PostgREST-exposed roles.
-- The trigger on auth.users runs as the table owner and does not need these grants.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Belt-and-suspenders: re-revoke on the RLS helper functions (used only inside policies).
REVOKE ALL ON FUNCTION public.is_coop_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.my_coop_ids(uuid) FROM PUBLIC, anon, authenticated;
