ALTER TABLE public.surprises ADD COLUMN proposal_config jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE OR REPLACE FUNCTION public.save_proposal_config(_id uuid, _config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF;
 IF jsonb_typeof(_config) <> 'object' OR octet_length(_config::text)>20000 THEN RAISE EXCEPTION 'Invalid configuration'; END IF;
 IF coalesce(_config->>'audioPath','') <> '' AND (_config->>'audioPath' NOT LIKE auth.uid()::text || '/%' OR _config->>'audioPath' LIKE '%..%') THEN RAISE EXCEPTION 'Invalid audio'; END IF;
 IF _config ? 'quiz' THEN
  IF jsonb_typeof(_config->'quiz') <> 'array' OR jsonb_array_length(_config->'quiz') NOT BETWEEN 1 AND 10 THEN RAISE EXCEPTION 'Invalid quiz'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_config->'quiz') q WHERE jsonb_typeof(q->'options') <> 'array' OR jsonb_array_length(q->'options') NOT BETWEEN 2 AND 4 OR length(q->>'question') NOT BETWEEN 1 AND 300 OR (q->>'answer')::int < 0 OR (q->>'answer')::int >= jsonb_array_length(q->'options')) THEN RAISE EXCEPTION 'Invalid question'; END IF;
 END IF;
 UPDATE public.surprises SET proposal_config=_config WHERE id=_id AND user_id=auth.uid() AND status IN ('paid','delivered');
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved access required'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.save_proposal_config(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_proposal_config(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.get_proposal_config(_code text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT s.proposal_config FROM public.surprises s JOIN public.profiles p ON p.id=s.user_id WHERE s.code=_code AND s.status IN ('paid','delivered') AND NOT p.banned AND p.deleted_at IS NULL
$$;
REVOKE ALL ON FUNCTION public.get_proposal_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_config(text) TO anon, authenticated;
CREATE POLICY "Owners upload proposal audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='proposal-audio' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL));
CREATE POLICY "Owners read proposal audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='proposal-audio' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY "Owners remove proposal audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='proposal-audio' AND (storage.foldername(name))[1]=auth.uid()::text);