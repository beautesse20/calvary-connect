'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non connecté.' as const };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Accès réservé aux administrateurs.' as const };
  }
  return { supabase, user };
}

export async function approveBusiness(businessId: string) {
  const ctx = await requireAdmin();
  if ('error' in ctx) return ctx;
  const { error } = await ctx.supabase
    .from('businesses')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', businessId);
  if (error) return { error: error.message };
  revalidatePath('/tableau-bord-admin');
  return { success: true };
  // Note : l'envoi d'un courriel automatique ("votre fiche est approuvée, procédez au paiement")
  // nécessite un fournisseur transactionnel (ex. Resend) à brancher ici — voir README.
}

export async function rejectBusiness(businessId: string, reason: string) {
  const ctx = await requireAdmin();
  if ('error' in ctx) return ctx;
  const { error } = await ctx.supabase
    .from('businesses')
    .update({ status: 'rejected', rejection_reason: reason || null })
    .eq('id', businessId);
  if (error) return { error: error.message };
  revalidatePath('/tableau-bord-admin');
  return { success: true };
}

export async function deactivateBusiness(businessId: string, reason: string) {
  const ctx = await requireAdmin();
  if ('error' in ctx) return ctx;
  const { error } = await ctx.supabase
    .from('businesses')
    .update({ status: 'deactivated', rejection_reason: reason || null })
    .eq('id', businessId);
  if (error) return { error: error.message };
  revalidatePath('/tableau-bord-admin');
  return { success: true };
  // Note : un courriel automatique au contact de l'entreprise nécessite aussi un
  // fournisseur transactionnel — voir README pour brancher Resend/SendGrid.
}

export async function reactivateBusiness(businessId: string) {
  const ctx = await requireAdmin();
  if ('error' in ctx) return ctx;
  const { error } = await ctx.supabase.from('businesses').update({ status: 'approved' }).eq('id', businessId);
  if (error) return { error: error.message };
  revalidatePath('/tableau-bord-admin');
  return { success: true };
}

export async function promoteToAdmin(email: string) {
  const ctx = await requireAdmin();
  if ('error' in ctx) return ctx;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return { error: error.message };

  const target = data.users.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
  if (!target) {
    return { error: "Aucun compte trouvé avec ce courriel. La personne doit d'abord créer un compte gratuit." };
  }

  const { error: updateError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', target.id);
  if (updateError) return { error: updateError.message };

  revalidatePath('/tableau-bord-admin');
  return { success: true };
}
