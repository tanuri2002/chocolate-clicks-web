import { useEffect, useState } from 'react';
import { CalendarDays, Users, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import {
  createWorkshop,
  getAdminStats,
  getAdminWorkshops,
  getWorkshopRegistrations,
  updateWorkshopCapacity,
} from '../api';
import './Dashboard.css';

const emptyForm = { title: '', description: '', date: '', location: '', capacity: '' };

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export default function AdminDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [capacityValues, setCapacityValues] = useState({});
  const [customerCount, setCustomerCount] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [workshopData, stats] = await Promise.all([getAdminWorkshops(), getAdminStats()]);
      const items = workshopData.workshops || [];
      setWorkshops(items);
      setCapacityValues(Object.fromEntries(items.map((item) => [item._id, item.capacity ?? ''])));
      setCustomerCount(stats.registeredCustomerCount || 0);
    } catch (loadError) {
      setError(loadError.message || 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function handleCreate(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setNotice('');
    if (!banner) {
      setError('Choose a banner image for the workshop.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '') payload.append(key, key === 'date' ? new Date(value).toISOString() : value);
    });
    payload.append('banner', banner);

    setSaving(true);
    try {
      await createWorkshop(payload);
      setForm(emptyForm);
      setBanner(null);
      formElement.reset();
      setNotice('Workshop created.');
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message || 'Could not create the workshop.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegistrations(workshopId) {
    if (expandedId === workshopId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workshopId);
    setError('');
    try {
      const data = await getWorkshopRegistrations(workshopId);
      setRegistrations((current) => ({ ...current, [workshopId]: data.registrations || [] }));
    } catch (loadError) {
      setError(loadError.message || 'Could not load registrations.');
    }
  }

  async function saveCapacity(workshopId) {
    setError('');
    setNotice('');
    const input = capacityValues[workshopId];
    const capacity = input === '' ? null : Number(input);
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
      setError('Capacity must be a positive whole number, or blank for unlimited.');
      return;
    }
    try {
      await updateWorkshopCapacity(workshopId, capacity);
      setWorkshops((current) => current.map((workshop) => (
        workshop._id === workshopId ? { ...workshop, capacity } : workshop
      )));
      setNotice(capacity === null ? 'Workshop capacity is now unlimited.' : 'Workshop capacity updated.');
    } catch (saveError) {
      setError(saveError.message || 'Could not update workshop capacity.');
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <h1>Workshop administration</h1>
            <div className="dashboard-welcome">Manage workshops and attendee registrations</div>
          </div>
        </div>
      </header>

      <main className="dashboard-main workshop-admin-main">
        {error && <p className="workshop-feedback workshop-feedback-error" role="alert">{error}</p>}
        {notice && <p className="workshop-feedback workshop-feedback-success" role="status">{notice}</p>}

        <section className="admin-customer-count" aria-label="Registered customer count">
          <span className="admin-count-icon"><Users size={22} /></span>
          <span><strong>{customerCount}</strong><small>Registered customers</small></span>
        </section>

        <section className="admin-workshop-section">
          <h2 className="section-title">Add a workshop</h2>
          <form className="workshop-form" onSubmit={handleCreate}>
            <label>Workshop title<input required maxLength="120" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label>Date and time<input required type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
            <label>Location<input required maxLength="240" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
            <label>Capacity (optional)<input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label>
            <label className="workshop-form-wide">Description<textarea required maxLength="3000" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className="workshop-file-label workshop-form-wide">
              <Upload size={18} />
              <span>{banner ? banner.name : 'Choose banner image (max 5 MB)'}</span>
              <input required type="file" accept="image/*" onChange={(event) => setBanner(event.target.files?.[0] || null)} />
            </label>
            <button className="workshop-primary-button" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create workshop'}
            </button>
          </form>
        </section>

        <section className="admin-workshop-section">
          <div className="admin-section-heading">
            <h2 className="section-title">Workshops</h2>
            <button className="workshop-refresh-button" type="button" onClick={loadDashboard}>Refresh</button>
          </div>
          {loading ? <p>Loading workshops...</p> : workshops.length === 0 ? <p>No workshops have been added yet.</p> : (
            <div className="admin-workshop-list">
              {workshops.map((workshop) => (
                <article className="admin-workshop-item" key={workshop._id}>
                  <img src={workshop.bannerUrl} alt="" />
                  <div className="admin-workshop-info">
                    <h3>{workshop.title}</h3>
                    <p><CalendarDays size={15} /> {formatDate(workshop.date)} · {workshop.location}</p>
                    <p>{workshop.registrationCount || 0} registrations{workshop.capacity ? ` · capacity ${workshop.capacity}` : ' · unlimited capacity'}</p>
                    <form className="workshop-capacity-form" onSubmit={(event) => { event.preventDefault(); saveCapacity(workshop._id); }}>
                      <label htmlFor={`capacity-${workshop._id}`}>Capacity</label>
                      <input
                        id={`capacity-${workshop._id}`}
                        type="number"
                        min={Math.max(1, workshop.registrationCount || 0)}
                        placeholder="Unlimited"
                        value={capacityValues[workshop._id] ?? ''}
                        onChange={(event) => setCapacityValues((current) => ({ ...current, [workshop._id]: event.target.value }))}
                      />
                      <button type="submit">Save limit</button>
                    </form>
                  </div>
                  <button className="workshop-details-button" type="button" onClick={() => toggleRegistrations(workshop._id)}>
                    {expandedId === workshop._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedId === workshop._id ? 'Hide details' : 'View registrations'}
                  </button>
                  {expandedId === workshop._id && (
                    <div className="workshop-registration-list">
                      {(registrations[workshop._id] || []).length === 0 ? <p>No registrations yet.</p> : (
                        <div className="workshop-table-wrap">
                          <table className="workshop-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Notes</th><th>Registered</th></tr></thead>
                            <tbody>{registrations[workshop._id].map((registration) => (
                              <tr key={registration._id}>
                                <td>{registration.fullName}</td><td>{registration.email}</td><td>{registration.phone}</td><td>{registration.notes || 'None'}</td><td>{formatDate(registration.createdAt)}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}