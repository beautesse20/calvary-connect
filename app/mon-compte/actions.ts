'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateMyProfile(fields: { fullName: string; newPassword?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fields.fullName })
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
