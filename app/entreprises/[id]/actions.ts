'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function submitReview(businessId: string, rating: number, comment: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté pour laisser un avis.' };

  const { error } = await supabase
    .from('reviews')
    .upsert(
      { business_id: businessId, author_id: user.id, rating, comment, status: 'visible' },
      { onConflict: 'business_id,author_id' }
    );

  if (error) return { error: error.message };
  revalidatePath(`/entreprises/${businessId}`);
  return { success: true };
}

export async function sendBusinessMessage(businessId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté pour contacter cette entreprise.' };

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  const { error } = await supabase.from('messages').insert({
    business_id: businessId,
    sender_id: user.id,
    sender_name: profile?.full_name || user.email,
    sender_email: user.email,
    content,
  });

  if (error) return { error: error.message };
  return { success: true };
}
