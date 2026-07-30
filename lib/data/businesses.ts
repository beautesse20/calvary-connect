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
    // Escape PostgREST filter special characters so a search containing
    // ",", "(", ")" or "%" doesn't break the .or() filter string or get
    // interpreted as a wildcard.
    const safe = opts.q.replace(/[,()%]/g, '');
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (opts.city) {
    query = query.ilike('city', `%${opts.city.replace(/[,()%]/g, '')}%`);
  }

  const { data } = await query;
  let results = (data || []) as Business[];

  if (opts.categorySlug) {
    results = results.filter((b) => b.categories?.slug === opts.categorySlug);
  }

  // Applied after the category filter (not as a SQL .limit()) so a
  // category+limit combination never truncates results before filtering.
  if (opts.limit) {
    results = results.slice(0, opts.limit);
  }

  return results;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('businesses').select('*, categories(*)').eq('id', id).single();
  return (data as Business) || null;
}
