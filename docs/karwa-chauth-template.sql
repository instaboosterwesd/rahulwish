-- Adds the Karwa Chauth template to your catalog (run once in the SQL editor)
INSERT INTO public.templates(slug,title,category,tagline,description,price_inr,original_price_inr,rating,cover_image,badge,style,featured,active)
VALUES('karwa-chauth','Karwa Chauth — Mera Chaand','karwa-chauth','Chalni se chaand, phir tum',
'Ek cinematic chaand raat: chalni ki rasm mein unki photo ka reveal, diyon wali pooja thaali, aapki yaadon ki slideshow, saat vaade aur ek pyaari chitthi — bansuri ki dhun ke saath.',
99,299,4.9,'','New','karwa',true,true)
ON CONFLICT(slug) DO NOTHING;
