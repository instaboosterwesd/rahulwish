-- Paste this whole file in Supabase → SQL Editor → Run (one time)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
ALTER TABLE public.surprises ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS public.fam_payments(
  order_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  template_id uuid NOT NULL REFERENCES public.templates(id),
  amount_inr integer NOT NULL CHECK(amount_inr>0),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','expired')),
  utr text UNIQUE,
  surprise_id uuid REFERENCES public.surprises(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fam_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own fam payments" ON public.fam_payments;
CREATE POLICY "own fam payments" ON public.fam_payments FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.fam_payments TO authenticated;
CREATE OR REPLACE FUNCTION public.fam_key_ok(_key text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT encode(extensions.digest(coalesce(_key,''),'sha256'),'hex') = 'cb5daa45b710886d0910387dda0f813f5bd4ec53f40466e7d0a4afe9ef2e60a2'
$$;
REVOKE ALL ON FUNCTION public.fam_key_ok(text) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.start_fam_payment(_template uuid,_order_id text,_amount integer,_key text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE price integer;
BEGIN
  IF NOT public.fam_key_ok(_key) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT banned AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account unavailable'; END IF;
  SELECT price_inr INTO price FROM public.templates WHERE id=_template AND active;
  IF NOT FOUND OR price<>_amount OR price<=0 THEN RAISE EXCEPTION 'Template unavailable'; END IF;
  INSERT INTO public.fam_payments(order_id,user_id,template_id,amount_inr) VALUES(_order_id,auth.uid(),_template,_amount);
END $$;
CREATE OR REPLACE FUNCTION public.complete_fam_payment(_order_id text,_paid_amount numeric,_utr text,_key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
CREATE OR REPLACE FUNCTION public.record_surprise_view(_code text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE public.surprises SET views=views+1 WHERE code=_code AND status IN ('paid','delivered')
$$;
REVOKE ALL ON FUNCTION public.start_fam_payment(uuid,text,integer,text), public.complete_fam_payment(text,numeric,text,text), public.record_surprise_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_fam_payment(uuid,text,integer,text), public.complete_fam_payment(text,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_surprise_view(text) TO anon, authenticated;
