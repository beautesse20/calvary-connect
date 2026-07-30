'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/components/LocaleProvider';

function ConnexionForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { dict, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials' ? dict.auth.invalidCredentials : error.message);
        return;
      }
      const next = searchParams.get('next') || '/';
      // Hard navigation on purpose: avoids stale Next.js router/RSC cache
      // holding an out-of-date auth state right after signing in.
      window.location.href = next;
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
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="mark" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 18px', fontSize: 18 }}>
          CC
        </div>
        <h1>{dict.auth.welcomeBack}</h1>
        <p className="sub">{dict.auth.loginSub}</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-alert">{error}</div>}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
            {pending ? <span className="spinner" /> : dict.auth.loginButton}
          </button>
        </form>

        <div className="divider">{dict.auth.or}</div>

        <div className="checkbox-row" style={{ justifyContent: 'center' }}>
          {dict.auth.noAccount}
        </div>

        <Link href="/creer-compte" className="btn btn-outline btn-block" style={{ marginTop: 12 }}>
          {dict.auth.createFreeAccount}
        </Link>

        <div className="auth-foot">
          {dict.auth.areYouBusiness} <Link href="/inscription">{dict.auth.registerBusiness}</Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <ConnexionForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
