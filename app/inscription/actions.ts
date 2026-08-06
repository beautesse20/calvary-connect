'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProfileType } from '@/lib/types';

export interface RegisterBusinessInput {
  profileType: ProfileType;
  name: string;
  managerName: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  categoryId: string;
  logoUrl: string | null;
  documentPaths: { file_path: string; doc_type: string }[];
}

export async function registerBusiness(input: RegisterBusinessInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Vous devez être connecté pour inscrire une entreprise.' };

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: input.name,
      profile_type: input.profileType,
      category_id: input.categoryId || null,
      city: input.city,
      description: `${input.description}${input.managerName ? `\n\nResponsable : ${input.managerName}` : ''}`,
      phone: input.phone,
      email: input.email,
      logo_url: input.logoUrl,
      status: 'pending',
      payment_status: 'none',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.documentPaths.length > 0) {
    const { error: docsError } = await supabase.from('business_documents').insert(
      input.documentPaths.map((d) => ({ business_id: business.id, file_path: d.file_path, doc_type: d.doc_type }))
    );
    if (docsError) return { error: docsError.message, business };
  }

  // Le profil devient 'business' pour refléter son rôle dans la navigation.
  await supabase.from('profiles').update({ role: 'business' }).eq('id', user.id);

  return { success: true, businessId: business.id };
}

// Les Server Actions de Next.js n'acceptent pas de manière fiable un objet
// File passé directement comme argument ("Only plain objects, and a few
// built-ins, can be passed to Server Actions. Classes or null prototypes are
// not supported."). On passe donc le fichier à travers un FormData, qui fait
// partie des quelques types intégrés explicitement supportés.
function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.\-]/g, '_');
}

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    if (!file || !userId) return { error: 'Fichier manquant.' };

    const supabase = await createClient();
    const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from('business-logos').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from('business-logos').getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi du logo." };
  }
}

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    if (!file || !userId) return { error: 'Fichier manquant.' };

    const supabase = await createClient();
    const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from('business-documents').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (error) return { error: error.message };
    return { path };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi du document." };
  }
}
