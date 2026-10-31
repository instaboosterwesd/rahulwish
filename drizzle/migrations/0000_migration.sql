ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (lower(username)) WHERE username IS NOT NULL;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN INSERT INTO public.profiles(id,email,full_name,phone,username) VALUES(NEW.id,coalesce(NEW.email,''),coalesce(NEW.raw_user_meta_data->>'full_name',''),nullif(NEW.raw_user_meta_data->>'phone',''),nullif(lower(NEW.raw_user_meta_data->>'username'),'')) ON CONFLICT(id) DO NOTHING; RETURN NEW; END $function$;