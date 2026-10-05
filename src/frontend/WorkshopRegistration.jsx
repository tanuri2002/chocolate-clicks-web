import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorkshop, registerForWorkshop } from '../api';
import './WorkshopRegistration.css';

const initialForm = { fullName: '', email: '', phone: '', notes: '' };

export default function WorkshopRegistration() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWorkshop(id)
      .then((data) => { if (!cancelled) setWorkshop(data.workshop); })
      .catch((loadError) => { if (!cancelled) setError(loadError.message || 'Workshop not found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerForWorkshop(id, form);
      setComplete(true);
    } catch (submitError) {
      setError(submitError.message || 'Registration could not be saved.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="workshop-registration-page"><p>Loading workshop...</p></main>;
  if (!workshop) return <main className="workshop-registration-page"><p role="alert">{error || 'Workshop not found.'}</p><Link to="/mask-workshop">Back to workshops</Link></main>;

  return (
    <main className="workshop-registration-page">
      <Link className="workshop-registration-back" to="/mask-workshop">Back to workshops</Link>
      <section className="workshop-registration-layout">
        <img className="workshop-registration-banner" src={workshop.bannerUrl} alt={`${workshop.title} banner`} />
        <div className="workshop-registration-content">
          <p className="workshop-public-kicker">Workshop registration</p>
          <h1>{workshop.title}</h1>
          <p>{workshop.description}</p>
          <p className="workshop-registration-meta">{new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(workshop.date))}<br />{workshop.location}</p>
          {complete ? (
            <div className="workshop-registration-success" role="status">
              <h2>You’re registered</h2>
              <p>Your details have been saved for this workshop.</p>
              <Link to="/mask-workshop">Return to workshops</Link>
            </div>
          ) : (
            <form className="workshop-registration-form" onSubmit={handleSubmit}>
              {error && <p className="workshop-feedback workshop-feedback-error" role="alert">{error}</p>}
              <label>Full name<input required maxLength="120" autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
              <label>Email<input required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>Phone<input required type="tel" maxLength="30" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              <label>Notes (optional)<textarea maxLength="1000" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              <button className="workshop-primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Confirm registration'}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}