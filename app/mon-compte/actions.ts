'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function updateMyProfile(fields: {
  fullName: string;
  phone: string;
  emailNotifications: boolean;
  newPassword?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fields.fullName,
      phone: fields.phone || null,
      email_notifications: fields.emailNotifications,
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  if (fields.newPassword && fields.newPassword.length > 0) {
    if (fields.newPassword.length < 8) {
      return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' };
    }
    const { error: passwordError } = await supabase.auth.updateUser({ password: fields.newPassword });
    if (passwordError) return { error: passwordError.message };
  }

  revalidatePath('/mon-compte');
  return { success: true };
}

export async function uploadAvatar(file: File) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Vous devez être connecté.' };

    // Les noms de fichiers avec espaces, accents ou parenthèses (ex: photo
    // envoyée depuis un iPhone) peuvent poser problème comme clé de stockage :
    // on nettoie le nom pour ne garder que des caractères sûrs.
    const safeName = file.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9.\-]/g, '_');
    const path = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    });
    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id);
    if (profileError) return { error: profileError.message };

    revalidatePath('/mon-compte');
    return { success: true, url: data.publicUrl };
  } catch (e) {
    // Filet de sécurité : si l'appel lève une exception (bucket manquant,
    // erreur réseau, etc.) au lieu de renvoyer un champ `error`, on renvoie
    // quand même un message exploitable plutôt qu'un échec Server Action
    // générique sans détail.
    return { error: e instanceof Error ? e.message : "Échec de l'envoi de la photo." };
  }
}

export async function deleteMyReview(reviewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId).eq('author_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/mon-compte');
  return { success: true };
}

export async function removeFavorite(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', businessId);
  if (error) return { error: error.message };

  revalidatePath('/mon-compte');
  return { success: true };
}

export async function toggleFavorite(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
    if (error) return { error: error.message };
    return { success: true, favorited: false };
  }

  const { error } = await supabase.from('favorites').insert({ user_id: user.id, business_id: businessId });
  if (error) return { error: error.message };
  return { success: true, favorited: true };
}

// Suppression de compte : les entreprises (owner_id), avis (author_id) et
// messages (sender_id) sont déjà configurés avec la bonne règle de
// suppression au niveau de la base (set null / cascade), donc supprimer
// l'utilisateur via l'API admin nettoie tout automatiquement.
export async function deleteMyAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  return { success: true };
}
