'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Chaque appel à createClient() créait auparavant un NOUVEAU client Supabase.
// Or SiteHeader, DashSidebar et les pages connexion/creer-compte appellent
// tous createClient() sur la même page : plusieurs instances de GoTrueClient
// se disputent alors le même verrou navigator.locks("sb-<ref>-auth-token"),
// ce qui peut le bloquer indéfiniment (le formulaire de connexion tourne à
// l'infini sans jamais envoyer la requête réseau). On mémorise donc une seule
// instance partagée par toute la page.
let client: SupabaseClient | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
