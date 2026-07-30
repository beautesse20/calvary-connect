'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Category, ProfileType } from '@/lib/types';
import { registerBusiness, uploadDocument, uploadLogo } from '@/app/inscription/actions';

const STEPS = ['Profil', 'Infos de base', 'Catégorie', 'Documents'];

export default function InscriptionWizard({ userId, categories }: { userId: string; categories: Category[] }) {
  const router = useRouter();
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
      setError('Le nom de l’entreprise est requis.');
      setStep(2);
      return;
    }
    setPending(true);
    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const res = await uploadLogo(logoFile, userId);
        if ('error' in res && res.error) throw new Error(res.error);
        logoUrl = 'url' in res && res.url ? res.url : null;
      }

      const documentPaths: { file_path: string; doc_type: string }[] = [];
      if (regDoc) {
        const res = await uploadDocument(regDoc, userId);
        if ('error' in res && res.error) throw new Error(res.error);
        if ('path' in res && res.path) documentPaths.push({ file_path: res.path, doc_type: 'enregistrement' });
      }
      if (idDoc) {
        const res = await uploadDocument(idDoc, userId);
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
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center' }}>
        <div className="modal-box" style={{ boxShadow: 'none', padding: 0 }}>
          <div
            className="icon-wrap"
            style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>Fiche soumise pour validation</h3>
          <p>
            Merci ! Votre fiche « {name} » a été envoyée à un administrateur. Vous recevrez un courriel une fois la
            validation effectuée, puis un lien de paiement ({price} / an).
          </p>
          <Link href="/tableau-bord-entreprise" className="btn btn-primary btn-block">
            Aller à mon tableau de bord
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
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Quel type de profil correspond à votre situation ?</h2>

            <div
              className={`radio-card${profileType === 'registered' ? ' selected' : ''}`}
              onClick={() => setProfileType('registered')}
              style={{ marginBottom: 14 }}
            >
              <div className="dot"></div>
              <div>
                <strong>Entreprise enregistrée</strong>
                <span className="d">
                  J&apos;ai un numéro d&apos;entreprise et je peux fournir un document d&apos;enregistrement. Abonnement : 49,99 $
                  CAD / an.
                </span>
              </div>
            </div>

            <div className={`radio-card${profileType === 'independent' ? ' selected' : ''}`} onClick={() => setProfileType('independent')}>
              <div className="dot"></div>
              <div>
                <strong>Professionnel indépendant / particulier</strong>
                <span className="d">
                  Je propose un service ou une compétence sans structure légale enregistrée. Abonnement : 69,99 $ CAD / an.
                </span>
              </div>
            </div>

            <div className="callout" style={{ marginTop: 20 }}>
              <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Les deux profils passent par la même validation par un administrateur : identité vérifiée, appartenance
              à la communauté, description honnête des services.
            </div>

            <div className="step-actions">
              <span></span>
              <button className="btn btn-primary" onClick={() => goTo(2)} type="button">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Informations de base</h2>

            <div className="form-group">
              <label>Nom de l&apos;entreprise ou du prestataire</label>
              <input type="text" className="form-control" placeholder="Ex. Rénovations Lambert" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nom du responsable</label>
                <input type="text" className="form-control" placeholder="Prénom et nom" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input type="text" className="form-control" placeholder="Ex. Surrey, BC" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Téléphone</label>
                <input type="text" className="form-control" placeholder="(604) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Courriel</label>
                <input type="text" className="form-control" placeholder="contact@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Description du service</label>
              <textarea
                className="form-control"
                placeholder="Décrivez votre entreprise et les services offerts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(1)} type="button">
                Retour
              </button>
              <button className="btn btn-primary" onClick={() => goTo(3)} type="button">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Catégorie de service</h2>

            <div className="form-group">
              <label>Catégorie principale</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Logo ou photo de l&apos;entreprise</label>
              <label className="upload-box" style={{ display: 'block', cursor: 'pointer' }}>
                <div className="icon" style={{ margin: '0 auto' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <strong>{logoFile ? logoFile.name : 'Glissez une image ou cliquez pour parcourir'}</strong>
                <span>PNG ou JPG, 5 Mo maximum</span>
                <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(2)} type="button">
                Retour
              </button>
              <button className="btn btn-primary" onClick={() => goTo(4)} type="button">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-panel active">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Documents justificatifs</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 16 }}>
              Ces documents sont visibles uniquement par les administrateurs — jamais publics. Ils servent uniquement
              à la validation de votre fiche.
            </p>

            <label className="upload-box" style={{ display: 'block', marginBottom: 14, cursor: 'pointer' }}>
              <div className="icon" style={{ margin: '0 auto' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <strong>{regDoc ? regDoc.name : "Numéro d'entreprise / document d'enregistrement"}</strong>
              <span>PDF, PNG ou JPG</span>
              <input type="file" accept="application/pdf,image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setRegDoc(e.target.files?.[0] || null)} />
            </label>

            <label className="upload-box" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="icon" style={{ margin: '0 auto' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <strong>{idDoc ? idDoc.name : "Pièce d'identité (facultatif selon profil)"}</strong>
              <span>PDF, PNG ou JPG</span>
              <input type="file" accept="application/pdf,image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setIdDoc(e.target.files?.[0] || null)} />
            </label>

            <div className="callout amber" style={{ marginTop: 18 }}>
              <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Une fois votre fiche approuvée, toute modification future devra repasser par une nouvelle validation.
              Assurez-vous que tout est exact avant de soumettre.
            </div>

            <div className="card" style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-100)', padding: 20, marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Type de profil</span>
                <strong style={{ fontSize: 14 }}>
                  {profileType === 'registered' ? 'Entreprise enregistrée' : 'Professionnel indépendant'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--blue-100)' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue-900)' }}>Abonnement annuel</span>
                <strong style={{ fontSize: 15, color: 'var(--blue-900)' }}>{price}</strong>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-2)', marginTop: 8 }}>
              Le paiement vous sera demandé par courriel une fois votre fiche approuvée par un administrateur.
            </p>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => goTo(3)} type="button">
                Retour
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={pending} type="button">
                {pending ? <span className="spinner" /> : 'Soumettre pour validation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
