create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user_role() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  insert into public.user_roles(user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_new_user_role();

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  tagline text not null default '',
  description text not null default '',
  price_inr integer not null default 0,
  original_price_inr integer not null default 0,
  rating numeric(2,1) not null default 4.8,
  cover_image text not null default '',
  badge text,
  style text not null default 'romance',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.templates to anon, authenticated; grant insert, update, delete on public.templates to authenticated; grant all on public.templates to service_role;
alter table public.templates enable row level security;
create policy "public read active" on public.templates for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin insert" on public.templates for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.templates for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.templates for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.surprises (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default substr(md5(random()::text),1,8),
  user_id uuid not null,
  template_id uuid not null references public.templates(id) on delete cascade,
  recipient_name text not null,
  sender_name text not null,
  headline text not null default '',
  message text not null default '',
  photos text[] not null default '{}',
  status text not null default 'pending',
  amount_inr integer not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.surprises to authenticated; grant all on public.surprises to service_role;
alter table public.surprises enable row level security;
create policy "own or admin read" on public.surprises for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own insert" on public.surprises for insert to authenticated with check (user_id = auth.uid());
create policy "own or admin update" on public.surprises for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own or admin delete" on public.surprises for delete to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.get_surprise(_code text)
returns table(recipient_name text, sender_name text, headline text, message text, photos text[], status text, style text, category text, cover_image text, title text)
language sql stable security definer set search_path=public as $$
  select s.recipient_name, s.sender_name, s.headline, s.message, s.photos, s.status, t.style, t.category, t.cover_image, t.title
  from public.surprises s join public.templates t on t.id = s.template_id where s.code = _code
$$;
grant execute on function public.get_surprise(text) to anon, authenticated;

create policy "public read photos" on storage.objects for select using (bucket_id='photos');
create policy "users upload own photos" on storage.objects for insert to authenticated with check (bucket_id='photos' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.templates (slug,title,category,tagline,description,price_inr,original_price_inr,rating,cover_image,badge,style,featured) values
('dreamy-birthday','Dreamy Birthday','Birthday','A birthday surprise straight from the heart.','Candles, confetti and your favourite photos come alive in a cinematic birthday website with music.',299,799,4.9,'/images/t-birthday.jpg','Bestseller','birthday',true),
('sweet-proposal','Sweet Proposal','Proposal','Ask the question that changes everything.','A slow, romantic reveal that ends with the big question — and a YES button that cannot be missed.',449,1199,4.8,'/images/t-proposal.jpg','Premium','proposal',true),
('royal-invitation','Royal Invitation','Invitation','Elegant digital invites for every celebration.','Gold-foil inspired invitation for weddings, engagements and ring ceremonies.',499,1499,4.7,'/images/t-wedding.jpg','New','invitation',true),
('forever-friends','Forever Friends','Friendship','A magical surprise for your best friend.','Inside jokes, memories and photos wrapped in sparkles.',249,699,4.8,'/images/t-friendship.jpg',null,'friendship',true),
('love-letter','Do You Love Me?','Love','One question. A million feelings.','A handwritten-style love letter that unfolds line by line.',0,399,4.6,'/images/t-love.jpg','Free','romance',true),
('rakhi-special','Rakhi Special','Festive','A heartfelt Raksha Bandhan gift.','Diyas, rakhi and memories for your sibling.',199,599,4.8,'/images/t-rakhi.jpg','Festive','festive',false),
('memory-flipbook','Memory Flipbook','Flipbook','Turn memories into a flippable book.','Each page flips to reveal a photo and a little note.',349,999,4.9,'/images/t-flipbook.jpg',null,'flipbook',true);