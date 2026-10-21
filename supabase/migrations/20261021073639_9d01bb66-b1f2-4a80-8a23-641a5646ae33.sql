INSERT INTO public.templates (slug,title,category,tagline,description,price_inr,original_price_inr,rating,cover_image,badge,style,featured,active)
SELECT v.slug,v.title,v.category,v.tagline,v.description,p.price_inr,p.original_price_inr,0,v.cover_image,'New','keepsake',false,true
FROM (VALUES
('birthday','Happy Birthday','birthday','A birthday full of little surprises','A personal birthday memory, handwritten note, birthday song and cake celebration.','/__l5e/assets-v1/8e3dc72d-ba06-46ef-baa9-8bbcf8533b1f/birthday-template-cover.jpg'),
('love','Do You Love Me?','love','One little question, a heart full of love','A playful question with the original animated characters, a moving No button and a celebration made for your favourite person.','/__l5e/assets-v1/aa0b037d-f732-43df-9969-c921a601859e/love-template-sad-bubu.gif'),
('your-surprise','Your Surprise','your-surprise','Three little pieces of your heart','An opening gift box with a personal letter, a photo memory, a song and one final note.','/__l5e/assets-v1/6321fbbc-82d5-435f-aec0-c2ad4b1f28f3/your-surprise-template-cover.webp')
) AS v(slug,title,category,tagline,description,cover_image)
CROSS JOIN public.templates p WHERE p.slug='proposal'
ON CONFLICT (slug) DO NOTHING;
UPDATE public.templates SET cover_image='/__l5e/assets-v1/52ee1b28-be84-45a6-b236-33b97a330383/proposal-website-cover.jpg' WHERE slug='proposal';