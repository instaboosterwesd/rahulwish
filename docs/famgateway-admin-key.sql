-- Run once in the SQL editor: lets admins change the FamGateway API key from the admin panel
CREATE OR REPLACE FUNCTION public.admin_set_fam_key(_key text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF _key IS NULL OR length(trim(_key)) < 10 OR length(_key) > 200 THEN RAISE EXCEPTION 'Invalid API key'; END IF;
  INSERT INTO public.settings(key,value) VALUES('famgateway_api_key',trim(_key))
  ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();
END $$;
CREATE OR REPLACE FUNCTION public.admin_fam_key_hint() RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v text;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT value INTO v FROM public.settings WHERE key='famgateway_api_key';
  RETURN CASE WHEN v IS NULL OR v='' THEN NULL ELSE left(v,4)||'••••'||right(v,4) END;
END $$;
-- only the app server (which holds the original server key) can read the active key
CREATE OR REPLACE FUNCTION public.get_fam_key(_server text) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.fam_key_ok(_server) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  RETURN (SELECT nullif(value,'') FROM public.settings WHERE key='famgateway_api_key');
END $$;
REVOKE ALL ON FUNCTION public.admin_set_fam_key(text), public.admin_fam_key_hint(), public.get_fam_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_fam_key(text), public.admin_fam_key_hint(), public.get_fam_key(text) TO authenticated;
