-- Calvary Connect — messagerie entreprise + sécurisation des envois anonymes
-- À exécuter dans Supabase Dashboard > SQL Editor > New query > Run
-- Sans danger : n'affecte aucune donnée existante.

-- ============================================================
-- 1. Colonnes de réponse sur messages
-- ============================================================
alter table public.messages add column if not exists reply_content text;
alter table public.messages add column if not exists replied_at timestamptz;

-- ============================================================
-- 2. Empêcher l'envoi de messages/avis sans compte
--    (une personne non connectée ne doit jamais pouvoir écrire dans ces
--    tables, même via un appel direct à l'API — le formulaire du site les
--    cachait déjà côté interface, mais la base de données les autorisait
--    quand même sans vérifier l'authentification)
-- ============================================================
drop policy if exists "messages_user_insert" on public.messages;
create policy "messages_user_insert" on public.messages for insert with check (
  auth.uid() is not null and auth.uid() = sender_id
);

drop policy if exists "reviews_user_insert" on public.reviews;
create policy "reviews_user_insert" on public.reviews for insert with check (
  auth.uid() is not null and auth.uid() = author_id
);

-- ============================================================
-- 3. Permettre à la propriétaire d'une entreprise de marquer un message
--    comme lu et d'y répondre (aucune policy UPDATE n'existait avant pour
--    elle sur cette table)
-- ============================================================
drop policy if exists "messages_owner_update" on public.messages;
create policy "messages_owner_update" on public.messages for update using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
