// src/frontend/OurEvents.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Users,
  Sparkles,
} from 'lucide-react';
import { getWorkshops, getEventCategories } from '../api';
import './OurEvents.css';

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function getCategoryRoute(categoryName = '') {
  const lower = categoryName.toLowerCase();
  if (lower.includes('bake')) return '/bake-it-happen';
  if (lower.includes('mask')) return '/mask-workshop';
  return null;
}

// Map category names to route + image for the top experience cards
const CATEGORY_CARD_META = {
  'Bake It Happen': {
    route: '/bake-it-happen',
    image: '/front_img/solo-left.jpeg',
  },
  'Sri Lankan Wes Mask Painting': {
    route: '/mask-workshop',
    image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.31.jpeg',
  },
};

export default function OurEvents() {
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModalEvent, setActiveModalEvent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getWorkshops('upcoming'), getEventCategories()])
      .then(([workshopData, categoryData]) => {
        if (cancelled) return;
        setWorkshops(workshopData.workshops || []);
        setCategories(categoryData.categories || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load event schedules.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWorkshops = workshops.filter((ws) => {
    if (selectedCategory === 'all') return true;
    return (ws.category || 'Sri Lankan Wes Mask Painting') === selectedCategory;
  });

  function handleSeeMore(workshop) {
    const route = getCategoryRoute(workshop.category);
    if (route) {
      navigate(route);
    } else {
      setActiveModalEvent(workshop);
    }
  }

  return (
    <div className="events-page">
      {/* ── Hero Section (Matches Our Menu formatting) ── */}
      <section className="events-hero">
        <h1>Our Events</h1>
        <p>Explore experiences at Chocolate Clicks</p>
        {error && <p style={{ color: '#c98b3b', marginTop: '0.75rem' }}>{error}</p>}
      </section>

      {/* ── Experience Cards (fetched from eventcategories DB) ── */}
      <section className="experiences-section" aria-label="Experiences">
        <div className="experiences-static-grid">
          {categories.map((cat) => {
            const meta = CATEGORY_CARD_META[cat.name];
            if (!meta) return null; // Only show categories that have a mapped route/image
            return (
              <article
                key={cat._id || cat.name}
                className="experience-static-card"
                onClick={() => navigate(meta.route)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(meta.route);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${cat.name}`}
              >
                <div className="experience-static-media">
                  <img src={meta.image} alt={cat.name} loading="lazy" />
                </div>

                <div className="experience-static-body">
                  <span className="experience-tagline">{cat.description}</span>
                  <h2 className="experience-static-title">{cat.name}</h2>
                  <div className="experience-static-footer">
                    <span className="experience-view-link">
                      View event
                      <ArrowRight size={16} className="experience-arrow-icon" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Dynamic Upcoming Scheduled Events (Added by Admin) ── */}
      <section className="scheduled-events-section" id="upcoming-events" aria-labelledby="scheduled-heading">
        <div className="events-container">
          <div className="scheduled-header-row">
            <div>
              <h2 id="scheduled-heading" className="scheduled-title">
                Upcoming Scheduled Events
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="events-filter-pills" role="tablist" aria-label="Filter events by category">
              <button
                type="button"
                className={`event-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Total ({workshops.length})
              </button>
              {categories.map((cat) => {
                const count = workshops.filter(
                  (w) => (w.category || 'Sri Lankan Wes Mask Painting') === cat.name
                ).length;
                if (count === 0) return null;
                // return (
                //   <button
                //     key={cat.name}
                //     type="button"
                //     className={`event-filter-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                //     onClick={() => setSelectedCategory(cat.name)}
                //   >
                //     {cat.name} ({count})
                //   </button>
                // );
              })}
            </div>
          </div>

          {error && <p className="events-error-banner" role="alert">{error}</p>}

          {loading ? (
            <div className="events-loading-wrap">
              <div className="events-spinner" />
              <p>Loading scheduled events...</p>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="events-empty-state">
              <CalendarDays size={42} className="events-empty-icon" />
              <h3>No scheduled events right now</h3>
              <p>
                There are currently no upcoming events scheduled for this category.
                Check out our experiences above or visit our cafe studio!
              </p>
            </div>
          ) : (
            <div className="scheduled-events-grid">
              {filteredWorkshops.map((workshop) => {
                return (
                  <article className="scheduled-event-card" key={workshop._id}>
                    <div className="scheduled-card-media">
                      <img src={workshop.bannerUrl} alt={workshop.title} loading="lazy" />
                      <span className="scheduled-cat-badge">
                        {workshop.category || 'Sri Lankan Wes Mask Painting'}
                      </span>
                    </div>

                    <div className="scheduled-card-content">
                      <h3 className="scheduled-card-title">{workshop.title}</h3>
                      <p className="scheduled-card-desc">{workshop.description}</p>
                      <div className="scheduled-card-meta">
                        <span>
                          <Clock size={14} />
                          {formatDate(workshop.date)}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {workshop.location}
                        </span>
                      </div>

                      <div className="scheduled-card-attendees">
                        <Users size={15} />
                        <span>
                          {workshop.registrationCount || 0} registered
                          {workshop.capacity
                            ? ` · ${Math.max(0, workshop.capacity - (workshop.registrationCount || 0))} seats left`
                            : ' · Open capacity'}
                        </span>
                      </div>

                      {/* Action buttons: See More & Register */}
                      <div className="scheduled-card-actions">
                        <button
                          type="button"
                          className="scheduled-see-more-btn"
                          onClick={() => handleSeeMore(workshop)}
                          title="View more details about this event"
                        >
                          See more
                          <ArrowRight size={15} />
                        </button>

                        <button
                          type="button"
                          className="scheduled-register-btn"
                          onClick={() => navigate(`/workshop/${workshop._id}/register`)}
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Footer Note */}
          <div className="events-footer-note">
            <p>
              Looking for private bookings, birthday packages, or team-building sessions?
              Visit our café on Stratford Avenue or connect with our events team.
            </p>
          </div>
        </div>
      </section>

      {/* ── Event Details Modal (if category has no separate page yet) ── */}
      {activeModalEvent && (
        <div className="event-modal-backdrop" onClick={() => setActiveModalEvent(null)}>
          <div
            className="event-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setActiveModalEvent(null)}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <img
              src={activeModalEvent.bannerUrl}
              alt={activeModalEvent.title}
              className="event-modal-banner"
            />

            <div className="event-modal-body">
              <span className="scheduled-cat-badge">
                {activeModalEvent.category || 'Sri Lankan Wes Mask Painting'}
              </span>
              <h2>{activeModalEvent.title}</h2>

              <p className="event-modal-meta">
                <Clock size={16} /> {formatDate(activeModalEvent.date)} · <MapPin size={16} /> {activeModalEvent.location}
              </p>

              <div className="event-modal-desc">
                <h4>About this Workshop</h4>
                <p>{activeModalEvent.description}</p>
              </div>

              <div className="event-modal-footer">
                <button
                  type="button"
                  className="workshop-primary-button"
                  onClick={() => {
                    navigate(`/workshop/${activeModalEvent._id}/register`);
                    setActiveModalEvent(null);
                  }}
                >
                  Proceed to Registration Form →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
