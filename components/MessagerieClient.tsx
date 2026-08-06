'use client';

import { useState } from 'react';
import type { Business, Message } from '@/lib/types';
import { markMessageRead, replyToMessage } from '@/app/tableau-bord-entreprise/actions';
import { useLocale } from './LocaleProvider';

function formatDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === 'en' ? 'en-CA' : 'fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagerieClient({ business, messages }: { business: Business; messages: Message[] }) {
  const { dict, locale } = useLocale();
  const [list, setList] = useState(messages);
  const [target, setTarget] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function openMessage(m: Message) {
    setTarget(m);
    setReplyText('');
    setError('');
    if (m.status === 'unread') {
      setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: 'read' } : x)));
      await markMessageRead(m.id);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setPending(true);
    setError('');
    const res = await replyToMessage(target.id, replyText);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const replied_at = new Date().toISOString();
    const updated = { ...target, reply_content: replyText.trim(), replied_at, status: 'read' as const };
    setTarget(updated);
    setList((prev) => prev.map((x) => (x.id === target.id ? updated : x)));
    setReplyText('');
  }

  return (
    <main className="dash-main">
      <div className="dash-head">
        <div>
          <h1>{dict.dashboardBusiness.sidebarMessages}</h1>
          <p>
            {business.name} · {list.length} {dict.dashboardBusiness.messagesReceived.toLowerCase()}
          </p>
        </div>
      </div>

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
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  {dict.dashboardBusiness.noMessages}
                </td>
              </tr>
            ) : (
              list.map((m) => (
                <tr key={m.id} onClick={() => openMessage(m)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="row-title">{m.sender_name || (locale === 'en' ? 'Member' : 'Membre')}</div>
                    <div className="row-sub">
                      « {m.content.slice(0, 80)}
                      {m.content.length > 80 ? '…' : ''} »
                    </div>
                  </td>
                  <td>{m.sender_email}</td>
                  <td>{formatDateTime(m.created_at, locale)}</td>
                  <td>
                    <span className={`status-pill ${m.status === 'unread' ? 'status-pending' : 'status-active'}`}>
                      {m.reply_content
                        ? dict.dashboardBusiness.repliedLabel
                        : m.status === 'unread'
                        ? dict.dashboardBusiness.unreadLabel
                        : dict.dashboardBusiness.read}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {target && (
        <div className="modal-overlay" onClick={() => setTarget(null)}>
          <div className="modal-box" style={{ textAlign: 'left', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{target.sender_name || (locale === 'en' ? 'Member' : 'Membre')}</h3>
            <p style={{ fontSize: 12.5, color: 'var(--muted-2)', marginBottom: 16 }}>
              {target.sender_email} · {formatDateTime(target.created_at, locale)}
            </p>

            <div className="callout" style={{ marginBottom: 16 }}>{target.content}</div>

            {target.reply_content && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {dict.dashboardBusiness.yourReply}
                </label>
                <div className="callout" style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-100)' }}>
                  {target.reply_content}
                </div>
                {target.replied_at && (
                  <span className="review-date">{formatDateTime(target.replied_at, locale)}</span>
                )}
              </div>
            )}

            <form onSubmit={handleReply}>
              {error && <div className="form-alert">{error}</div>}
              <div className="form-group">
                <label>{target.reply_content ? dict.dashboardBusiness.editReply : dict.dashboardBusiness.writeReply}</label>
                <textarea
                  className="form-control"
                  placeholder={dict.dashboardBusiness.replyPlaceholder}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-block" onClick={() => setTarget(null)}>
                  {dict.common.cancel}
                </button>
                <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
                  {pending ? <span className="spinner" /> : dict.dashboardBusiness.sendReply}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
