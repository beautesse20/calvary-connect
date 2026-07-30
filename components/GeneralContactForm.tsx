'use client';

import { useState, useTransition } from 'react';
import { sendContactMessage } from '@/app/contact/actions';
import { useLocale } from './LocaleProvider';

export default function GeneralContactForm() {
  const { dict } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(dict.contact.subjectGeneral);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await sendContactMessage({ name, email, subject, message });
      if (res.error) {
        setFeedback({ type: 'error', text: dict.contact.error });
      } else {
        setFeedback({ type: 'success', text: dict.contact.success });
        setName('');
        setEmail('');
        setMessage('');
      }
    });
  }

  return (
    <form className="card card-pad" onSubmit={handleSubmit}>
      {feedback && <div className={feedback.type === 'error' ? 'form-alert' : 'form-success'}>{feedback.text}</div>}
      <div className="form-group">
        <label>{dict.contact.fullName}</label>
        <input
          type="text"
          className="form-control"
          placeholder={dict.contact.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>{dict.auth.email}</label>
        <input
          type="email"
          className="form-control"
          placeholder={dict.contact.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>{dict.contact.subject}</label>
        <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option>{dict.contact.subjectGeneral}</option>
          <option>{dict.contact.subjectBusinessIssue}</option>
          <option>{dict.contact.subjectReport}</option>
          <option>{dict.contact.subjectSubscription}</option>
          <option>{dict.contact.subjectOther}</option>
        </select>
      </div>
      <div className="form-group">
        <label>{dict.contact.message}</label>
        <textarea
          className="form-control"
          style={{ minHeight: 130 }}
          placeholder={dict.contact.messagePlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
        {pending ? <span className="spinner" /> : dict.contact.send}
      </button>
    </form>
  );
}
