'use client';

import { useState } from 'react';
import type { Business, Category, Message, Review } from '@/lib/types';
import { updateMyBusiness } from '@/app/tableau-bord-entreprise/actions';
import { useLocale } from './LocaleProvider';

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
}: {
  business: Business;
  categories: Category[];
  messages: Message[];
  reviews: Review[];
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
                  <tr key={m.id}>
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
