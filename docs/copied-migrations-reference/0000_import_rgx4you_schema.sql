CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email text NOT NULL DEFAULT '', full_name text NOT NULL DEFAULT '', banned boolean NOT NULL DEFAULT false, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_owner_read ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid());
CREATE TABLE public.user_roles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_owner_read ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id WHERE r.user_id=_user_id AND r.role=_role AND NOT p.banned AND p.deleted_at IS NULL) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
CREATE TABLE public.templates(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL, category text NOT NULL, tagline text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', price_inr integer NOT NULL DEFAULT 0 CHECK(price_inr>=0), original_price_inr integer NOT NULL DEFAULT 0 CHECK(original_price_inr>=0), rating numeric NOT NULL DEFAULT 5, cover_image text NOT NULL DEFAULT '', badge text NOT NULL DEFAULT '', style text NOT NULL DEFAULT '', featured boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.templates TO anon,authenticated; GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_public_read ON public.templates FOR SELECT TO anon,authenticated USING(active);
CREATE POLICY templates_admin_read ON public.templates FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.deposits(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id), amount_inr integer NOT NULL CHECK(amount_inr>0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.deposits TO authenticated; GRANT ALL ON public.deposits TO service_role;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY deposits_owner_read ON public.deposits FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.surprises(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id), template_id uuid NOT NULL REFERENCES public.templates(id), code text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text,'-',''), recipient_name text NOT NULL DEFAULT '', sender_name text NOT NULL DEFAULT '', headline text NOT NULL DEFAULT '', message text NOT NULL DEFAULT '', photos text[] NOT NULL DEFAULT '{}', proposal_config jsonb NOT NULL DEFAULT '{}', views integer NOT NULL DEFAULT 0, amount_inr integer NOT NULL CHECK(amount_inr>=0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','delivered')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.surprises TO authenticated; GRANT ALL ON public.surprises TO service_role;
ALTER TABLE public.surprises ENABLE ROW LEVEL SECURITY;
CREATE POLICY surprises_owner_read ON public.surprises FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.settings(key text PRIMARY KEY,value text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.settings TO anon,authenticated; GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_public_read ON public.settings FOR SELECT TO anon,authenticated USING(key IN ('announcement','maintenance_mode'));
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER roles_updated BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER templates_updated BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER deposits_updated BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER surprises_updated BEFORE UPDATE ON public.surprises FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX deposits_user_idx ON public.deposits(user_id); CREATE INDEX surprises_user_idx ON public.surprises(user_id);
CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,email,full_name) VALUES(NEW.id,coalesce(NEW.email,''),coalesce(NEW.raw_user_meta_data->>'full_name','')) ON CONFLICT(id) DO NOTHING; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE FUNCTION public.request_deposit(_amount integer,_note text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE result uuid; BEGIN IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF; IF _amount IS NULL OR _amount<=0 OR _note IS NULL OR length(_note)>500 THEN RAISE EXCEPTION 'Invalid deposit'; END IF; INSERT INTO public.deposits(user_id,amount_inr,note) VALUES(auth.uid(),_amount,_note) RETURNING id INTO result; RETURN result; END $$;
CREATE FUNCTION public.purchase_template(_template uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE price integer; balance bigint; result uuid; BEGIN PERFORM id FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Account unavailable'; END IF; SELECT price_inr INTO price FROM public.templates WHERE id=_template AND active FOR SHARE; IF NOT FOUND THEN RAISE EXCEPTION 'Template unavailable'; END IF; SELECT coalesce((SELECT sum(amount_inr) FROM public.deposits WHERE user_id=auth.uid() AND status='approved'),0)-coalesce((SELECT sum(amount_inr) FROM public.surprises WHERE user_id=auth.uid() AND status IN ('paid','delivered')),0) INTO balance; IF balance<price THEN RAISE EXCEPTION 'Insufficient approved credit'; END IF; INSERT INTO public.surprises(user_id,template_id,amount_inr,status) VALUES(auth.uid(),_template,price,'paid') RETURNING id INTO result; RETURN result; END $$;
CREATE FUNCTION public.save_surprise(_id uuid,_recipient text,_sender text,_headline text,_message text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF; IF _recipient IS NULL OR length(_recipient) NOT BETWEEN 1 AND 100 OR _sender IS NULL OR length(_sender) NOT BETWEEN 1 AND 100 OR _headline IS NULL OR length(_headline)>200 OR _message IS NULL OR length(_message)>5000 THEN RAISE EXCEPTION 'Invalid surprise'; END IF; UPDATE public.surprises SET recipient_name=_recipient,sender_name=_sender,headline=_headline,message=_message WHERE id=_id AND user_id=auth.uid() AND status IN ('paid','delivered'); IF NOT FOUND THEN RAISE EXCEPTION 'Approved access required'; END IF; END $$;
CREATE FUNCTION public.save_surprise_photos(_id uuid,_photos text[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF; IF _photos IS NULL OR EXISTS(SELECT 1 FROM unnest(_photos) p WHERE p IS NULL OR p NOT LIKE auth.uid()::text||'/%' OR p LIKE '%..%') THEN RAISE EXCEPTION 'Invalid photo paths'; END IF; UPDATE public.surprises SET photos=_photos WHERE id=_id AND user_id=auth.uid() AND status IN ('paid','delivered'); IF NOT FOUND THEN RAISE EXCEPTION 'Approved access required'; END IF; END $$;
CREATE FUNCTION public.save_proposal_config(_id uuid, _config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF;
 IF _config IS NULL OR jsonb_typeof(_config) <> 'object' OR octet_length(_config::text)>20000 THEN RAISE EXCEPTION 'Invalid configuration'; END IF;
 IF coalesce(_config->>'audioPath','') <> '' AND (_config->>'audioPath' NOT LIKE auth.uid()::text || '/%' OR _config->>'audioPath' LIKE '%..%') THEN RAISE EXCEPTION 'Invalid audio'; END IF;
 IF _config ? 'quiz' THEN
  IF jsonb_typeof(_config->'quiz') <> 'array' OR jsonb_array_length(_config->'quiz') NOT BETWEEN 1 AND 10 THEN RAISE EXCEPTION 'Invalid quiz'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_config->'quiz') q WHERE jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options') NOT BETWEEN 2 AND 4 OR length(q->>'question') NOT BETWEEN 1 AND 300 OR (q->>'answer') IS NULL OR (q->>'answer')::int < 0 OR (q->>'answer')::int >= jsonb_array_length(q->'options')) THEN RAISE EXCEPTION 'Invalid question'; END IF;
 END IF;
 UPDATE public.surprises SET proposal_config=_config WHERE id=_id AND user_id=auth.uid() AND status IN ('paid','delivered');
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved access required'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.request_deposit(integer,text),public.purchase_template(uuid),public.save_surprise(uuid,text,text,text,text),public.save_surprise_photos(uuid,text[]),public.save_proposal_config(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.request_deposit(integer,text),public.purchase_template(uuid),public.save_surprise(uuid,text,text,text,text),public.save_surprise_photos(uuid,text[]),public.save_proposal_config(uuid,jsonb) TO authenticated;
CREATE FUNCTION public.get_surprise(_code text) RETURNS TABLE(recipient_name text,sender_name text,headline text,message text,photos text[],category text,cover_image text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT s.recipient_name,s.sender_name,s.headline,s.message,s.photos,t.category,t.cover_image FROM public.surprises s JOIN public.templates t ON t.id=s.template_id JOIN public.profiles p ON p.id=s.user_id WHERE s.code=_code AND s.status IN ('paid','delivered') AND NOT p.banned AND p.deleted_at IS NULL $$;
CREATE FUNCTION public.get_proposal_config(_code text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT s.proposal_config FROM public.surprises s JOIN public.profiles p ON p.id=s.user_id WHERE s.code=_code AND s.status IN ('paid','delivered') AND NOT p.banned AND p.deleted_at IS NULL $$;
REVOKE ALL ON FUNCTION public.get_surprise(text),public.get_proposal_config(text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.get_surprise(text),public.get_proposal_config(text) TO anon,authenticated;

CREATE POLICY owners_upload_media ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id IN ('photos','proposal-audio') AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL));
CREATE POLICY owners_read_media ON storage.objects FOR SELECT TO authenticated USING(bucket_id IN ('photos','proposal-audio') AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL));
CREATE POLICY owners_remove_media ON storage.objects FOR DELETE TO authenticated USING(bucket_id IN ('photos','proposal-audio') AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL));
CREATE POLICY template_covers_admin_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'template-covers' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE TABLE public.fam_payments(order_id text PRIMARY KEY, user_id uuid NOT NULL REFERENCES public.profiles(id), template_id uuid NOT NULL REFERENCES public.templates(id), amount_inr integer NOT NULL CHECK(amount_inr>0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','expired')), utr text UNIQUE, surprise_id uuid REFERENCES public.surprises(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.fam_payments TO authenticated; GRANT ALL ON public.fam_payments TO service_role;
ALTER TABLE public.fam_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fam payments" ON public.fam_payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.fam_key_ok(_key text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT encode(extensions.digest(coalesce(_key,''),'sha256'),'hex') = 'cb5daa45b710886d0910387dda0f813f5bd4ec53f40466e7d0a4afe9ef2e60a2' $$;
REVOKE ALL ON FUNCTION public.fam_key_ok(text) FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.start_fam_payment(_template uuid,_order_id text,_amount integer,_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE price integer;
BEGIN
  IF NOT public.fam_key_ok(_key) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF;
  SELECT price_inr INTO price FROM public.templates WHERE id=_template AND active;
  IF NOT FOUND OR price<>_amount OR price<=0 THEN RAISE EXCEPTION 'Template unavailable'; END IF;
  INSERT INTO public.fam_payments(order_id,user_id,template_id,amount_inr) VALUES(_order_id,auth.uid(),_template,_amount);
END $$;
CREATE FUNCTION public.complete_fam_payment(_order_id text,_paid_amount numeric,_utr text,_key text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.fam_payments; sid uuid;
BEGIN
  IF NOT public.fam_key_ok(_key) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO p FROM public.fam_payments WHERE order_id=_order_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF p.status='paid' THEN RETURN p.surprise_id; END IF;
  IF _paid_amount < p.amount_inr THEN RAISE EXCEPTION 'Amount mismatch'; END IF;
  INSERT INTO public.deposits(user_id,amount_inr,status,note) VALUES(p.user_id,p.amount_inr,'approved','FamGateway UPI '||_order_id||' UTR '||coalesce(_utr,''));
  INSERT INTO public.surprises(user_id,template_id,amount_inr,status) VALUES(p.user_id,p.template_id,p.amount_inr,'paid') RETURNING id INTO sid;
  UPDATE public.fam_payments SET status='paid',utr=nullif(_utr,''),surprise_id=sid,updated_at=now() WHERE order_id=_order_id;
  RETURN sid;
END $$;
CREATE FUNCTION public.record_surprise_view(_code text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE public.surprises SET views=views+1 WHERE code=_code AND status IN ('paid','delivered') $$;
REVOKE ALL ON FUNCTION public.start_fam_payment(uuid,text,integer,text), public.complete_fam_payment(text,numeric,text,text), public.record_surprise_view(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_fam_payment(uuid,text,integer,text), public.complete_fam_payment(text,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_surprise_view(text) TO anon, authenticated;
CREATE FUNCTION public.admin_set_fam_key(_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF _key IS NULL OR length(trim(_key)) < 10 OR length(_key) > 200 THEN RAISE EXCEPTION 'Invalid API key'; END IF;
  INSERT INTO public.settings(key,value) VALUES('famgateway_api_key',trim(_key)) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();
END $$;
CREATE FUNCTION public.admin_fam_key_hint() RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v text;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT value INTO v FROM public.settings WHERE key='famgateway_api_key';
  RETURN CASE WHEN v IS NULL OR v='' THEN NULL ELSE left(v,4)||'••••'||right(v,4) END;
END $$;
CREATE FUNCTION public.get_fam_key(_server text) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.fam_key_ok(_server) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  RETURN (SELECT nullif(value,'') FROM public.settings WHERE key='famgateway_api_key');
END $$;
REVOKE ALL ON FUNCTION public.admin_set_fam_key(text), public.admin_fam_key_hint(), public.get_fam_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_fam_key(text), public.admin_fam_key_hint(), public.get_fam_key(text) TO authenticated;

INSERT INTO public.templates(id,slug,title,category,tagline,description,price_inr,original_price_inr,rating,cover_image,badge,style,featured,active,created_at) VALUES('85ebaa53-125a-40e1-8f89-53755c8bb93e','proposal','Proposal Surprise','proposal','Mangni ke liye sabse khaas tareeqa','Ek interactive proposal page — ring ke saath haan ya na ka playful button, romantic music aur falling petals. Aapke naam, photos aur message ke saath.',499,999,4.9,'/__l5e/assets-v1/52ee1b28-be84-45a6-b236-33b97a330383/proposal-website-cover.jpg','Most Loved','romantic',true,true,'2026-10-17T08:52:01.378949+00:00');
INSERT INTO public.settings(key,value) VALUES('announcement',''),('maintenance_mode','off');
INSERT INTO public.templates (slug,title,category,tagline,description,price_inr,original_price_inr,rating,cover_image,badge,style,featured,active) VALUES
('birthday','Happy Birthday','birthday','A birthday full of little surprises','A personal birthday memory, handwritten note, birthday song and cake celebration.',499,999,0,'/__l5e/assets-v1/8e3dc72d-ba06-46ef-baa9-8bbcf8533b1f/birthday-template-cover.jpg','New','keepsake',false,true),
('love','Do You Love Me?','love','One little question, a heart full of love','A playful question with the original animated characters, a moving No button and a celebration made for your favourite person.',499,999,0,'/__l5e/assets-v1/aa0b037d-f732-43df-9969-c921a601859e/love-template-sad-bubu.gif','New','keepsake',false,true),
('your-surprise','Your Surprise','your-surprise','Three little pieces of your heart','An opening gift box with a personal letter, a photo memory, a song and one final note.',499,999,0,'/__l5e/assets-v1/6321fbbc-82d5-435f-aec0-c2ad4b1f28f3/your-surprise-template-cover.webp','New','keepsake',false,true),
('karwa-chauth','Karwa Chauth — Mera Chaand','karwa-chauth','Chalni se chaand, phir tum','Ek cinematic chaand raat: chalni ki rasm mein unki photo ka reveal, diyon wali pooja thaali, aapki yaadon ki slideshow, saat vaade aur ek pyaari chitthi — bansuri ki dhun ke saath.',99,299,4.9,'','New','karwa',true,true);