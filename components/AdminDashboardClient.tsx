'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { Business } from '@/lib/types';
import {
  approveBusiness,
  deactivateBusiness,
  promoteToAdmin,
  reactivateBusiness,
  rejectBusiness,
} from '@/app/tableau-bord-admin/actions';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

export default function AdminDashboardClient({ pending, active }: { pending: Business[]; active: Business[] }) {
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Business | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deactivateTarget, setDeactivateTarget] = useState<Business | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleApprove(b: Business) {
    setBusyId(b.id);
    setFeedback(null);
    startTransition(async () => {
      const res = await approveBusiness(b.id);
      setBusyId(null);
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${b.name} » approuvée et publiée dans l'annuaire.` });
    });
  }

  function confirmReject() {
    if (!rejectTarget) return;
    const target = rejectTarget;
    setBusyId(target.id);
    startTransition(async () => {
      const res = await rejectBusiness(target.id, rejectReason);
      setBusyId(null);
      setRejectTarget(null);
      setRejectReason('');
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${target.name} » refusée.` });
    });
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    const target = deactivateTarget;
    setBusyId(target.id);
    startTransition(async () => {
      const res = await deactivateBusiness(target.id, deactivateReason);
      setBusyId(null);
      setDeactivateTarget(null);
      setDeactivateReason('');
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${target.name} » désactivée.` });
    });
  }

  function handleReactivate(b: Business) {
    setBusyId(b.id);
    startTransition(async () => {
      const res = await reactivateBusiness(b.id);
      setBusyId(null);
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${b.name} » réactivée.` });
    });
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await promoteToAdmin(adminEmail);
      if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      } else {
        setFeedback({ type: 'success', text: `${adminEmail} est maintenant administrateur.` });
        setAddAdminOpen(false);
        setAdminEmail('');
      }
    });
  }

  return (
    <main className="dash-main">
      <div className="dash-head">
        <div>
          <h1>Demandes en attente de validation</h1>
          <p>
            {pending.length} nouvelle{pending.length === 1 ? '' : 's'} fiche{pending.length === 1 ? '' : 's'} à
            examiner avant publication dans l&apos;annuaire.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => setAddAdminOpen(true)}>
          <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un administrateur
        </button>
      </div>

      {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Type de profil</th>
              <th>Soumis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Aucune fiche en attente.
                </td>
              </tr>
            ) : (
              pending.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="row-title">{b.name}</div>
                    <div className="row-sub">
                      {b.categories?.name_fr || 'Autres'} · {b.city || 'BC'}
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={
                        b.profile_type === 'registered'
                          ? { background: 'var(--green-bg)', color: 'var(--green)' }
                          : { background: 'var(--blue-100)', color: 'var(--blue-700)' }
                      }
                    >
                      {b.profile_type === 'registered' ? 'Entreprise enregistrée' : 'Prof. indépendant'}
                    </span>
                  </td>
                  <td>{timeAgo(b.created_at)}</td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/entreprises/${b.id}`} className="icon-btn" title="Voir la fiche">
                        <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(b)} disabled={busyId === b.id}>
                        {busyId === b.id ? <span className="spinner" /> : 'Approuver'}
                      </button>
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setRejectTarget(b)}>
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dash-head">
        <div>
          <h2 style={{ fontSize: 18, color: 'var(--blue-900)' }}>Entreprises actives</h2>
        </div>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Statut</th>
              <th>Abonnement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Aucune entreprise active pour le moment.
                </td>
              </tr>
            ) : (
              active.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="row-title">{b.name}</div>
                    <div className="row-sub">
                      {b.categories?.name_fr || 'Autres'} · {b.city || 'BC'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${b.status === 'approved' ? 'status-active' : 'status-rejected'}`}>
                      {b.status === 'approved' ? 'Publiée' : 'Désactivée'}
                    </span>
                  </td>
                  <td>
                    {b.payment_status === 'active' ? 'Actif' : 'Non actif'} ·{' '}
                    {b.profile_type === 'registered' ? '49,99 $/an' : '69,99 $/an'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/entreprises/${b.id}`} className="icon-btn" title="Voir la fiche">
                        <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      {b.status === 'approved' ? (
                        <button className="btn btn-danger-outline btn-sm" onClick={() => setDeactivateTarget(b)}>
                          Désactiver
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => handleReactivate(b)} disabled={busyId === b.id}>
                          {busyId === b.id ? <span className="spinner dark" /> : 'Réactiver'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rejectTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center' }}>Refuser « {rejectTarget.name} » ?</h3>
            <p style={{ textAlign: 'center' }}>Indiquez un motif — il sera visible par l&apos;entreprise dans son tableau de bord.</p>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Ex. document d'enregistrement illisible, merci de le soumettre à nouveau."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setRejectTarget(null)}>
                Annuler
              </button>
              <button className="btn btn-primary btn-block" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={confirmReject}>
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {deactivateTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3>Désactiver cette fiche ?</h3>
            <p>L&apos;entreprise ne sera plus visible dans l&apos;annuaire tant qu&apos;elle ne sera pas réactivée. Un courriel automatique sera envoyé au contact pour l&apos;informer.</p>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <textarea
                className="form-control"
                placeholder="Motif (facultatif)"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setDeactivateTarget(null)}>
                Annuler
              </button>
              <button className="btn btn-primary btn-block" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={confirmDeactivate}>
                Confirmer la désactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {addAdminOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 4 }}>Ajouter un administrateur</h3>
            <p style={{ textAlign: 'center' }}>
              La personne doit déjà avoir un compte Calvary Connect (gratuit) avec ce courriel.
            </p>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>Adresse courriel</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="collegue@exemple.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-block" onClick={() => setAddAdminOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Promouvoir administrateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
