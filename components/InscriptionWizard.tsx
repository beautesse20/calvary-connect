'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category, ProfileType } from '@/lib/types';
import type { Locale } from '@/lib/i18n/dictionaries';
import { registerBusiness, uploadDocument, uploadLogo } from '@/app/inscription/actions';
import { useLocale } from './LocaleProvider';

export default function InscriptionWizard({
  userId,
  categories,
  locale: initialLocale,
}: {
  userId: string;
  categories: Category[];
  locale?: Locale;
}) {
  const { dict, locale: contextLocale } = useLocale();
  const locale = contextLocale || initialLocale || 'fr';
  const STEPS = [dict.inscription.step1, dict.inscription.step2, dict.inscription.step3, dict.inscription.step4];

  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ profileType: ProfileType; price: string } | null>(null);

  const [profileType, setProfileType] = useState<ProfileType>('registered');
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [regDoc, setRegDoc] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);

  const price = profileType === 'registered' ? '49,99 $ CAD' : '69,99 $ CAD';

  function goTo(n: number) {
    setError(null);
    setStep(n);
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError(dict.inscription.nameRequired);
      setStep(2);
      return;
    }
    setPending(true);
    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile);
        fd.append('userId', userId);
        const res = await uploadLogo(fd);
        if ('error' in res && res.error) throw new Error(res.error);
        logoUrl = 'url' in res && res.url ? res.url : null;
      }

      const documentPaths: { file_path: string; doc_type: string }[] = [];
      if (regDoc) {
        const fd = new FormData();
        fd.append('file', regDoc);
        fd.append('userId', userId);
        const res = await uploadDocument(fd);
        if ('error' in res && res.error) throw new Error(res.error);
        if ('path' in res && res.path) documentPaths.push({ file_path: res.path, doc_type: 'enregistrement' });
      }
      if (idDoc) {
        const fd = new FormData();
        fd.append('file', idDoc);
        fd.append('userId', userId);
        const res = await uploadDocument(fd);
        if ('error' in res && res.error) throw new Error(res.error);
        if ('path' in res && res.path) documentPaths.push({ file_path: res.path, doc_type: 'identite' });
      }

      const result = await registerBusiness({
        profileType,
        name,
        managerName,
        city,
        phone,
        email,
        description,
        categoryId,
        logoUrl,
        documentPaths,
      });

      if (result.error) throw new Error(result.error);

      setDone({ profileType, price });
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.inscription.genericError);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center' }}>
        <div className="modal-box" style={{ boxShadow: 'none', padding: 0 }}>
          <div className="icon-wrap" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>{dict.inscription.submittedTitle}</h3>
          <p>
            {locale === 'en' ? 'Thank you! Your listing "' : 'Merci ! Votre fiche « '}
            {name}
            {locale === 'en' ? '" ' : ' » '}
            {dict.inscription.submittedText} ({price} {locale === 'en' ? '/ year' : '/ an'}).
          </p>
          <Link href="/tableau-bord-entreprise" className="btn btn-primary btn-block">
            {dict.inscription.goToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="stepper">
        {STEPS.map((label, i) => (
          <button key={label} className={`step-tab${step === i + 1 ? ' active' : ''}`} onClick={() => goTo(i + 1)} type="button">
            <span className="num">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        {error && <div className="form-alert">{error}</div>}

        {step === 1 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>{dict.inscription.profileQuestion}</h2>

            <div
              className={`radio-card${profileType === 'registered' ? ' selected' : ''}`}
              onClick={() => setProfileType('registered')}
              style={{ marginBottom: 14 }}
            >
              <div className="dot"></div>
              <div>
                <strong>{dict.inscription.registeredTitle}</strong>
                <span className="d">{dict.inscription.registeredDesc}</span>
              </div>
            </div>

            <div className={`radio-card${profileType === 'independent' ? ' selected' : ''}`} onClick={() => setProfileType('independent')}>
              <div className="dot"></div>
              <div>
                <strong>{dict.inscription.independentTitle}</strong>
                <span className="d">{dict.inscription.independentDesc}</span>
              </div>
            </div>

            <div className="callout" style={{ marginTop: 20 }}>
              <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {dict.inscription.profileCallout}
            </div>

            <div className="step-actions">
              <span></span>
              <button className="btn btn-primary" onClick={() => goTo(2)} type="button">
                {dict.inscription.continue}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>{dict.inscription.basicInfoTitle}</h2>

            <div className="form-group">
              <label>{dict.inscription.businessName}</label>
              <input type="text" className="form-control" placeholder={dict.inscription.businessNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{dict.inscription.managerName}</label>
                <input type="text" className="form-control" placeholder={dict.inscription.managerNamePlaceholder} value={managerName} onChange={(e) => setManagerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{dict.inscription.city}</label>
                <input type="text" className="form-control" placeholder={dict.inscription.cityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{dict.inscription.phone}</label>
                <input type="text" className="form-control" placeholder="(604) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{dict.inscription.email}</label>
                <input type="text" className="form-control" placeholder="contact@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>{dict.inscription.description}</label>
              <textarea
                className="form-control"
                placeholder={dict.inscription.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(1)} type="button">
                {dict.inscription.back}
              </button>
              <button className="btn btn-primary" onClick={() => goTo(3)} type="button">
                {dict.inscription.continue}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>{dict.inscription.categoryTitle}</h2>

            <div className="form-group">
              <label>{dict.inscription.mainCategory}</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'en' ? c.name_en : c.name_fr}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{dict.inscription.logo}</label>
              <label className="upload-box" style={{ display: 'block', cursor: 'pointer' }}>
                <div className="icon" style={{ margin: '0 auto' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <strong>{logoFile ? logoFile.name : dict.inscription.uploadPrompt}</strong>
                <span>{dict.inscription.uploadHint}</span>
                <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(2)} type="button">
                {dict.inscription.back}
              </button>
              <button className="btn btn-primary" onClick={() => goTo(4)} type="button">
                {dict.inscription.continue}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>{dict.inscription.documentsTitle}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 16 }}>{dict.inscription.documentsText}</p>

            <label className="upload-box" style={{ display: 'block', marginBottom: 14, cursor: 'pointer' }}>
              <div className="icon" style={{ margin: '0 auto' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <strong>{regDoc ? regDoc.name : dict.inscription.docRegistration}</strong>
              <span>{dict.inscription.docHint}</span>
              <input type="file" accept="application/pdf,image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setRegDoc(e.target.files?.[0] || null)} />
            </label>

            <label className="upload-box" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="icon" style={{ margin: '0 auto' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <strong>{idDoc ? idDoc.name : dict.inscription.docId}</strong>
              <span>{dict.inscription.docHint}</span>
              <input type="file" accept="application/pdf,image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setIdDoc(e.target.files?.[0] || null)} />
            </label>

            <div className="callout amber" style={{ marginTop: 18 }}>
              <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {dict.inscription.revalidationWarning}
            </div>

            <div className="card" style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-100)', padding: 20, marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>{dict.inscription.profileType}</span>
                <strong style={{ fontSize: 14 }}>
                  {profileType === 'registered' ? dict.inscription.registeredTitle : dict.inscription.independentTitle}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--blue-100)' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue-900)' }}>{dict.inscription.annualSubscription}</span>
                <strong style={{ fontSize: 15, color: 'var(--blue-900)' }}>{price}</strong>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-2)', marginTop: 8 }}>{dict.inscription.paymentNote}</p>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(3)} type="button">
                {dict.inscription.back}
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={pending} type="button">
                {pending ? <span className="spinner" /> : dict.inscription.submit}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
