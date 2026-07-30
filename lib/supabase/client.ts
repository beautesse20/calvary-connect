'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Chaque appel à createClient() créait auparavant un NOUVEAU client Supabase.
// Or SiteHeader, DashSidebar et les pages connexion/creer-compte appellent
// tous createClient() sur la même page : plusieurs instances de GoTrueClient
// se disputent alors le même verrou navigator.locks("sb-<ref>-auth-token"),
// ce qui peut le bloquer indéfiniment (le formulaire de connexion tourne à
// l'infini sans jamais envoyer la requête réseau).
//
// On mémorise donc une seule instance partagée. Elle est rattachée à
// `globalThis` (et pas juste à une variable de module) car Next.js peut
// dupliquer ce module dans plusieurs chunks JS distincts — une variable de
// module ordinaire ne suffit alors pas à garantir un vrai singleton unique
// à l'échelle de toute la page.
const GLOBAL_KEY = '__calvaryConnectSupabaseBrowserClient__';

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
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: SupabaseClient };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          lock: noOpLock,
        },
      }
    );
  }
  return g[GLOBAL_KEY];
}
