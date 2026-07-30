'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { createClient } from '@/lib/supabase/client';

export default function CreerComptePage() {
  const router = useRouter();
  const supabase = createClient();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!accept) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: `${prenom} ${nom}`.trim() } },
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="mark" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 18px', fontSize: 18 }}>
            CC
          </div>
          <h1>Créer un compte gratuit</h1>
          <p className="sub">Accédez aux coordonnées complètes de l&apos;annuaire et contactez les entreprises de la communauté.</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-alert">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input type="text" className="form-control" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Adresse courriel</label>
              <input
                type="email"
                className="form-control"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="8 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="checkbox-row" style={{ marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span>J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité.</span>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
              {pending ? <span className="spinner" /> : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-foot">
            Déjà un compte ? <Link href="/connexion">Se connecter</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
