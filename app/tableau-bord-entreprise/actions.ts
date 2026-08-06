'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateMyBusiness(
  businessId: string,
  fields: {
    name: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    categoryId: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non connecté.' };

  const { data: existing } = await supabase.from('businesses').select('owner_id, status').eq('id', businessId).single();
  if (!existing || existing.owner_id !== user.id) return { error: 'Fiche introuvable.' };

  const wasApproved = existing.status === 'approved';

  const { error } = await supabase
    .from('businesses')
    .update({
      name: fields.name,
      city: fields.city,
      phone: fields.phone,
      email: fields.email,
      website: fields.website,
      description: fields.description,
      category_id: fields.categoryId || null,
      status: wasApproved ? 'pending' : existing.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  if (error) return { error: error.message };
  revalidatePath('/tableau-bord-entreprise');
  return { success: true, revalidationTriggered: wasApproved };
}

export async function markMessageRead(messageId: string) {
  const supabase = await createClient();
  await supabase.from('messages').update({ status: 'read' }).eq('id', messageId);
  revalidatePath('/tableau-bord-entreprise');
}

// Les Server Actions de Next.js n'acceptent pas de manière fiable un objet
// File passé directement comme argument ("Only plain objects, and a few
// built-ins, can be passed to Server Actions."). On passe donc le fichier à
// travers un FormData, qui fait partie des types intégrés supportés.
function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.\-]/g, '_');
}

async function assertOwnsBusiness(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string, userId: string) {
  const { data: existing } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
  return !!existing && existing.owner_id === userId;
}

export async function updateBusinessLogo(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const businessId = formData.get('businessId') as string | null;
    if (!file || !businessId) return { error: 'Fichier manquant.' };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Non connecté.' };
    if (!(await assertOwnsBusiness(supabase, businessId, user.id))) return { error: 'Fiche introuvable.' };

    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('business-logos').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from('business-logos').getPublicUrl(path);
    const { error } = await supabase.from('businesses').update({ logo_url: data.publicUrl }).eq('id', businessId);
    if (error) return { error: error.message };

    revalidatePath('/tableau-bord-entreprise');
    return { success: true, url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi du logo." };
  }
}

export async function addBusinessDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const businessId = formData.get('businessId') as string | null;
    const docType = formData.get('docType') as string | null;
    if (!file || !businessId || !docType) return { error: 'Fichier manquant.' };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Non connecté.' };
    if (!(await assertOwnsBusiness(supabase, businessId, user.id))) return { error: 'Fiche introuvable.' };

    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('business-documents').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (uploadError) return { error: uploadError.message };

    const { error } = await supabase
      .from('business_documents')
      .insert({ business_id: businessId, file_path: path, doc_type: docType });
    if (error) return { error: error.message };

    revalidatePath('/tableau-bord-entreprise');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi du document." };
  }
}
