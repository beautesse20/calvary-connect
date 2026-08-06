'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  updateMyProfile,
  uploadAvatar,
  deleteMyReview,
  removeFavorite,
  deleteMyAccount,
} from '@/app/mon-compte/actions';
import { useLocale } from './LocaleProvider';
import { IconStarFilled } from './icons';

function splitName(fullName: string | null) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  business_id: string;
  businesses: { name: string } | null;
};

type MessageRow = {
  id: string;
  content: string;
  created_at: string;
  business_id: string | null;
  reply_content: string | null;
  replied_at: string | null;
  businesses: { name: string } | null;
};

type FavoriteRow = {
  id: string;
  business_id: string;
  created_at: string;
  businesses: { name: string; city: string | null; categories: { name_fr: string; name_en: string } | null } | null;
};

export default function MonCompteClient({
  fullName,
  email,
  phone,
  avatarUrl,
  emailNotifications,
  businessName,
  reviews,
  messages,
  favorites,
}: {
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailNotifications: boolean;
  businessName?: string | null;
  reviews: ReviewRow[];
  messages: MessageRow[];
  favorites: FavoriteRow[];
}) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const initial = splitName(fullName);
  const [firstName, setFirstName] = useState(initial.first);
  const [lastName, setLastName] = useState(initial.last);
  const [phoneValue, setPhoneValue] = useState(phone || '');
  const [notifOn, setNotifOn] = useState(emailNotifications);
  const [newPassword, setNewPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviewList, setReviewList] = useState(reviews);
  const [favoriteList, setFavoriteList] = useState(favorites);
  const [rowPending, setRowPending] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFeedback(null);
    try {
      const res = await updateMyProfile({
        fullName: `${firstName} ${lastName}`.trim(),
        phone: phoneValue.trim(),
        emailNotifications: notifOn,
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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    if (file.size > 8 * 1024 * 1024) {
      setAvatarError(dict.account.photoTooLarge);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarPending(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadAvatar(fd);
      if (res.error) {
        setAvatarError(res.error);
      } else if ('url' in res && res.url) {
        setAvatar(res.url);
      }
    } catch {
      setAvatarError(dict.account.photoUploadError);
    } finally {
      setAvatarPending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteReview(id: string) {
    setRowPending(id);
    try {
      const res = await deleteMyReview(id);
      if (!res.error) setReviewList((list) => list.filter((r) => r.id !== id));
    } finally {
      setRowPending(null);
    }
  }

  async function handleRemoveFavorite(businessId: string, rowId: string) {
    setRowPending(rowId);
    try {
      const res = await removeFavorite(businessId);
      if (!res.error) setFavoriteList((list) => list.filter((f) => f.id !== rowId));
    } finally {
      setRowPending(null);
    }
  }

  async function handleDeleteAccount() {
    setDeletePending(true);
    setDeleteError('');
    try {
      const res = await deleteMyAccount();
      if (res.error) {
        setDeleteError(res.error);
        setDeletePending(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setDeleteError(dict.account.deleteAccountError);
      setDeletePending(false);
    }
  }

  return (
    <div className="account-shell">
      <div className="card card-pad">
        <h1 className="account-card-title">{dict.account.title}</h1>
        <p className="account-card-lede">{dict.account.lede}</p>

        <form onSubmit={handleSubmit}>
          {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}

          <div className="account-avatar-row">
            <div className="account-avatar">
              {avatar ? <img src={avatar} alt="" /> : (firstName.charAt(0) || email.charAt(0) || '?').toUpperCase()}
            </div>
            <div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarPending}
              >
                {avatarPending ? <span className="spinner" /> : dict.account.changePhoto}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              {avatarError && (
                <div style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 6 }}>{avatarError}</div>
              )}
            </div>
          </div>

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
            <label>{dict.account.phone}</label>
            <input
              type="tel"
              className="form-control"
              placeholder={dict.account.phonePlaceholder}
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
            />
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

          <div className="toggle-row">
            <div className="toggle-copy">
              <strong>{dict.account.emailNotifications}</strong>
              <span>{dict.account.emailNotificationsHint}</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifOn} onChange={(e) => setNotifOn(e.target.checked)} />
              <span className="switch-slider" />
            </label>
          </div>

          {businessName && <div className="callout" style={{ marginBottom: 18 }}>{dict.account.businessNote}</div>}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
            {pending ? <span className="spinner" /> : dict.account.save}
          </button>
        </form>
      </div>

      <div className="card card-pad">
        <h2 className="account-card-title">{dict.account.myReviewsTitle}</h2>
        {reviewList.length === 0 && <p className="account-empty">{dict.account.noReviewsYet}</p>}
        {reviewList.map((r) => (
          <div className="account-list-item" key={r.id}>
            <div className="main">
              <span className="who">{r.businesses?.name || '—'}</span>
              <div className="stars" style={{ fontSize: 13 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStarFilled key={i} width={13} height={13} className={i < r.rating ? undefined : 'i-muted'} />
                ))}
              </div>
              {r.comment && <p>{r.comment}</p>}
              <span className="review-date">{formatDate(r.created_at)}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              title={dict.account.delete}
              onClick={() => handleDeleteReview(r.id)}
              disabled={rowPending === r.id}
            >
              {rowPending === r.id ? (
                <span className="spinner" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <h2 className="account-card-title">{dict.account.myMessagesTitle}</h2>
        {messages.length === 0 && <p className="account-empty">{dict.account.noMessagesYet}</p>}
        {messages.map((m) => (
          <div className="account-list-item" key={m.id}>
            <div className="main">
              <span className="who">{m.businesses?.name || '—'}</span>
              <p>{m.content}</p>
              <span className="review-date">{formatDate(m.created_at)}</span>
              {m.reply_content && (
                <div className="callout" style={{ marginTop: 10, background: 'var(--blue-50)', borderColor: 'var(--blue-100)' }}>
                  <strong style={{ display: 'block', fontSize: 12.5, marginBottom: 4 }}>{dict.account.replyFrom}</strong>
                  {m.reply_content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <h2 className="account-card-title">{dict.account.myFavoritesTitle}</h2>
        {favoriteList.length === 0 && <p className="account-empty">{dict.account.noFavoritesYet}</p>}
        {favoriteList.map((f) => {
          const catName = f.businesses?.categories
            ? locale === 'en'
              ? f.businesses.categories.name_en
              : f.businesses.categories.name_fr
            : null;
          return (
            <div className="account-list-item" key={f.id}>
              <div className="main">
                <span className="who">{f.businesses?.name || '—'}</span>
                <p>
                  {[catName, f.businesses?.city].filter(Boolean).join(' · ')}
                </p>
                <Link href={`/entreprises/${f.business_id}`} style={{ fontSize: 12.5, color: 'var(--blue-700)', fontWeight: 700 }}>
                  {dict.account.viewListing}
                </Link>
              </div>
              <button
                type="button"
                className="icon-btn"
                title={dict.account.remove}
                onClick={() => handleRemoveFavorite(f.business_id, f.id)}
                disabled={rowPending === f.id}
              >
                {rowPending === f.id ? (
                  <span className="spinner" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card card-pad danger-card">
        <h2 className="account-card-title">{dict.account.dangerZoneTitle}</h2>
        <p className="account-card-lede">{dict.account.deleteAccountText}</p>
        <button type="button" className="btn btn-danger-outline btn-block" onClick={() => setDeleteOpen(true)}>
          {dict.account.deleteAccount}
        </button>
      </div>

      {deleteOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3>{dict.account.deleteAccount}</h3>
            <p>{dict.account.deleteAccountText}</p>
            {deleteError && <div className="form-alert">{deleteError}</div>}
            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setDeleteOpen(false)} disabled={deletePending}>
                {dict.common.cancel}
              </button>
              <button
                className="btn btn-primary btn-block"
                style={{ background: 'var(--red)', boxShadow: 'none' }}
                onClick={handleDeleteAccount}
                disabled={deletePending}
              >
                {deletePending ? <span className="spinner" /> : dict.account.confirmDeleteAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
