-- Calvary Connect — schéma initial Supabase (Phase 2 MVP)
-- À exécuter dans Supabase Dashboard > SQL Editor > New query > Run

-- 1. Extension des profils (rôles) liée à auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','business','admin','super_admin')),
  phone text,
  avatar_url text,
  preferred_locale text check (preferred_locale in ('fr','en')),
  email_notifications boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Catégories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  icon text
);

insert into public.categories (slug, name_fr, name_en, icon) values
  ('construction', 'Construction & rénovation', 'Construction & Renovation', 'wrench'),
  ('automobile', 'Automobile', 'Automotive', 'car'),
  ('sante', 'Santé & bien-être', 'Health & Wellness', 'heart'),
  ('finance', 'Finance & comptabilité', 'Finance & Accounting', 'dollar'),
  ('juridique', 'Juridique', 'Legal', 'scale'),
  ('alimentation', 'Alimentation & traiteur', 'Food & Catering', 'utensils'),
  ('beaute', 'Beauté & coiffure', 'Beauty & Hair', 'scissors'),
  ('evenementiel', 'Événementiel & photographie', 'Events & Photography', 'camera'),
  ('technologie', 'Technologie', 'Technology', 'monitor'),
  ('education', 'Éducation', 'Education', 'book'),
  ('domicile', 'Services à domicile', 'Home Services', 'home'),
  ('immobilier', 'Immobilier', 'Real Estate', 'building'),
  ('transport', 'Transport', 'Transportation', 'truck'),
  ('autres', 'Autres', 'Other', 'grid')
on conflict (slug) do nothing;

-- 3. Entreprises / prestataires
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  profile_type text not null check (profile_type in ('registered','independent')),
  category_id uuid references public.categories(id),
  city text,
  region text default 'BC',
  community text default 'Calvary Worship Center',
  description text,
  phone text,
  email text,
  website text,
  logo_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','deactivated','suspended')),
  payment_status text not null default 'none' check (payment_status in ('none','active','expired')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Documents justificatifs (privés, jamais publics)
create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  file_path text not null,
  doc_type text,
  uploaded_at timestamptz not null default now()
);

-- 5. Avis
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'visible' check (status in ('visible','flagged','removed')),
  created_at timestamptz not null default now(),
  unique (business_id, author_id)
);

-- 6. Messages de contact (utilisateur -> entreprise)
-- sender_id est en "on delete set null" (et non cascade) : si un membre
-- supprime son compte, l'historique de messages reste pour l'entreprise
-- destinataire, seul le lien vers l'expéditeur disparaît.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text,
  sender_email text,
  content text not null,
  status text not null default 'unread' check (status in ('unread','read')),
  reply_content text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- 7. Entreprises favorites (enregistrées par un membre)
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);

-- ===================== RLS =====================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_documents enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;

-- Fonction SECURITY DEFINER : vérifie si l'utilisateur courant est admin.
-- Contourne RLS en interne, ce qui évite la récursion infinie qu'on obtient
-- quand une policy sur "profiles" fait un sous-select sur "profiles" lui-même.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin')
  );
$$;

-- Profiles: chacun voit/modifie le sien ; les admins voient tout
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin());

-- Catégories: lecture publique
create policy "categories_public_read" on public.categories for select using (true);

-- Entreprises: public voit les approuvées ; propriétaire voit/gère la sienne ; admin gère tout
create policy "businesses_public_read_approved" on public.businesses for select using (status = 'approved');
create policy "businesses_owner_read" on public.businesses for select using (owner_id = auth.uid());
create policy "businesses_owner_insert" on public.businesses for insert with check (owner_id = auth.uid());
create policy "businesses_owner_update" on public.businesses for update using (owner_id = auth.uid());
create policy "businesses_admin_all" on public.businesses for all using (public.is_admin());

-- Documents: seulement propriétaire + admin (jamais public)
create policy "docs_owner_read" on public.business_documents for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "docs_owner_insert" on public.business_documents for insert with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "docs_admin_all" on public.business_documents for all using (public.is_admin());

-- Avis: lecture publique si visible ; utilisateurs connectés peuvent poster/modifier leur propre avis
create policy "reviews_public_read" on public.reviews for select using (status = 'visible');
create policy "reviews_user_insert" on public.reviews for insert with check (auth.uid() is not null and auth.uid() = author_id);
create policy "reviews_user_update" on public.reviews for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "reviews_user_delete" on public.reviews for delete using (auth.uid() = author_id);
create policy "reviews_admin_all" on public.reviews for all using (public.is_admin());

-- Messages: propriétaire de l'entreprise + expéditeur + admin
create policy "messages_owner_read" on public.messages for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "messages_sender_read" on public.messages for select using (auth.uid() = sender_id);
-- Un visiteur sans compte ne doit jamais pouvoir écrire dans messages : il
-- faut être connecté ET s'inscrire soi-même comme expéditeur (empêche aussi
-- d'usurper l'identité d'un autre membre via sender_id).
create policy "messages_user_insert" on public.messages for insert with check (
  auth.uid() is not null and auth.uid() = sender_id
);
-- La propriétaire d'une entreprise doit pouvoir marquer un message comme lu
-- et y répondre (aucune policy UPDATE n'existait avant pour elle : "marquer
-- comme lu" échouait silencieusement).
create policy "messages_owner_update" on public.messages for update using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "messages_admin_all" on public.messages for all using (public.is_admin());

-- Favoris: chacun gère ses propres favoris uniquement
create policy "favorites_owner_all" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: créer automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket privé pour les documents justificatifs
insert into storage.buckets (id, name, public)
values ('business-documents', 'business-documents', false)
on conflict (id) do nothing;

-- Storage bucket public pour les logos
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

-- Storage RLS : le flag "public" d'un bucket ne dispense QUE la lecture de
-- RLS. L'upload (insert) exige toujours des policies explicites sur
-- storage.objects, sans quoi tous les téléversements échouent.
-- Les fichiers sont rangés sous "<user_id>/..." (voir uploadLogo/uploadDocument),
-- storage.foldername(name) permet donc de restreindre chacun à son propre dossier.

-- business-logos : lecture publique, écriture réservée au propriétaire du dossier
create policy "logos_public_read" on storage.objects for select using (
  bucket_id = 'business-logos'
);
create policy "logos_owner_insert" on storage.objects for insert with check (
  bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "logos_owner_update" on storage.objects for update using (
  bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text
);

-- business-documents : jamais public, lecture réservée au propriétaire ou à un admin
create policy "documents_owner_read" on storage.objects for select using (
  bucket_id = 'business-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
create policy "documents_owner_insert" on storage.objects for insert with check (
  bucket_id = 'business-documents' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage bucket public pour les photos de profil
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects for select using (
  bucket_id = 'avatars'
);
create policy "avatars_owner_insert" on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatars_owner_update" on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
