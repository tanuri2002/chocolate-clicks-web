// src/frontend/EventsManagement.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  Users,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  History,
  CalendarCheck,
  Search,
  Download,
  Phone,
  Mail,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  getEvents,
  createEvent,
  updateEvent,
  updateEventSlots,
  deleteEvent,
  getEventCategories,
  getWorkshopRegistrations,
  deleteWorkshopRegistration,
} from '../api';
import './EventsManagement.css';
import './Dashboard.css';

const DEFAULT_CATEGORIES = [
  'Sri Lankan Wes Mask Painting',
  'Bake It Happen',
];

const INITIAL_FORM = {
  title: '',
  category: 'Mask Painting',
  customCategory: '',
  date: '',
  time: '10:00',
  venue: 'Chocolate Clicks Studio, Colombo',
  availableSlots: 20,
  description: '',
};

/**
 * Format date in Asia/Colombo timezone
 */
function formatEventDate(dateString) {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/**
 * Format time in Asia/Colombo timezone
 */
function formatEventTime(dateString, timeField) {
  if (timeField) return timeField;
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString));
  } catch {
    return '';
  }
}

/**
 * Convert Date object to "YYYY-MM-DD" for HTML date input in Colombo time
 */
function toDateInputValue(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  // Format YYYY-MM-DD in Asia/Colombo
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    return parts;
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/**
 * Convert Date object to "HH:mm" for HTML time input
 */
function toTimeInputValue(dateString, timeField) {
  if (timeField && /^\d{2}:\d{2}$/.test(timeField)) return timeField;
  if (!dateString) return '10:00';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '10:00';
  try {
    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return timeStr;
  } catch {
    return '10:00';
  }
}

export default function EventsManagement() {
  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'add'

  // Global alerts
  const [alertError, setAlertError] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  // Add Form state
  const [addForm, setAddForm] = useState(INITIAL_FORM);
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');
  const addFileInputRef = useRef(null);

  // Edit Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_FORM);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const editFileInputRef = useRef(null);

  // Inline slot stepper local changes & saving status
  const [slotValues, setSlotValues] = useState({});
  const [slotSavingId, setSlotSavingId] = useState(null);
  const [slotSavedId, setSlotSavedId] = useState(null);

  // Registered Attendees state
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [deletingRegId, setDeletingRegId] = useState(null);
  const [regError, setRegError] = useState('');

  // Load workshops and categories
  async function loadData() {
    setLoading(true);
    setAlertError('');
    try {
      const [eventsRes, catRes] = await Promise.all([
        getEvents('all'),
        getEventCategories().catch(() => ({ categories: [] })),
      ]);

      const items = eventsRes.events || eventsRes.workshops || [];
      setWorkshops(items);

      // Initialize slot input values
      const initialSlots = {};
      items.forEach((item) => {
        initialSlots[item._id] =
          item.availableSlots !== undefined ? item.availableSlots : item.capacity ?? 20;
      });
      setSlotValues(initialSlots);

      // Merge backend categories with defaults
      const loadedCats = (catRes.categories || []).map((c) => c.name);
      const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...loadedCats]));
      setCategories(combined);
    } catch (err) {
      console.error('Failed to load events:', err);
      setAlertError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute Upcoming vs Past workshops dynamically based on Date.now()
  const now = new Date();
  const upcomingWorkshops = useMemo(() => {
    return workshops
      .filter((w) => new Date(w.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // soonest first
  }, [workshops, now]);

  const pastWorkshops = useMemo(() => {
    return workshops
      .filter((w) => new Date(w.date) < now)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // most recent first
  }, [workshops, now]);

  // Total registrations across all workshops
  const totalRegistrationsCount = useMemo(() => {
    return workshops.reduce((sum, w) => sum + (w.registrationCount || 0), 0);
  }, [workshops]);

  // Selected workshop object for details card
  const currentSelectedWorkshop = useMemo(() => {
    return workshops.find((w) => w._id === selectedWorkshopId) || null;
  }, [workshops, selectedWorkshopId]);

  // Load registrations for selected workshop
  async function loadRegistrations(workshopId) {
    if (!workshopId) {
      setRegistrations([]);
      return;
    }
    setLoadingRegistrations(true);
    setRegError('');
    try {
      const res = await getWorkshopRegistrations(workshopId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      setRegError(err.message || 'Failed to load attendees.');
    } finally {
      setLoadingRegistrations(false);
    }
  }

  // When switching to registrations tab or selecting a workshop from dropdown
  useEffect(() => {
    if (activeTab === 'registrations' && selectedWorkshopId) {
      loadRegistrations(selectedWorkshopId);
    }
  }, [activeTab, selectedWorkshopId]);

  // Auto-select first workshop if none selected yet
  useEffect(() => {
    if (activeTab === 'registrations' && !selectedWorkshopId && workshops.length > 0) {
      setSelectedWorkshopId(workshops[0]._id);
    }
  }, [activeTab, selectedWorkshopId, workshops]);

  // Direct click from any workshop card
  function handleViewRegistrations(workshopId) {
    setSelectedWorkshopId(workshopId);
    setActiveTab('registrations');
  }

  // Delete / cancel an attendee registration
  async function handleDeleteRegistration(reg) {
    const confirmMsg = `Are you sure you want to cancel the registration for ${reg.fullName} (${reg.email})?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingRegId(reg._id);
    try {
      await deleteWorkshopRegistration(reg._id);
      setRegistrations((prev) => prev.filter((r) => r._id !== reg._id));
      setAlertSuccess(`Registration for ${reg.fullName} was cancelled.`);
      setWorkshops((prev) =>
        prev.map((w) =>
          w._id === selectedWorkshopId
            ? { ...w, registrationCount: Math.max(0, (w.registrationCount || 1) - 1) }
            : w
        )
      );
    } catch (err) {
      console.error('Failed to delete registration:', err);
      setAlertError(err.message || 'Failed to cancel registration.');
    } finally {
      setDeletingRegId(null);
    }
  }

  // Export attendees to CSV
  function exportAttendeesToCsv() {
    if (!currentSelectedWorkshop || registrations.length === 0) return;
    const headers = ['#', 'Full Name', 'Email', 'Phone', 'Registration Date', 'Notes'];
    const rows = registrations.map((r, idx) => [
      idx + 1,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `attendees_${(currentSelectedWorkshop.title || 'workshop').replace(/[^a-zA-Z0-9]/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filtered registrations by search query
  const filteredRegistrations = useMemo(() => {
    if (!regSearchTerm.trim()) return registrations;
    const term = regSearchTerm.toLowerCase();
    return registrations.filter(
      (r) =>
        (r.fullName && r.fullName.toLowerCase().includes(term)) ||
        (r.email && r.email.toLowerCase().includes(term)) ||
        (r.phone && r.phone.toLowerCase().includes(term)) ||
        (r.notes && r.notes.toLowerCase().includes(term))
    );
  }, [registrations, regSearchTerm]);

  // Handle inline slots stepper change
  function handleSlotStep(id, delta) {
    setSlotValues((prev) => {
      const current = prev[id] !== undefined ? Number(prev[id]) : 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleSlotInputChange(id, value) {
    const parsed = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setSlotValues((prev) => ({ ...prev, [id]: parsed }));
  }

  async function handleSaveSlots(id) {
    const slots = slotValues[id] !== undefined ? Number(slotValues[id]) : 0;
    setSlotSavingId(id);
    setAlertError('');
    try {
      const res = await updateEventSlots(id, slots);
      const updated = res.event || res.workshop;

      // Update state in place without full reload
      setWorkshops((prev) =>
        prev.map((item) => (item._id === id ? { ...item, availableSlots: slots, capacity: slots } : item))
      );

      setSlotSavedId(id);
      setTimeout(() => setSlotSavedId(null), 2500);
    } catch (err) {
      setAlertError(err.message || 'Failed to update available slots.');
    } finally {
      setSlotSavingId(null);
    }
  }

  // Handle Delete with confirmation
  async function handleDelete(workshop) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the workshop "${workshop.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setAlertError('');
    setAlertSuccess('');
    try {
      await deleteEvent(workshop._id);
      setWorkshops((prev) => prev.filter((item) => item._id !== workshop._id));
      setAlertSuccess(`Workshop "${workshop.title}" deleted successfully.`);
      setTimeout(() => setAlertSuccess(''), 4000);
    } catch (err) {
      setAlertError(err.message || 'Failed to delete workshop.');
    }
  }

  // Add Workshop Submit
  async function handleAddSubmit(e) {
    e.preventDefault();
    setAddError('');
    setAlertSuccess('');

    const title = addForm.title.trim();
    const finalCategory =
      addForm.category === 'Other' ? addForm.customCategory.trim() : addForm.category.trim();
    const date = addForm.date;
    const time = addForm.time.trim();
    const venue = addForm.venue.trim();
    const slots = Number(addForm.availableSlots);

    // Client-side validations
    if (!title) {
      setAddError('Title is required.');
      return;
    }
    if (!finalCategory) {
      setAddError('Please select or specify a category.');
      return;
    }
    if (!date) {
      setAddError('Date is required.');
      return;
    }
    if (!time) {
      setAddError('Time is required.');
      return;
    }
    if (!venue) {
      setAddError('Venue is required.');
      return;
    }
    if (!Number.isInteger(slots) || slots < 0) {
      setAddError('Available slots must be a whole number (0 or greater).');
      return;
    }

    const payload = new FormData();
    payload.append('title', title);
    payload.append('category', finalCategory);
    payload.append('date', date);
    payload.append('time', time);
    payload.append('venue', venue);
    payload.append('availableSlots', slots);
    payload.append('description', addForm.description.trim());

    if (addImageFile) {
      payload.append('banner', addImageFile);
    }

    setAddSaving(true);
    try {
      const res = await createEvent(payload);
      const created = res.event || res.workshop;

      // Prepend to workshops list
      setWorkshops((prev) => [created, ...prev]);
      setSlotValues((prev) => ({ ...prev, [created._id]: created.availableSlots ?? slots }));

      // Reset form
      setAddForm(INITIAL_FORM);
      setAddImageFile(null);
      setAddImagePreview('');
      if (addFileInputRef.current) addFileInputRef.current.value = '';

      setAlertSuccess(`Workshop "${created.title}" published successfully!`);
      setTimeout(() => setAlertSuccess(''), 4500);

      // Automatically switch to Upcoming tab
      setActiveTab('upcoming');
    } catch (err) {
      setAddError(err.message || 'Failed to create workshop.');
    } finally {
      setAddSaving(false);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(workshop) {
    setEditingItem(workshop);
    const isKnownCat = categories.includes(workshop.category);
    setEditForm({
      title: workshop.title || '',
      category: isKnownCat ? workshop.category : 'Other',
      customCategory: isKnownCat ? '' : workshop.category || '',
      date: toDateInputValue(workshop.date),
      time: toTimeInputValue(workshop.date, workshop.time),
      venue: workshop.venue || workshop.location || 'Chocolate Clicks Studio, Colombo',
      availableSlots:
        workshop.availableSlots !== undefined ? workshop.availableSlots : workshop.capacity ?? 20,
      description: workshop.description || '',
    });
    setEditImageFile(null);
    setEditImagePreview(workshop.bannerUrl || '');
    setEditError('');
  }

  function handleCloseEdit() {
    if (editSaving) return;
    setEditingItem(null);
    setEditImageFile(null);
    setEditImagePreview('');
    setEditError('');
  }

  // Edit Workshop Submit
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingItem) return;
    setEditError('');

    const title = editForm.title.trim();
    const finalCategory =
      editForm.category === 'Other' ? editForm.customCategory.trim() : editForm.category.trim();
    const date = editForm.date;
    const time = editForm.time.trim();
    const venue = editForm.venue.trim();
    const slots = Number(editForm.availableSlots);

    if (!title) {
      setEditError('Title is required.');
      return;
    }
    if (!finalCategory) {
      setEditError('Please select or specify a category.');
      return;
    }
    if (!date) {
      setEditError('Date is required.');
      return;
    }
    if (!time) {
      setEditError('Time is required.');
      return;
    }
    if (!venue) {
      setEditError('Venue is required.');
      return;
    }
    if (!Number.isInteger(slots) || slots < 0) {
      setEditError('Available slots must be a whole number (0 or greater).');
      return;
    }

    const payload = new FormData();
    payload.append('title', title);
    payload.append('category', finalCategory);
    payload.append('date', date);
    payload.append('time', time);
    payload.append('venue', venue);
    payload.append('availableSlots', slots);
    payload.append('description', editForm.description.trim());

    if (editImageFile) {
      payload.append('banner', editImageFile);
    }

    setEditSaving(true);
    try {
      const res = await updateEvent(editingItem._id, payload);
      const updated = res.event || res.workshop;

      // Update workshop in state — date changes will naturally re-sort into Upcoming or Past
      setWorkshops((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSlotValues((prev) => ({ ...prev, [updated._id]: updated.availableSlots ?? slots }));

      setAlertSuccess(`Workshop "${updated.title}" updated successfully.`);
      setTimeout(() => setAlertSuccess(''), 4000);
      handleCloseEdit();
    } catch (err) {
      setEditError(err.message || 'Failed to update workshop.');
    } finally {
      setEditSaving(false);
    }
  }

  // Render a list row (used for both Upcoming and Past)
  function renderWorkshopRow(workshop, isPast = false) {
    const currentSlots =
      slotValues[workshop._id] !== undefined
        ? slotValues[workshop._id]
        : workshop.availableSlots ?? workshop.capacity ?? 20;

    const isSaving = slotSavingId === workshop._id;
    const isSaved = slotSavedId === workshop._id;
    const hasUnsavedSlots =
      !isPast &&
      currentSlots !== (workshop.availableSlots ?? workshop.capacity ?? 20);

    return (
      <article className="event-row-card" key={workshop._id}>
        <div className="event-row-media">
          <img
            src={workshop.bannerUrl || '/front_img/solo-left.jpeg'}
            alt={workshop.title}
            loading="lazy"
          />
        </div>

        <div className="event-row-content">
          <div className="event-row-header">
            <h3 className="event-row-title">{workshop.title}</h3>
            <span className="event-row-badge">{workshop.category || 'Workshop'}</span>
          </div>

          <div className="event-row-meta">
            <span className="event-meta-item">
              <CalendarDays size={14} />
              {formatEventDate(workshop.date)}
            </span>
            <span className="event-meta-item">
              <Clock size={14} />
              {formatEventTime(workshop.date, workshop.time)}
            </span>
            <span className="event-meta-item">
              <MapPin size={14} />
              {workshop.venue || workshop.location || 'Chocolate Clicks Studio'}
            </span>
            <span className="event-meta-item">
              <Users size={14} />
              {currentSlots === 0 ? (
                <strong style={{ color: '#ef4444' }}>Fully booked (0 slots)</strong>
              ) : (
                <span><strong>{currentSlots}</strong> slots available</span>
              )}
            </span>
          </div>

          {workshop.description && (
            <p className="event-row-desc">{workshop.description}</p>
          )}
        </div>

        <div className="event-row-actions">
          {/* Slot Stepper control - interactive for Upcoming, read-only for Past */}
          {!isPast ? (
            <div className="slot-stepper-wrap">
              <span className="slot-stepper-label">Slots:</span>
              <button
                type="button"
                className="slot-stepper-btn"
                onClick={() => handleSlotStep(workshop._id, -1)}
                disabled={currentSlots <= 0 || isSaving}
                title="Decrease slots"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                className="slot-stepper-input"
                value={currentSlots}
                onChange={(e) => handleSlotInputChange(workshop._id, e.target.value)}
                disabled={isSaving}
              />
              <button
                type="button"
                className="slot-stepper-btn"
                onClick={() => handleSlotStep(workshop._id, 1)}
                disabled={isSaving}
                title="Increase slots"
              >
                +
              </button>

              <button
                type="button"
                className="slot-save-btn"
                onClick={() => handleSaveSlots(workshop._id)}
                disabled={isSaving || !hasUnsavedSlots}
                title="Save slots to server"
              >
                {isSaving ? '...' : 'Save'}
              </button>
              {isSaved && <span className="slot-status-saved">Saved ✓</span>}
            </div>
          ) : (
            <div className="slot-stepper-wrap" style={{ opacity: 0.7 }}>
              <span className="slot-stepper-label">Slots:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentSlots} (Ended)</span>
            </div>
          )}

          {/* Action buttons: Attendees, Edit & Delete */}
          <div className="event-row-btns">
            <button
              type="button"
              className="event-btn-icon event-btn-icon-attendees"
              onClick={() => handleViewRegistrations(workshop._id)}
              title="View registered attendees for this workshop"
            >
              <Users size={14} />
              <span>Attendees ({workshop.registrationCount || 0})</span>
            </button>

            <button
              type="button"
              className="event-btn-icon"
              onClick={() => handleOpenEdit(workshop)}
              title="Edit workshop details"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="event-btn-icon event-btn-icon-danger"
              onClick={() => handleDelete(workshop)}
              title="Delete this workshop"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="events-mgmt-page">
      {/* ── Header ── */}
      <header className="events-mgmt-header">
        <div className="events-mgmt-title-wrap">
          <div>
            <h2>
              <CalendarDays size={26} color="#c98b3b" />
              Workshop &amp; Events Administration
            </h2>
            <p>View upcoming sessions, review past archives, and publish new workshops.</p>
          </div>
        </div>

        <div className="events-mgmt-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadData}
            disabled={loading}
            title="Refresh events list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setActiveTab('add')}
          >
            <Plus size={16} />
            Add Workshop
          </button>
        </div>
      </header>

      {/* Global Alerts */}
      {alertError && (
        <div className="events-alert events-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{alertError}</span>
        </div>
      )}
      {alertSuccess && (
        <div className="events-alert events-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* ── Sub-tabs ── */}
      <nav className="events-tab-nav" aria-label="Events sub-sections">
        <button
          type="button"
          className={`events-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <CalendarCheck size={16} />
          <span>Upcoming Workshops</span>
          <span className="events-tab-count">{upcomingWorkshops.length}</span>
        </button>

        <button
          type="button"
          className={`events-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <History size={16} />
          <span>Past Workshops</span>
          <span className="events-tab-count">{pastWorkshops.length}</span>
        </button>

        <button
          type="button"
          className={`events-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <Users size={16} />
          <span>Registered Attendees</span>
          <span className="events-tab-count">{totalRegistrationsCount}</span>
        </button>

        <button
          type="button"
          className={`events-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <Plus size={16} />
          <span>Add Workshop</span>
        </button>
      </nav>

      {/* ── Main Tab Content ── */}
      <div className="events-mgmt-card">
        {loading ? (
          <div className="events-empty-state">
            <RefreshCw size={28} className="animate-spin" />
            <p>Loading workshops...</p>
          </div>
        ) : activeTab === 'upcoming' ? (
          /* SECTION A: UPCOMING WORKSHOPS */
          upcomingWorkshops.length === 0 ? (
            <div className="events-empty-state">
              <CalendarDays size={42} className="events-empty-icon" />
              <h3>No upcoming workshops yet</h3>
              <p>Schedule a new workshop to start taking registrations on the public page.</p>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setActiveTab('add')}
                style={{ marginTop: '0.75rem' }}
              >
                <Plus size={16} />
                Schedule Workshop
              </button>
            </div>
          ) : (
            <div className="events-list">
              {upcomingWorkshops.map((workshop) => renderWorkshopRow(workshop, false))}
            </div>
          )
        ) : activeTab === 'past' ? (
          /* SECTION B: PAST WORKSHOPS */
          pastWorkshops.length === 0 ? (
            <div className="events-empty-state">
              <History size={42} className="events-empty-icon" />
              <h3>No past workshops recorded yet</h3>
              <p>Workshops whose date and time have passed will automatically appear here.</p>
            </div>
          ) : (
            <div className="events-list">
              {pastWorkshops.map((workshop) => renderWorkshopRow(workshop, true))}
            </div>
          )
        ) : activeTab === 'add' ? (
          /* SECTION C: ADD WORKSHOP FORM */
          <form className="event-form" onSubmit={handleAddSubmit}>
            {addError && (
              <div className="events-alert events-alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>{addError}</span>
              </div>
            )}

            <div className="event-form-grid">
              {/* Title */}
              <div className="event-form-group event-form-full">
                <label htmlFor="add-event-title">Title *</label>
                <input
                  id="add-event-title"
                  required
                  maxLength={120}
                  placeholder="e.g. Masterclass Edition 3, Traditional Wes Mask Art"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="event-form-group">
                <label htmlFor="add-event-category">Category *</label>
                <select
                  id="add-event-category"
                  required
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other (Custom category)</option>
                </select>
              </div>

              {/* Custom Category if "Other" */}
              {addForm.category === 'Other' && (
                <div className="event-form-group">
                  <label htmlFor="add-custom-category">Custom Category Name *</label>
                  <input
                    id="add-custom-category"
                    required
                    placeholder="Enter custom category name"
                    value={addForm.customCategory}
                    onChange={(e) => setAddForm({ ...addForm, customCategory: e.target.value })}
                  />
                </div>
              )}

              {/* Venue */}
              <div className="event-form-group">
                <label htmlFor="add-event-venue">Venue *</label>
                <input
                  id="add-event-venue"
                  required
                  placeholder="e.g. Chocolate Clicks Studio, Colombo"
                  value={addForm.venue}
                  onChange={(e) => setAddForm({ ...addForm, venue: e.target.value })}
                />
              </div>

              {/* Date */}
              <div className="event-form-group">
                <label htmlFor="add-event-date">Date *</label>
                <input
                  id="add-event-date"
                  type="date"
                  required
                  value={addForm.date}
                  onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                />
              </div>

              {/* Time */}
              <div className="event-form-group">
                <label htmlFor="add-event-time">Time (Colombo Time) *</label>
                <input
                  id="add-event-time"
                  type="time"
                  required
                  value={addForm.time}
                  onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
                />
              </div>

              {/* Available Slots */}
              <div className="event-form-group">
                <label htmlFor="add-event-slots">Available Slots * (integer &ge; 0)</label>
                <input
                  id="add-event-slots"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={addForm.availableSlots}
                  onChange={(e) => setAddForm({ ...addForm, availableSlots: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="event-form-group event-form-full">
                <label htmlFor="add-event-desc">Description (optional)</label>
                <textarea
                  id="add-event-desc"
                  rows="3"
                  maxLength={3000}
                  placeholder="Event itinerary, supplies provided, and special instructions..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div className="event-form-group event-form-full">
                <label htmlFor="add-event-banner">Banner Image (optional)</label>
                <div className="event-form-file-wrap">
                  {addImagePreview ? (
                    <img src={addImagePreview} alt="Preview" className="event-form-img-preview" />
                  ) : (
                    <div
                      className="event-form-img-preview"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                      }}
                    >
                      <Upload size={20} />
                    </div>
                  )}

                  <input
                    id="add-event-banner"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={addFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAddImageFile(file);
                        setAddImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  {addImageFile && (
                    <button
                      type="button"
                      className="event-btn-icon event-btn-icon-danger"
                      onClick={() => {
                        setAddImageFile(null);
                        setAddImagePreview('');
                        if (addFileInputRef.current) addFileInputRef.current.value = '';
                      }}
                    >
                      <X size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="event-form-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  setAddForm(INITIAL_FORM);
                  setAddImageFile(null);
                  setAddImagePreview('');
                  setActiveTab('upcoming');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn-primary" disabled={addSaving}>
                {addSaving ? 'Publishing...' : 'Publish Workshop'}
              </button>
            </div>
          </form>
        ) : (
          /* SECTION D: REGISTERED ATTENDEES */
          <div className="event-reg-section">
            {/* Toolbar: Workshop Selector Dropdown + Search + CSV Export */}
            <div className="event-reg-toolbar">
              <div className="event-reg-select-group">
                <label htmlFor="event-workshop-dropdown" className="event-reg-select-label">
                  Select Workshop Event:
                </label>
                <select
                  id="event-workshop-dropdown"
                  className="event-reg-select"
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                >
                  {workshops.length === 0 ? (
                    <option value="">No workshops available</option>
                  ) : (
                    <>
                      {upcomingWorkshops.length > 0 && (
                        <optgroup label="Upcoming Workshops">
                          {upcomingWorkshops.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.title} — {formatEventDate(w.date)} ({w.registrationCount || 0} registered)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {pastWorkshops.length > 0 && (
                        <optgroup label="Past Workshops">
                          {pastWorkshops.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.title} — {formatEventDate(w.date)} ({w.registrationCount || 0} registered)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )}
                </select>
              </div>

              <div className="event-reg-controls">
                <div className="event-reg-search-wrap">
                  <Search size={15} className="event-reg-search-icon" />
                  <input
                    type="text"
                    className="event-reg-search-input"
                    placeholder="Search by name, email, phone..."
                    value={regSearchTerm}
                    onChange={(e) => setRegSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => loadRegistrations(selectedWorkshopId)}
                  disabled={loadingRegistrations || !selectedWorkshopId}
                  title="Reload attendees list"
                >
                  <RefreshCw size={14} className={loadingRegistrations ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={exportAttendeesToCsv}
                  disabled={registrations.length === 0}
                  title="Download attendee list as CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Error in loading attendees */}
            {regError && (
              <div className="events-alert events-alert-error">
                <AlertCircle size={18} />
                <span>{regError}</span>
              </div>
            )}

            {/* Selected Workshop Overview Card */}
            {currentSelectedWorkshop && (
              <div className="event-reg-summary-card">
                <div className="event-reg-summary-info">
                  {currentSelectedWorkshop.bannerUrl && (
                    <img
                      src={currentSelectedWorkshop.bannerUrl}
                      alt={currentSelectedWorkshop.title}
                      className="event-reg-summary-thumb"
                    />
                  )}
                  <div className="event-reg-summary-details">
                    <span className="event-card-category" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                      {currentSelectedWorkshop.category || 'Workshop'}
                    </span>
                    <h3>{currentSelectedWorkshop.title}</h3>
                    <div className="event-reg-summary-meta">
                      <span>
                        <CalendarDays size={13} color="#c98b3b" />
                        {formatEventDate(currentSelectedWorkshop.date)}
                      </span>
                      <span>
                        <Clock size={13} color="#c98b3b" />
                        {formatEventTime(currentSelectedWorkshop.date, currentSelectedWorkshop.time)}
                      </span>
                      <span>
                        <MapPin size={13} color="#c98b3b" />
                        {currentSelectedWorkshop.venue || currentSelectedWorkshop.location || 'Chocolate Clicks Studio'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="event-reg-stats-grid">
                  <div className="event-reg-stat-box">
                    <span className="stat-val" style={{ color: '#c98b3b' }}>
                      {registrations.length}
                    </span>
                    <span className="stat-lbl">Registered</span>
                  </div>
                  <div className="event-reg-stat-box">
                    <span className="stat-val">
                      {currentSelectedWorkshop.availableSlots !== undefined
                        ? currentSelectedWorkshop.availableSlots
                        : currentSelectedWorkshop.capacity ?? 20}
                    </span>
                    <span className="stat-lbl">Capacity</span>
                  </div>
                  <div className="event-reg-stat-box">
                    <span
                      className="stat-val"
                      style={{
                        color:
                          (currentSelectedWorkshop.capacity ?? 20) - registrations.length <= 0
                            ? '#ef4444'
                            : '#10b981',
                      }}
                    >
                      {Math.max(
                        0,
                        (currentSelectedWorkshop.capacity ?? 20) - registrations.length
                      )}
                    </span>
                    <span className="stat-lbl">Remaining</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attendees Data Table */}
            <div className="event-reg-table-card">
              <div className="event-reg-table-header">
                <h4>
                  <Users size={16} color="#c98b3b" />
                  <span>Attendee List ({filteredRegistrations.length})</span>
                </h4>
                {regSearchTerm && (
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    Showing results for "{regSearchTerm}"
                  </span>
                )}
              </div>

              {loadingRegistrations ? (
                <div className="events-empty-state">
                  <RefreshCw size={26} className="animate-spin" />
                  <p>Loading registered attendees...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="events-empty-state" style={{ padding: '3rem 1.5rem' }}>
                  <Users size={38} className="events-empty-icon" />
                  <h3>
                    {regSearchTerm
                      ? 'No matching attendees found'
                      : 'No registrations for this workshop yet'}
                  </h3>
                  <p>
                    {regSearchTerm
                      ? 'Try clearing or checking your search filter above.'
                      : 'When customers register for this workshop on the public website, their details will automatically show up here.'}
                  </p>
                </div>
              ) : (
                <div className="event-reg-table-responsive">
                  <table className="event-reg-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Attendee Name</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Registration Date</th>
                        <th>Notes / Special Requests</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg, index) => {
                        const initials = (reg.fullName || 'User')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();
                        const isDeleting = deletingRegId === reg._id;

                        return (
                          <tr key={reg._id}>
                            <td style={{ color: '#6b7280', fontWeight: 600 }}>{index + 1}</td>
                            <td>
                              <div className="event-reg-user-cell">
                                <div className="event-reg-avatar-fallback">{initials}</div>
                                <span style={{ fontWeight: 600, color: '#f3f4f6' }}>
                                  {reg.fullName}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d1d5db' }}>
                                <Mail size={13} color="#9ca3af" />
                                {reg.email}
                              </span>
                            </td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace', color: '#d1d5db' }}>
                                <Phone size={13} color="#9ca3af" />
                                {reg.phone}
                              </span>
                            </td>
                            <td>
                              <span className="event-reg-badge-date">
                                {new Date(reg.createdAt).toLocaleDateString('en-US', {
                                  timeZone: 'Asia/Colombo',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td>
                              {reg.notes ? (
                                <span className="event-reg-notes-text" title={reg.notes}>
                                  {reg.notes}
                                </span>
                              ) : (
                                <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                  None
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="event-btn-icon event-btn-icon-danger"
                                onClick={() => handleDeleteRegistration(reg)}
                                disabled={isDeleting}
                                title="Cancel this registration"
                              >
                                <Trash2 size={13} />
                                <span>{isDeleting ? 'Removing...' : 'Cancel'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingItem && (
        <div className="event-modal-backdrop" onClick={handleCloseEdit}>
          <div
            className="event-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="event-modal-header">
              <h3>Edit Workshop: {editingItem.title}</h3>
              <button
                type="button"
                className="event-modal-close-btn"
                onClick={handleCloseEdit}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="event-modal-body">
              <form onSubmit={handleEditSubmit}>
                {editError && (
                  <div className="events-alert events-alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    <span>{editError}</span>
                  </div>
                )}

                <div className="event-form-grid">
                  <div className="event-form-group event-form-full">
                    <label>Title *</label>
                    <input
                      required
                      maxLength={120}
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>

                  <div className="event-form-group">
                    <label>Category *</label>
                    <select
                      required
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Other">Other (Custom category)</option>
                    </select>
                  </div>

                  {editForm.category === 'Other' && (
                    <div className="event-form-group">
                      <label>Custom Category Name *</label>
                      <input
                        required
                        placeholder="Enter category name"
                        value={editForm.customCategory}
                        onChange={(e) =>
                          setEditForm({ ...editForm, customCategory: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="event-form-group">
                    <label>Venue *</label>
                    <input
                      required
                      value={editForm.venue}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    />
                  </div>

                  <div className="event-form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                  </div>

                  <div className="event-form-group">
                    <label>Time (Colombo Time) *</label>
                    <input
                      type="time"
                      required
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    />
                  </div>

                  <div className="event-form-group">
                    <label>Available Slots *</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={editForm.availableSlots}
                      onChange={(e) =>
                        setEditForm({ ...editForm, availableSlots: e.target.value })
                      }
                    />
                  </div>

                  <div className="event-form-group event-form-full">
                    <label>Description (optional)</label>
                    <textarea
                      rows="3"
                      maxLength={3000}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>

                  <div className="event-form-group event-form-full">
                    <label>Change Banner Image (optional)</label>
                    <div className="event-form-file-wrap">
                      {editImagePreview && (
                        <img src={editImagePreview} alt="Preview" className="event-form-img-preview" />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        ref={editFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditImageFile(file);
                            setEditImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="event-form-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleCloseEdit}
                    disabled={editSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={editSaving}>
                    {editSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
