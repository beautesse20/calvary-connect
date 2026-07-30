'use client';

import { useState } from 'react';
import { updateMyProfile } from '@/app/mon-compte/actions';
import { useLocale } from './LocaleProvider';

function splitName(fullName: string | null) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export default function MonCompteClient({
  fullName,
  email,
  businessName,
}: {
  fullName: string | null;
  email: string;
  businessName?: string | null;
}) {
  const { dict } = useLocale();
  const initial = splitName(fullName);
  const [firstName, setFirstName] = useState(initial.first);
  const [lastName, setLastName] = useState(initial.last);
  const [newPassword, setNewPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFeedback(null);
    try {
      const res = await updateMyProfile({
        fullName: `${firstName} ${lastName}`.trim(),
        newPassword: newPassword || undefined,
      });
      if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      } else {
        setFeedback({ type: 'success', text: dict.account.updated });
        setNewPassword('');
      }
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
        <h1>{dict.account.title}</h1>
        <p className="sub">{dict.account.lede}</p>

        <form onSubmit={handleSubmit}>
          {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>{dict.account.firstName}</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{dict.account.lastName}</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{dict.account.email}</label>
            <input type="email" className="form-control" value={email} disabled />
            <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>{dict.account.emailNote}</span>
          </div>

          <div className="form-group">
            <label>{dict.account.newPassword}</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>{dict.account.newPasswordHint}</span>
          </div>

          {businessName && (
            <div className="callout" style={{ marginBottom: 18 }}>
              {dict.account.businessNote}
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
            {pending ? <span className="spinner" /> : dict.account.save}
          </button>
        </form>
      </div>
    </div>
  );
}
