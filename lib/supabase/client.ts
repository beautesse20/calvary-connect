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

// Bug connu de supabase-js (voir supabase/supabase-js#2013, #2111) : le verrou
// navigator.locks utilisé en interne pour sérialiser les appels d'auth peut
// rester bloqué indéfiniment (composant démonté en plein milieu d'un appel,
// onglet précédent resté ouvert, etc.), ce qui bloque TOUTES les opérations
// d'auth suivantes sans la moindre requête réseau ni erreur visible — exactement
// le symptôme "le bouton tourne à l'infini". Cette appli n'a pas besoin de la
// synchronisation multi-onglets que ce verrou apporte, donc on le neutralise.
const noOpLock = async <R,>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
  return await fn();
};

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          lock: noOpLock,
        },
      }
    );
  }
  return client;
}
