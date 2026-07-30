'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/components/LocaleProvider';

export default function CreerComptePage() {
  const router = useRouter();
  const supabase = createClient();
  const { dict, locale } = useLocale();
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
      setError(dict.auth.mustAcceptTerms);
      return;
    }
    if (password.length < 8) {
      setError(dict.auth.passwordTooShort);
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: `${prenom} ${nom}`.trim() } },
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push('/');
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? `${locale === 'en' ? 'Connection error' : 'Erreur de connexion'}: ${e.message}`
          : locale === 'en'
            ? 'Connection error. Check your internet connection and try again.'
            : 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.'
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="mark" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 18px', fontSize: 18 }}>
            CC
          </div>
          <h1>{dict.auth.signupTitle}</h1>
          <p className="sub">{dict.auth.signupSub}</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-alert">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>{dict.auth.firstName}</label>
                <input type="text" className="form-control" placeholder={dict.auth.firstName} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{dict.auth.lastName}</label>
                <input type="text" className="form-control" placeholder={dict.auth.lastName} value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>{dict.auth.email}</label>
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
              <label>{dict.auth.password}</label>
              <input
                type="password"
                className="form-control"
                placeholder={dict.auth.passwordHint}
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
              <span>{dict.auth.acceptTerms}</span>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
              {pending ? <span className="spinner" /> : dict.auth.createAccountButton}
            </button>
          </form>

          <div className="auth-foot">
            {dict.auth.alreadyAccount} <Link href="/connexion">{dict.auth.login}</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
