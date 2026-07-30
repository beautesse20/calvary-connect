'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/app/entreprises/[id]/actions';
import { IconStarFilled } from './icons';

export default function ReviewForm({ businessId }: { businessId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await submitReview(businessId, rating, comment);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Merci, votre avis a été publié.' });
        setComment('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card card-pad" style={{ marginTop: 18 }}>
      <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 10 }}>Laisser un avis</strong>
      {message && <div className={message.type === 'error' ? 'form-alert' : 'form-success'}>{message.text}</div>}
      <div className="rating-input" style={{ marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= rating ? 'filled' : ''} onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
            <IconStarFilled width={22} height={22} />
          </button>
        ))}
      </div>
      <div className="form-group">
        <textarea
          className="form-control"
          placeholder="Décrivez votre expérience avec cette entreprise..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? <span className="spinner" /> : 'Publier mon avis'}
      </button>
    </form>
  );
}
