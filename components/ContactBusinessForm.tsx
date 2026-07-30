'use client';

import { useState, useTransition } from 'react';
import { sendBusinessMessage } from '@/app/entreprises/[id]/actions';
import { useLocale } from './LocaleProvider';

export default function ContactBusinessForm({ businessId }: { businessId: string }) {
  const { dict } = useLocale();
  const [content, setContent] = useState('');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await sendBusinessMessage(businessId, content);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: dict.business.messageSuccess });
        setContent('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {message && <div className={message.type === 'error' ? 'form-alert' : 'form-success'}>{message.text}</div>}
      <div className="form-group">
        <textarea
          className="form-control"
          placeholder={dict.business.messagePlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary btn-block btn-sm" type="submit" disabled={pending}>
        {pending ? <span className="spinner" /> : dict.business.sendMessage}
      </button>
    </form>
  );
}
