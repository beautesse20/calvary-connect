'use client';

import { useState, useTransition } from 'react';
import { sendContactMessage } from '@/app/contact/actions';

export default function GeneralContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Question générale');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await sendContactMessage({ name, email, subject, message });
      if (res.error) {
        setFeedback({ type: 'error', text: "Une erreur est survenue. Réessayez ou écrivez à contact@calvaryconnect.ca." });
      } else {
        setFeedback({ type: 'success', text: 'Merci ! Votre message a bien été envoyé, réponse sous 24h maximum.' });
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
        <label>Nom complet</label>
        <input
          type="text"
          className="form-control"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Adresse courriel</label>
        <input
          type="email"
          className="form-control"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Sujet</label>
        <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option>Question générale</option>
          <option>Problème avec une fiche entreprise</option>
          <option>Signalement d&apos;un avis</option>
          <option>Question sur mon abonnement</option>
          <option>Autre</option>
        </select>
      </div>
      <div className="form-group">
        <label>Message</label>
        <textarea
          className="form-control"
          style={{ minHeight: 130 }}
          placeholder="Comment pouvons-nous vous aider ?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
        {pending ? <span className="spinner" /> : 'Envoyer le message'}
      </button>
    </form>
  );
}
