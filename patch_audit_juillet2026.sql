-- Calvary Connect — correctifs suite à l'audit du 30 juillet 2026
-- À exécuter dans Supabase Dashboard > SQL Editor > New query > Run
-- (sans danger : peut être exécuté même si la base a déjà tourné en prod)

-- ============================================================
-- 1. Fonction is_admin() — corrige un risque de "récursion infinie"
--    sur les policies RLS qui vérifient le rôle admin en refaisant
--    un select sur la table profiles depuis sa propre policy.
-- ============================================================
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

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin());

drop policy if exists "businesses_admin_all" on public.businesses;
create policy "businesses_admin_all" on public.businesses for all using (public.is_admin());

drop policy if exists "docs_admin_all" on public.business_documents;
create policy "docs_admin_all" on public.business_documents for all using (public.is_admin());

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews for all using (public.is_admin());

drop policy if exists "messages_admin_all" on public.messages;
create policy "messages_admin_all" on public.messages for all using (public.is_admin());

-- ============================================================
-- 2. Permettre à un membre de modifier son propre avis existant
--    (le formulaire d'avis fait un "upsert" ; sans cette policy,
--    laisser un 2e avis sur la même entreprise échouait en silence)
-- ============================================================
drop policy if exists "reviews_user_update" on public.reviews;
create policy "reviews_user_update" on public.reviews for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- ============================================================
-- 3. Policies Storage manquantes — SANS elles, tous les
--    téléversements (logo, documents) de l'inscription
--    entreprise échouent, même si le bucket est "public".
-- ============================================================
drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read" on storage.objects for select using (
  bucket_id = 'business-logos'
);

drop policy if exists "logos_owner_insert" on storage.objects;
create policy "logos_owner_insert" on storage.objects for insert with check (
  bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "logos_owner_update" on storage.objects;
create policy "logos_owner_update" on storage.objects for update using (
  bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_owner_read" on storage.objects;
create policy "documents_owner_read" on storage.objects for select using (
  bucket_id = 'business-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "documents_owner_insert" on storage.objects;
create policy "documents_owner_insert" on storage.objects for insert with check (
  bucket_id = 'business-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
