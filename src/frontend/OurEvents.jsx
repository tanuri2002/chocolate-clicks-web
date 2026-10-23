// src/frontend/OurEvents.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Users,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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

export default function OurEvents() {
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModalEvent, setActiveModalEvent] = useState(null);

  // Experience Category Cards matching the mobile app screenshot
  const experienceCards = [
    {
      id: 'bake-it-happen',
      category: 'Bake It Happen',
      title: 'Bake It Happen',
      tagline: 'Culinary Masterclass',
      price: 'LKR 13,000/- PER PERSON',
      image: '/front_img/solo-left.jpeg',
      route: '/bake-it-happen',
    },
    {
      id: 'mask-workshop',
      category: 'Sri Lankan Wes Mask Painting',
      title: 'Mask Painting Workshop',
      tagline: 'Heritage Art Experience',
      price: 'LKR 5,000/- PER PERSON',
      image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.31.jpeg',
      route: '/mask-workshop',
    },
    {
      id: 'tote-bag-painting',
      category: 'Tote Bag Painting',
      title: 'Tote Bag Painting',
      tagline: 'Wearable Fabric Art',
      price: 'LKR 4,000/- PER PERSON',
      image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.37.jpeg',
      badge: 'Art Studio',
    },
    {
      id: 'pot-painting',
      category: 'Pot Painting',
      title: 'Pot Painting Workshop',
      tagline: 'Terracotta & Ceramic Art',
      price: 'LKR 3,500/- PER PERSON',
      image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.38.jpeg',
      badge: 'Art Studio',
    },
    {
      id: 'trinket-painting',
      category: 'Trinket Painting',
      title: 'Trinket Painting',
      tagline: 'Custom Keepsake Craft',
      price: 'LKR 4,000/- PER PERSON',
      image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.32.jpeg',
      badge: 'Art Studio',
    },
    {
      id: 'canvas-painting',
      category: 'Canvas Painting',
      title: 'Canvas Painting',
      tagline: 'Square & Round Canvas Art',
      price: 'LKR 4,000/- PER PERSON',
      image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.30 (1).jpeg',
      badge: 'Art Studio',
    },
  ];

  // Merge any dynamic categories created in Admin Panel
  const combinedCards = useMemo(() => {
    const list = [...experienceCards];
    categories.forEach((cat) => {
      const exists = list.some(
        (c) => c.category.toLowerCase() === cat.name.toLowerCase()
      );
      if (!exists) {
        list.push({
          id: cat._id || cat.name.toLowerCase().replace(/\s+/g, '-'),
          category: cat.name,
          title: cat.name,
          tagline: cat.description || 'Art & Culinary Experience',
          price: cat.priceInfo || 'PRICE ON INQUIRY',
          image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.30 (1).jpeg',
          badge: 'Workshop',
        });
      }
    });
    return list;
  }, [categories]);

  // Repeated 5 times so cards fill from left corner to right corner on any screen resolution
  const repeatedCards = useMemo(() => {
    if (combinedCards.length === 0) return [];
    return [
      ...combinedCards,
      ...combinedCards,
      ...combinedCards,
      ...combinedCards,
      ...combinedCards,
    ];
  }, [combinedCards]);

  const [activeIndex, setActiveIndex] = useState(14);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Track window width for pixel-perfect centering
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = windowWidth <= 480 ? 250 : windowWidth <= 768 ? 280 : 320;
  const cardGap = windowWidth <= 480 ? 14 : windowWidth <= 768 ? 18 : 28;

  // Initialize activeIndex in middle set (set 2, index 2 * N)
  useEffect(() => {
    if (combinedCards.length > 0) {
      setActiveIndex(combinedCards.length * 2);
    }
  }, [combinedCards.length]);

  // Continuous auto-sweep to the left - slowed down to 3.5s for smooth, elegant pacing
  useEffect(() => {
    if (isPaused || hoveredCardIndex !== null) return;
    const total = combinedCards.length;
    if (total === 0) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, hoveredCardIndex, combinedCards.length]);

  // Seamless, break-free reset during resting window (at 1350ms, after 1.2s slide completes)
  useEffect(() => {
    const total = combinedCards.length;
    if (total === 0) return;

    if (activeIndex >= total * 3) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex((prev) => prev - total);
        setTimeout(() => {
          setIsTransitioning(true);
        }, 60);
      }, 1350);

      return () => clearTimeout(resetTimer);
    } else if (activeIndex < total) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex((prev) => prev + total);
        setTimeout(() => {
          setIsTransitioning(true);
        }, 60);
      }, 1350);

      return () => clearTimeout(resetTimer);
    }
  }, [activeIndex, combinedCards.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  const handleCardMouseEnter = (idx) => {
    setHoveredCardIndex(idx);
    setIsPaused(true);
  };

  const handleCardMouseLeave = () => {
    setHoveredCardIndex(null);
    setIsPaused(false);
  };

  const handleCarouselMouseLeave = () => {
    setHoveredCardIndex(null);
    setIsPaused(false);
  };

  const getCardStatus = (idx) => {
    if (hoveredCardIndex !== null) {
      return idx === hoveredCardIndex ? 'is-touched-card' : 'is-dimmed-card';
    }
    return idx === activeIndex ? 'is-central-card' : 'is-dimmed-card';
  };

  const handleCardClick = (card) => {
    if (card.route) {
      navigate(card.route);
    } else {
      setSelectedCategory(card.category);
      const section = document.getElementById('upcoming-events');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Exact pixel offset for centering the active card in the viewport
  const trackOffset =
    windowWidth / 2 - cardWidth / 2 - activeIndex * (cardWidth + cardGap);

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
      {/* ── Top Header Section (Matches Mobile App UI) ── */}
      <header className="events-app-header">
        <div className="events-header-container">
          <button
            type="button"
            className="events-back-nav"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
            <span className="events-back-text">Events</span>
          </button>

          <div className="events-sub-header">
            <span className="events-brand-kicker">CHOCOLATE CLICKS</span>
            <h1 className="events-main-headline">Explore experiences at Chocolate Clicks</h1>
          </div>
        </div>
      </header>

      {/* ── Experience Categories Row (Single row auto-sweeping to the left every 1.5s) ── */}
      <section className="experiences-section" aria-label="Experiences">
        <div
          className="experiences-carousel-wrapper"
          onMouseLeave={handleCarouselMouseLeave}
        >
          {/* Subtle edge fade gradients */}
          <div className="carousel-fade-mask carousel-fade-left" aria-hidden="true" />
          <div className="carousel-fade-mask carousel-fade-right" aria-hidden="true" />

          {/* Nav Controls */}
          <button
            type="button"
            className="carousel-nav-btn prev"
            onClick={handlePrev}
            aria-label="Previous experience"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="carousel-nav-btn next"
            onClick={handleNext}
            aria-label="Next experience"
          >
            <ChevronRight size={22} />
          </button>

          {/* Infinite Moving Single-Row Track */}
          <div
            className="carousel-track"
            style={{
              transform: `translate3d(${trackOffset}px, 0, 0)`,
              transition: isTransitioning
                ? 'transform 1.2s cubic-bezier(0.25, 1, 0.4, 1)'
                : 'none',
            }}
          >
            {repeatedCards.map((card, idx) => {
              const statusClass = getCardStatus(idx);
              const hasDedicatedRoute = !!card.route;
              return (
                <article
                  key={`${card.id}-${idx}`}
                  className={`experience-app-card ${statusClass}`}
                  onMouseEnter={() => handleCardMouseEnter(idx)}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={() => handleCardClick(card)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(card);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${card.title}`}
                >
                  <div className="experience-app-media">
                    <img src={card.image} alt={card.title} loading="lazy" />
                    {card.price && (
                      <span className="experience-price-pill">{card.price}</span>
                    )}
                  </div>

                  <div className="experience-app-body">
                    <h2 className="experience-app-title">{card.title}</h2>
                    <div className="experience-app-footer">
                      <span className="experience-view-link">
                        {hasDedicatedRoute ? 'View event' : 'Explore workshops'}
                        <ArrowRight size={16} className="experience-arrow-icon" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Indicator Dots */}
          {combinedCards.length > 0 && (
            <div className="carousel-dots-wrapper" role="tablist" aria-label="Experience indicators">
              {combinedCards.map((card, dotIdx) => {
                const currentMod =
                  ((activeIndex % combinedCards.length) + combinedCards.length) %
                  combinedCards.length;
                const isActive = currentMod === dotIdx;
                return (
                  <button
                    key={`dot-${card.id || dotIdx}`}
                    type="button"
                    className={`carousel-dot ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setIsTransitioning(true);
                      const diff = dotIdx - currentMod;
                      setActiveIndex((prev) => prev + diff);
                    }}
                    aria-label={`Go to ${card.title}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Dynamic Upcoming Scheduled Events (Added by Admin) ── */}
      <section className="scheduled-events-section" id="upcoming-events" aria-labelledby="scheduled-heading">
        <div className="events-container">
          <div className="scheduled-header-row">
            <div>
              <span className="scheduled-kicker">
                <Sparkles size={16} /> Live Bookings &amp; Schedules
              </span>
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
                    className={`event-filter-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {cat.name} ({count})
                  </button>
                );
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
                const categoryRoute = getCategoryRoute(workshop.category);
                return (
                  <article className="scheduled-event-card" key={workshop._id}>
                    <div className="scheduled-card-media">
                      <img src={workshop.bannerUrl} alt={workshop.title} loading="lazy" />
                      <span className="scheduled-cat-badge">
                        {workshop.category || 'Sri Lankan Wes Mask Painting'}
                      </span>
                    </div>

                    <div className="scheduled-card-content">
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

                      <h3 className="scheduled-card-title">{workshop.title}</h3>
                      <p className="scheduled-card-desc">{workshop.description}</p>

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
