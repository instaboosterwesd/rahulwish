DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
INSERT INTO public.profiles(id,email,full_name,phone,username)
SELECT id, coalesce(email,''), coalesce(raw_user_meta_data->>'full_name',''), nullif(raw_user_meta_data->>'phone',''), nullif(lower(raw_user_meta_data->>'username'),'')
FROM auth.users ON CONFLICT (id) DO NOTHING;