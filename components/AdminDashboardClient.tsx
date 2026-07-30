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
import { useLocale } from './LocaleProvider';

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

export default function AdminDashboardClient({ pending, active }: { pending: Business[]; active: Business[] }) {
  const { dict, locale } = useLocale();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Business | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deactivateTarget, setDeactivateTarget] = useState<Business | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function categoryName(b: Business) {
    if (!b.categories) return dict.dashboardAdmin.other;
    return locale === 'en' ? b.categories.name_en : b.categories.name_fr;
  }

  function handleApprove(b: Business) {
    setBusyId(b.id);
    setFeedback(null);
    startTransition(async () => {
      const res = await approveBusiness(b.id);
      setBusyId(null);
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${b.name} » ${dict.dashboardAdmin.approvedFeedback}` });
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
      else setFeedback({ type: 'success', text: `« ${target.name} » ${dict.dashboardAdmin.rejectedFeedback}` });
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
      else setFeedback({ type: 'success', text: `« ${target.name} » ${dict.dashboardAdmin.deactivatedFeedback}` });
    });
  }

  function handleReactivate(b: Business) {
    setBusyId(b.id);
    startTransition(async () => {
      const res = await reactivateBusiness(b.id);
      setBusyId(null);
      if (res.error) setFeedback({ type: 'error', text: res.error });
      else setFeedback({ type: 'success', text: `« ${b.name} » ${dict.dashboardAdmin.reactivatedFeedback}` });
    });
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await promoteToAdmin(adminEmail);
      if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      } else {
        setFeedback({ type: 'success', text: `${adminEmail} ${dict.dashboardAdmin.adminPromotedFeedback}` });
        setAddAdminOpen(false);
        setAdminEmail('');
      }
    });
  }

  return (
    <main className="dash-main">
      <div className="dash-head">
        <div>
          <h1>{dict.dashboardAdmin.pendingTitle}</h1>
          <p>
            {pending.length} {dict.dashboardAdmin.pendingSub}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => setAddAdminOpen(true)}>
          <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {dict.dashboardAdmin.addAdmin}
        </button>
      </div>

      {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>{dict.dashboardAdmin.business}</th>
              <th>{dict.dashboardAdmin.profileType}</th>
              <th>{dict.dashboardAdmin.submitted}</th>
              <th>{dict.dashboardAdmin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  {dict.dashboardAdmin.noPending}
                </td>
              </tr>
            ) : (
              pending.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="row-title">{b.name}</div>
                    <div className="row-sub">
                      {categoryName(b)} · {b.city || 'BC'}
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
                      {b.profile_type === 'registered' ? dict.business.registered : dict.business.independent}
                    </span>
                  </td>
                  <td>{timeAgo(b.created_at, locale)}</td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/entreprises/${b.id}`} className="icon-btn" title={dict.dashboardAdmin.viewListing}>
                        <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(b)} disabled={busyId === b.id}>
                        {busyId === b.id ? <span className="spinner" /> : dict.dashboardAdmin.approve}
                      </button>
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setRejectTarget(b)}>
                        {dict.dashboardAdmin.reject}
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
          <h2 style={{ fontSize: 18, color: 'var(--blue-900)' }}>{dict.dashboardAdmin.activeBusinesses}</h2>
        </div>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>{dict.dashboardAdmin.business}</th>
              <th>{dict.dashboardAdmin.status}</th>
              <th>{dict.dashboardAdmin.subscription}</th>
              <th>{dict.dashboardAdmin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  {dict.dashboardAdmin.noActive}
                </td>
              </tr>
            ) : (
              active.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="row-title">{b.name}</div>
                    <div className="row-sub">
                      {categoryName(b)} · {b.city || 'BC'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${b.status === 'approved' ? 'status-active' : 'status-rejected'}`}>
                      {b.status === 'approved' ? dict.dashboardAdmin.published : dict.dashboardAdmin.deactivated}
                    </span>
                  </td>
                  <td>
                    {b.payment_status === 'active' ? dict.dashboardBusiness.active : dict.dashboardBusiness.inactive} ·{' '}
                    {b.profile_type === 'registered' ? `49,99 $/${locale === 'en' ? 'yr' : 'an'}` : `69,99 $/${locale === 'en' ? 'yr' : 'an'}`}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/entreprises/${b.id}`} className="icon-btn" title={dict.dashboardAdmin.viewListing}>
                        <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      {b.status === 'approved' ? (
                        <button className="btn btn-danger-outline btn-sm" onClick={() => setDeactivateTarget(b)}>
                          {dict.dashboardAdmin.deactivate}
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => handleReactivate(b)} disabled={busyId === b.id}>
                          {busyId === b.id ? <span className="spinner dark" /> : dict.dashboardAdmin.reactivate}
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
            <h3 style={{ textAlign: 'center' }}>
              {dict.dashboardAdmin.rejectTitle} « {rejectTarget.name} » ?
            </h3>
            <p style={{ textAlign: 'center' }}>{dict.dashboardAdmin.rejectText}</p>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder={dict.dashboardAdmin.rejectPlaceholder}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setRejectTarget(null)}>
                {dict.common.cancel}
              </button>
              <button className="btn btn-primary btn-block" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={confirmReject}>
                {dict.dashboardAdmin.confirmReject}
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
            <h3>{dict.dashboardAdmin.deactivateTitle}</h3>
            <p>{dict.dashboardAdmin.deactivateText}</p>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <textarea
                className="form-control"
                placeholder={dict.dashboardAdmin.deactivateReasonPlaceholder}
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setDeactivateTarget(null)}>
                {dict.common.cancel}
              </button>
              <button className="btn btn-primary btn-block" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={confirmDeactivate}>
                {dict.dashboardAdmin.confirmDeactivate}
              </button>
            </div>
          </div>
        </div>
      )}

      {addAdminOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 4 }}>{dict.dashboardAdmin.addAdminTitle}</h3>
            <p style={{ textAlign: 'center' }}>{dict.dashboardAdmin.addAdminText}</p>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>{dict.dashboardAdmin.emailLabel}</label>
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
                  {dict.common.cancel}
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  {dict.dashboardAdmin.promote}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
