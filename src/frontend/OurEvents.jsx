// src/frontend/OurEvents.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OurEvents.css';

export default function OurEvents() {
    const navigate = useNavigate();

    const events = [
        {
            id: 'bake-it-happen',
            title: 'Bake It Happen',
            tagline: 'Culinary Masterclass',
            description: 'Step into our bakery studio to craft, bake, and decorate artisanal cakes and pastries alongside our expert chocolatiers.',
            image: '/front_img/cake1.jpeg',
            badge: 'Coming Soon',
            badgeClass: 'upcoming',
            route: '/bake-it-happen'
        },
        {
            id: 'mask-workshop',
            title: 'Mask Painting Workshop',
            tagline: 'Heritage Art Experience',
            description: 'Immerse yourself in traditional folklore art. Paint your own authentic Wes mask with step-by-step guidance, delicious snacks, and drinks.',
            image: '/front_img/WhatsApp Image 2026-01-20 at 22.31.31.jpeg',
            badge: 'Open For Booking',
            badgeClass: 'live',
            route: '/mask-workshop'
        }
    ];

    return (
        <div className="events-page">
            {/* Intro section matching About & FoodItems layout */}
            <section className="events-hero">
                <span className="events-hero-accent">Explore experiences</span>
                <h1>Our Events</h1>
                <p className="events-hero-desc">
                    Immerse yourself in unique experiences at Chocolate Clicks - from hands-on baking sessions to authentic cultural mask painting.
                </p>
            </section>

            {/* Events Grid Section */}
            <section className="events-section">
                <div className="events-grid">
                    {events.map((event) => (
                        <article
                            key={event.id}
                            className="event-card"
                            onClick={() => navigate(event.route)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(event.route);
                                }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${event.title} details`}
                        >
                            <div className="event-card-media">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="event-card-img"
                                    loading="lazy"
                                />
                                <span className={`event-badge ${event.badgeClass}`}>
                                    {event.badge}
                                </span>
                            </div>

                            <div className="event-card-body">
                                <span className="event-tagline">{event.tagline}</span>
                                <h2 className="event-title">{event.title}</h2>
                                <p className="event-desc">{event.description}</p>

                                <div className="event-card-action">
                                    <span className="event-view-link">
                                        View event
                                        <span className="event-arrow-icon" aria-hidden="true">→</span>
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="events-footer-note">
                    <p>
                        Have a custom group workshop or private celebration in mind? Visit our café on Stratford Avenue or contact us for private bookings.
                    </p>
                </div>
            </section>
        </div>
    );
}
