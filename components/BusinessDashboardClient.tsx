'use client';

import { useState } from 'react';
import type { Business, Category, Message, Review } from '@/lib/types';
import { updateMyBusiness } from '@/app/tableau-bord-entreprise/actions';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente de validation',
  approved: 'Approuvée',
  rejected: 'Refusée',
  deactivated: 'Désactivée',
  suspended: 'Suspendue',
};
const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending',
  approved: 'status-active',
  rejected: 'status-rejected',
  deactivated: 'status-rejected',
  suspended: 'status-rejected',
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
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
      text: res.revalidationTriggered
        ? 'Fiche mise à jour. Comme elle était approuvée, elle repasse en validation administrateur avant de redevenir visible publiquement.'
        : 'Fiche mise à jour.',
    });
  }

  return (
    <main className="dash-main">
      <div className="dash-head">
        <div>
          <h1>Bonjour, {business.name}</h1>
          <p>
            Statut de votre fiche :{' '}
            <span className={`status-pill ${STATUS_CLASS[business.status]}`}>{STATUS_LABEL[business.status]}</span>
          </p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Modifier ma fiche
          </button>
        )}
      </div>

      {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

      {business.status === 'rejected' && business.rejection_reason && (
        <div className="callout amber" style={{ marginBottom: 24 }}>
          Votre fiche a été refusée. Motif : {business.rejection_reason}
        </div>
      )}

      {editing ? (
        <form className="card card-pad" onSubmit={handleSave} style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label>Nom de l&apos;entreprise</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Courriel</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Site web</label>
            <input className="form-control" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="callout amber" style={{ marginBottom: 18 }}>
            Si votre fiche est actuellement approuvée, l&apos;enregistrer la fera repasser en validation
            administrateur avant qu&apos;elle ne redevienne visible publiquement.
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? <span className="spinner" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="num">{messages.length}</div>
            <div className="lbl">Messages reçus</div>
            <div className="delta">{unreadCount} non lu{unreadCount === 1 ? '' : 's'}</div>
          </div>
          <div className="stat-card">
            <div className="num">{reviews.length}</div>
            <div className="lbl">Avis reçus</div>
            <div className="delta">{avgRating > 0 ? `Note moyenne ${avgRating.toFixed(1)}/5` : 'Aucun avis'}</div>
          </div>
          <div className="stat-card">
            <div className="num">{business.profile_type === 'registered' ? '49,99 $' : '69,99 $'}</div>
            <div className="lbl">Abonnement annuel (CAD)</div>
            <div className="delta">{business.payment_status === 'active' ? 'Actif' : 'Non actif'}</div>
          </div>
          <div className="stat-card">
            <div className="num">{STATUS_LABEL[business.status]}</div>
            <div className="lbl">Statut de la fiche</div>
          </div>
        </div>
      )}

      {!editing && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Message récent</th>
                <th>De</th>
                <th>Reçu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    Aucun message pour le moment.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="row-title">{m.sender_name || 'Membre'}</div>
                      <div className="row-sub">« {m.content.slice(0, 80)}{m.content.length > 80 ? '…' : ''} »</div>
                    </td>
                    <td>{m.sender_email}</td>
                    <td>{timeAgo(m.created_at)}</td>
                    <td>
                      <span className={`status-pill ${m.status === 'unread' ? 'status-pending' : 'status-active'}`}>
                        {m.status === 'unread' ? 'Non lu' : 'Lu'}
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
