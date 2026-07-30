import { createClient } from '@/lib/supabase/server';
import type { Business, Category } from '@/lib/types';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name_fr');
  return data || [];
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('businesses')
    .select('category_id')
    .eq('status', 'approved');
  const counts: Record<string, number> = {};
  (data || []).forEach((row: { category_id: string | null }) => {
    if (!row.category_id) return;
    counts[row.category_id] = (counts[row.category_id] || 0) + 1;
  });
  return counts;
}

export async function searchBusinesses(opts: {
  q?: string;
  categorySlug?: string;
  city?: string;
  limit?: number;
}): Promise<Business[]> {
  const supabase = await createClient();
  let query = supabase
    .from('businesses')
    .select('*, categories(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (opts.q) {
    query = query.or(`name.ilike.%${opts.q}%,description.ilike.%${opts.q}%`);
  }
  if (opts.city) {
    query = query.ilike('city', `%${opts.city}%`);
  }
  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data } = await query;
  let results = (data || []) as Business[];

  if (opts.categorySlug) {
    results = results.filter((b) => b.categories?.slug === opts.categorySlug);
  }

  return results;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('businesses').select('*, categories(*)').eq('id', id).single();
  return (data as Business) || null;
}
