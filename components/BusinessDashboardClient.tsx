'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Business, BusinessDocument, Category, Message, Review } from '@/lib/types';
import { addBusinessDocument, updateBusinessLogo, updateMyBusiness } from '@/app/tableau-bord-entreprise/actions';
import { useLocale } from './LocaleProvider';

const DOC_TYPES = ['enregistrement', 'identite'] as const;

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending',
  approved: 'status-active',
  rejected: 'status-rejected',
  deactivated: 'status-rejected',
  suspended: 'status-rejected',
};

function timeAgo(iso: string, locale: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (locale === 'en') {
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

export default function BusinessDashboardClient({
  business,
  categories,
  messages,
  reviews,
  documents,
}: {
  business: Business;
  categories: Category[];
  messages: Message[];
  reviews: Review[];
  documents: BusinessDocument[];
}) {
  const { dict, locale } = useLocale();
  const STATUS_LABEL: Record<string, string> = {
    pending: dict.dashboardBusiness.statPending,
    approved: dict.dashboardBusiness.statApproved,
    rejected: dict.dashboardBusiness.statRejected,
    deactivated: dict.dashboardBusiness.statDeactivated,
    suspended: dict.dashboardBusiness.statSuspended,
  };
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [name, setName] = useState(business.name);
  const [city, setCity] = useState(business.city || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [website, setWebsite] = useState(business.website || '');
  const [description, setDescription] = useState(business.description || '');
  const [categoryId, setCategoryId] = useState(business.category_id || '');

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const [logo, setLogo] = useState(business.logo_url);
  const [logoPending, setLogoPending] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [docList, setDocList] = useState(documents);
  const [docPending, setDocPending] = useState<string | null>(null);
  const [docError, setDocError] = useState<Record<string, string>>({});
  const regDocInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const docInputRefs: Record<string, React.RefObject<HTMLInputElement>> = {
    enregistrement: regDocInputRef,
    identite: idDocInputRef,
  };

  const docLabel = (t: string) =>
    t === 'enregistrement' ? dict.dashboardBusiness.docRegistration : dict.dashboardBusiness.docIdentity;

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (file.size > 8 * 1024 * 1024) {
      setLogoError(dict.account.photoTooLarge);
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }
    setLogoPending(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('businessId', business.id);
      const res = await updateBusinessLogo(fd);
      if (res.error) setLogoError(res.error);
      else if ('url' in res && res.url) setLogo(res.url);
    } catch {
      setLogoError(dict.account.photoUploadError);
    } finally {
      setLogoPending(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  async function handleDocChange(docType: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const ref = docInputRefs[docType];
    if (!file) return;
    setDocError((prev) => ({ ...prev, [docType]: '' }));
    if (file.size > 8 * 1024 * 1024) {
      setDocError((prev) => ({ ...prev, [docType]: dict.account.photoTooLarge }));
      if (ref?.current) ref.current.value = '';
      return;
    }
    setDocPending(docType);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('businessId', business.id);
      fd.append('docType', docType);
      const res = await addBusinessDocument(fd);
      if (res.error) {
        setDocError((prev) => ({ ...prev, [docType]: res.error as string }));
      } else {
        setDocList((prev) => [
          { id: `${Date.now()}`, business_id: business.id, file_path: '', doc_type: docType, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch {
      setDocError((prev) => ({ ...prev, [docType]: dict.account.photoUploadError }));
    } finally {
      setDocPending(null);
      if (ref?.current) ref.current.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFeedback(null);
    const res = await updateMyBusiness(business.id, { name, city, phone, email, website, description, categoryId });
    setPending(false);
    if (res.error) {
      setFeedback({ type: 'error', text: res.error });
      return;
    }
    setEditing(false);
    setFeedback({
      type: 'success',
      text: res.revalidationTriggered ? dict.dashboardBusiness.revalidationTriggered : dict.dashboardBusiness.updated,
    });
  }

  return (
    <main className="dash-main">
      <div className="dash-head">
        <div>
          <h1>
            {dict.dashboardBusiness.hello}, {business.name}
          </h1>
          <p>
            {dict.dashboardBusiness.statusLabel} :{' '}
            <span className={`status-pill ${STATUS_CLASS[business.status]}`}>{STATUS_LABEL[business.status]}</span>
          </p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            {dict.dashboardBusiness.editListing}
          </button>
        )}
      </div>

      {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

      {business.status === 'rejected' && business.rejection_reason && (
        <div className="callout amber" style={{ marginBottom: 24 }}>
          {dict.dashboardBusiness.rejectedNote} : {business.rejection_reason}
        </div>
      )}

      {!editing && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h2 className="account-card-title">{dict.dashboardBusiness.logoDocsTitle}</h2>

          <div className="account-avatar-row" style={{ marginTop: 6 }}>
            <div className="account-avatar" style={{ borderRadius: 12 }}>
              {logo ? <img src={logo} alt="" /> : business.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoPending}
              >
                {logoPending ? <span className="spinner" /> : logo ? dict.dashboardBusiness.changeLogo : dict.dashboardBusiness.addLogo}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              {logoError && <div style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 6 }}>{logoError}</div>}
            </div>
          </div>

          {DOC_TYPES.map((docType) => {
            const existing = docList.find((d) => d.doc_type === docType);
            return (
              <div key={docType} style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {docLabel(docType)}
                </label>
                {existing ? (
                  <div className="file-chip">
                    <span>{dict.dashboardBusiness.docProvided}</span>
                    <button type="button" onClick={() => docInputRefs[docType].current?.click()} disabled={docPending === docType}>
                      {docPending === docType ? <span className="spinner dark" /> : dict.dashboardBusiness.replaceDocument}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => docInputRefs[docType].current?.click()}
                    disabled={docPending === docType}
                  >
                    {docPending === docType ? <span className="spinner dark" /> : dict.dashboardBusiness.addDocument}
                  </button>
                )}
                <input
                  ref={docInputRefs[docType]}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => handleDocChange(docType, e)}
                />
                {docError[docType] && (
                  <div style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 6 }}>{docError[docType]}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing ? (
        <form className="card card-pad" onSubmit={handleSave} style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label>{dict.dashboardBusiness.businessName}</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{dict.dashboardBusiness.city}</label>
              <input className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{dict.dashboardBusiness.category}</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'en' ? c.name_en : c.name_fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{dict.dashboardBusiness.phone}</label>
              <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{dict.dashboardBusiness.email}</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>{dict.dashboardBusiness.website}</label>
            <input className="form-control" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{dict.dashboardBusiness.description}</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="callout amber" style={{ marginBottom: 18 }}>
            {dict.dashboardBusiness.revalidationWarning}
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
              {dict.dashboardBusiness.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? <span className="spinner" /> : dict.dashboardBusiness.save}
            </button>
          </div>
        </form>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="num">{messages.length}</div>
            <div className="lbl">{dict.dashboardBusiness.messagesReceived}</div>
            <div className="delta">
              {unreadCount} {unreadCount === 1 ? dict.dashboardBusiness.unread : dict.dashboardBusiness.unreadPlural}
            </div>
          </div>
          <div className="stat-card">
            <div className="num">{reviews.length}</div>
            <div className="lbl">{dict.dashboardBusiness.reviewsReceived}</div>
            <div className="delta">
              {avgRating > 0 ? `${dict.dashboardBusiness.averageRating} ${avgRating.toFixed(1)}/5` : dict.dashboardBusiness.noReviews}
            </div>
          </div>
          <div className="stat-card">
            <div className="num">{business.profile_type === 'registered' ? '49,99 $' : '69,99 $'}</div>
            <div className="lbl">{dict.dashboardBusiness.annualSubscription}</div>
            <div className="delta">{business.payment_status === 'active' ? dict.dashboardBusiness.active : dict.dashboardBusiness.inactive}</div>
          </div>
          <div className="stat-card">
            <div className="num">{STATUS_LABEL[business.status]}</div>
            <div className="lbl">{dict.dashboardBusiness.listingStatus}</div>
          </div>
        </div>
      )}

      {!editing && (
        <div className="table-card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px 0' }}>
            <Link href="/tableau-bord-entreprise/messagerie" style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-700)' }}>
              {dict.dashboardBusiness.goToMessaging} →
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>{dict.dashboardBusiness.recentMessage}</th>
                <th>{dict.dashboardBusiness.from}</th>
                <th>{dict.dashboardBusiness.received}</th>
                <th>{dict.dashboardBusiness.status}</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    {dict.dashboardBusiness.noMessages}
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} onClick={() => (window.location.href = '/tableau-bord-entreprise/messagerie')} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="row-title">{m.sender_name || (locale === 'en' ? 'Member' : 'Membre')}</div>
                      <div className="row-sub">« {m.content.slice(0, 80)}{m.content.length > 80 ? '…' : ''} »</div>
                    </td>
                    <td>{m.sender_email}</td>
                    <td>{timeAgo(m.created_at, locale)}</td>
                    <td>
                      <span className={`status-pill ${m.status === 'unread' ? 'status-pending' : 'status-active'}`}>
                        {m.status === 'unread' ? dict.dashboardBusiness.unreadLabel : dict.dashboardBusiness.read}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
