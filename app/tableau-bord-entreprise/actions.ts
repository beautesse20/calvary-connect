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
