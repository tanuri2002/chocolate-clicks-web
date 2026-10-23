import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Upload,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Trash2,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  createWorkshop,
  getAdminStats,
  getAdminWorkshops,
  getWorkshopRegistrations,
  updateWorkshopCapacity,
  getEventCategories,
  createEventCategory,
  deleteEventCategory,
} from '../api';
import './Dashboard.css';

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: '',
  category: 'Sri Lankan Wes Mask Painting',
};

const emptyCategoryForm = {
  name: '',
  priceInfo: '',
  description: '',
};

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export default function AdminDashboard() {
  const location = useLocation();
  const isNestedInLayout = location.pathname.startsWith('/dashboard');

  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // Category management state
  const [newCategory, setNewCategory] = useState(emptyCategoryForm);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryNotice, setCategoryNotice] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [workshopData, stats, categoryData] = await Promise.all([
        getAdminWorkshops(),
        getAdminStats(),
        getEventCategories(),
      ]);

      const items = workshopData.workshops || [];
      const cats = categoryData.categories || [];

      setWorkshops(items);
      setCategories(cats);
      setCapacityValues(Object.fromEntries(items.map((item) => [item._id, item.capacity ?? ''])));
      setCustomerCount(stats.registeredCustomerCount || 0);

      // Ensure form has a default category from loaded categories
      if (cats.length > 0) {
        setForm((prev) => ({
          ...prev,
          category: prev.category || cats[0].name,
        }));
      }
    } catch (loadError) {
      setError(loadError.message || 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCreateWorkshop(event) {
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
      if (value !== '') {
        payload.append(key, key === 'date' ? new Date(value).toISOString() : value);
      }
    });
    payload.append('banner', banner);

    setSaving(true);
    try {
      await createWorkshop(payload);
      setForm({
        ...emptyForm,
        category: categories[0]?.name || 'Sri Lankan Wes Mask Painting',
      });
      setBanner(null);
      formElement.reset();
      setNotice('Workshop created successfully!');
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message || 'Could not create the workshop.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory(event) {
    event.preventDefault();
    setCategoryError('');
    setCategoryNotice('');

    if (!newCategory.name.trim()) {
      setCategoryError('Category name is required.');
      return;
    }

    setCategorySaving(true);
    try {
      const res = await createEventCategory(newCategory);
      setNewCategory(emptyCategoryForm);
      setCategoryNotice(`Category "${res.category.name}" added successfully!`);
      // Update local categories list
      const updatedCats = [...categories, res.category];
      setCategories(updatedCats);
      // Select the newly added category in the form
      setForm((prev) => ({ ...prev, category: res.category.name }));
    } catch (catError) {
      setCategoryError(catError.message || 'Failed to add category.');
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleDeleteCategory(id, name) {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    setCategoryError('');
    setCategoryNotice('');
    try {
      await deleteEventCategory(id);
      const updated = categories.filter((c) => c._id !== id);
      setCategories(updated);
      setCategoryNotice(`Category "${name}" deleted.`);
      if (form.category === name && updated.length > 0) {
        setForm((prev) => ({ ...prev, category: updated[0].name }));
      }
    } catch (delError) {
      setCategoryError(delError.message || 'Failed to delete category.');
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
      setWorkshops((current) =>
        current.map((workshop) => (workshop._id === workshopId ? { ...workshop, capacity } : workshop))
      );
      setNotice(capacity === null ? 'Workshop capacity is now unlimited.' : 'Workshop capacity updated.');
    } catch (saveError) {
      setError(saveError.message || 'Could not update workshop capacity.');
    }
  }

  const filteredWorkshops = workshops.filter((ws) => {
    if (filterCategory === 'all') return true;
    return (ws.category || 'Sri Lankan Wes Mask Painting') === filterCategory;
  });

  return (
    <div className={`dashboard-page ${isNestedInLayout ? 'nested-dashboard' : ''}`}>
      {!isNestedInLayout && (
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <div>
              <h1>Event & Workshop Administration</h1>
              <div className="dashboard-welcome">Manage event schedules, categories, and registrations</div>
            </div>
          </div>
        </header>
      )}

      <main className="dashboard-main workshop-admin-main">
        {error && <p className="workshop-feedback workshop-feedback-error" role="alert">{error}</p>}
        {notice && <p className="workshop-feedback workshop-feedback-success" role="status">{notice}</p>}

        <section className="admin-customer-count" aria-label="Registered customer count">
          <span className="admin-count-icon"><Users size={22} /></span>
          <span><strong>{customerCount}</strong><small>Registered customers</small></span>
        </section>

        {/* ── Category Management Section ── */}
        <section className="admin-workshop-section admin-category-management">
          <div className="admin-section-heading">
            <h2 className="section-title">
              <Tag size={20} className="section-title-icon" />
              Event Categories ({categories.length})
            </h2>
          </div>

          <p className="admin-section-sub">
            These categories are available in the event creation dropdown and help organize events on the website.
          </p>

          {categoryError && <p className="workshop-feedback workshop-feedback-error" role="alert">{categoryError}</p>}
          {categoryNotice && <p className="workshop-feedback workshop-feedback-success" role="status">{categoryNotice}</p>}

          {/* Form to add a new category */}
          <form className="admin-category-form" onSubmit={handleAddCategory}>
            <div className="admin-cat-input-group">
              <label>
                Category Name *
                <input
                  required
                  placeholder="e.g. Tote Bag Painting, Bake It Happen..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </label>
              <label>
                Price Info (optional)
                <input
                  placeholder="e.g. LKR 4,000/- PER PERSON"
                  value={newCategory.priceInfo}
                  onChange={(e) => setNewCategory({ ...newCategory, priceInfo: e.target.value })}
                />
              </label>
              <label className="admin-cat-desc-label">
                Description (optional)
                <input
                  placeholder="Short note or description for this event type"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </label>
            </div>
            <button className="workshop-primary-button admin-cat-submit" type="submit" disabled={categorySaving}>
              <Plus size={16} />
              {categorySaving ? 'Adding...' : 'Add New Category'}
            </button>
          </form>

          {/* Existing Categories Badges / Grid */}
          <div className="admin-categories-chips">
            {categories.map((cat) => (
              <div className="admin-cat-chip" key={cat._id || cat.name}>
                <div className="admin-cat-chip-info">
                  <span className="admin-cat-chip-name">{cat.name}</span>
                  {cat.priceInfo && <span className="admin-cat-chip-price">{cat.priceInfo}</span>}
                </div>
                {/* Allow deleting custom category */}
                {cat._id && (
                  <button
                    type="button"
                    className="admin-cat-delete-btn"
                    title={`Delete "${cat.name}" category`}
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Add a Workshop / Event Form ── */}
        <section className="admin-workshop-section">
          <div className="admin-section-heading">
            <h2 className="section-title">
              <CalendarDays size={20} className="section-title-icon" />
              Add an Event / Workshop
            </h2>
          </div>

          <form className="workshop-form" onSubmit={handleCreateWorkshop}>
            {/* Event Category Dropdown */}
            <label>
              Event Category *
              <select
                required
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="workshop-select"
              >
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name} {cat.priceInfo ? `· (${cat.priceInfo})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Event / Workshop Title *
              <input
                required
                maxLength="120"
                placeholder="e.g. Masterclass Edition 3"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </label>

            <label>
              Date and Time *
              <input
                required
                type="datetime-local"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>

            <label>
              Location *
              <input
                required
                maxLength="240"
                placeholder="e.g. Chocolate Clicks Studio, Colombo"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>

            <label>
              Capacity (optional limit)
              <input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              />
            </label>

            <label className="workshop-form-wide">
              Description *
              <textarea
                required
                maxLength="3000"
                rows="4"
                placeholder="Provide event details, what attendees get, requirements..."
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>

            <label className="workshop-file-label workshop-form-wide">
              <Upload size={18} />
              <span>{banner ? banner.name : 'Choose banner image (max 5 MB)'}</span>
              <input
                required
                type="file"
                accept="image/*"
                onChange={(event) => setBanner(event.target.files?.[0] || null)}
              />
            </label>

            <button className="workshop-primary-button" type="submit" disabled={saving}>
              {saving ? 'Creating Event...' : 'Publish Event'}
            </button>
          </form>
        </section>

        {/* ── Workshops List Section ── */}
        <section className="admin-workshop-section">
          <div className="admin-section-heading">
            <h2 className="section-title">
              <Layers size={20} className="section-title-icon" />
              Scheduled Workshops &amp; Events ({workshops.length})
            </h2>
            <button className="workshop-refresh-button" type="button" onClick={loadDashboard}>
              Refresh
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="admin-filter-bar">
            <button
              type="button"
              className={`admin-filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All Events ({workshops.length})
            </button>
            {categories.map((cat) => {
              const count = workshops.filter(
                (w) => (w.category || 'Sri Lankan Wes Mask Painting') === cat.name
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.name}
                  type="button"
                  className={`admin-filter-btn ${filterCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat.name)}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <p>Loading workshops...</p>
          ) : filteredWorkshops.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', padding: '1rem 0' }}>
              No workshops found for this selection.
            </p>
          ) : (
            <div className="admin-workshop-list">
              {filteredWorkshops.map((workshop) => (
                <article className="admin-workshop-item" key={workshop._id}>
                  <img src={workshop.bannerUrl} alt="" />
                  <div className="admin-workshop-info">
                    <span className="admin-event-category-badge">
                      {workshop.category || 'Sri Lankan Wes Mask Painting'}
                    </span>
                    <h3>{workshop.title}</h3>
                    <p>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {formatDate(workshop.date)} · <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {workshop.location}
                    </p>
                    <p>
                      <strong>{workshop.registrationCount || 0}</strong> registrations
                      {workshop.capacity ? ` · capacity ${workshop.capacity}` : ' · unlimited capacity'}
                    </p>

                    <form
                      className="workshop-capacity-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        saveCapacity(workshop._id);
                      }}
                    >
                      <label htmlFor={`capacity-${workshop._id}`}>Limit</label>
                      <input
                        id={`capacity-${workshop._id}`}
                        type="number"
                        min={Math.max(1, workshop.registrationCount || 0)}
                        placeholder="Unlimited"
                        value={capacityValues[workshop._id] ?? ''}
                        onChange={(event) =>
                          setCapacityValues((current) => ({
                            ...current,
                            [workshop._id]: event.target.value,
                          }))
                        }
                      />
                      <button type="submit">Save</button>
                    </form>
                  </div>

                  <button
                    className="workshop-details-button"
                    type="button"
                    onClick={() => toggleRegistrations(workshop._id)}
                  >
                    {expandedId === workshop._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedId === workshop._id ? 'Hide attendees' : 'View attendees'}
                  </button>

                  {expandedId === workshop._id && (
                    <div className="workshop-registration-list">
                      {(registrations[workshop._id] || []).length === 0 ? (
                        <p style={{ color: '#888', padding: '10px 0' }}>No registrations yet.</p>
                      ) : (
                        <div className="workshop-table-wrap">
                          <table className="workshop-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Notes</th>
                                <th>Registered</th>
                              </tr>
                            </thead>
                            <tbody>
                              {registrations[workshop._id].map((registration) => (
                                <tr key={registration._id}>
                                  <td>{registration.fullName}</td>
                                  <td>{registration.email}</td>
                                  <td>{registration.phone}</td>
                                  <td>{registration.notes || 'None'}</td>
                                  <td>{formatDate(registration.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
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