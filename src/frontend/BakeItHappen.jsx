// src/frontend/BakeItHappen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BakeItHappen.css';

export default function BakeItHappen() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="bake-page">
      <div className="bake-container">
        <button 
          type="button" 
          className="bake-back-btn" 
          onClick={() => navigate('/events')}
        >
          ← Back to Events
        </button>

        <section className="bake-hero">
          <div className="bake-hero-text">
            <span className="bake-hero-accent">Culinary Masterclass</span>
            <h1>Bake It Happen</h1>
            <p className="bake-lead">
              A hands-on baking and decorating workshop designed for dessert lovers, budding bakers, and anyone passionate about artisanal sweet treats.
            </p>
            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6', fontFamily: 'system-ui, sans-serif' }}>
              From whipping delicate buttercream rosettes to chocolate tempering and layered sponge perfection, join our master bakers right here at Chocolate Clicks for an unforgettable culinary experience.
            </p>
          </div>

          <div className="bake-hero-media">
            <img 
              src="/front_img/cake1.jpeg" 
              alt="Bake It Happen cake crafting" 
            />
          </div>
        </section>

        <div className="bake-pill-banner">
          <div>
            <p><strong>Status:</strong> Registration dates and workshop schedules are currently being finalized.</p>
            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.35rem' }}>
              Want to join our live creative sessions right now? Check out our <strong>Mask Painting Workshop</strong>.
            </p>
          </div>
          <button 
            type="button" 
            className="bake-cta-btn" 
            onClick={() => navigate('/mask-workshop')}
          >
            Explore Mask Workshop →
          </button>
        </div>

        <section className="bake-highlights">
          <h2>What You'll Experience</h2>
          <div className="bake-cards">
            <div className="bake-highlight-card">
              <div className="bake-card-icon">🎂</div>
              <h3>Artisan Cake Decorating</h3>
              <p>Master piping bag techniques, textured finishes, and elegant edible garnishes.</p>
            </div>

            <div className="bake-highlight-card">
              <div className="bake-card-icon">🍫</div>
              <h3>Chocolate Alchemy</h3>
              <p>Learn the secrets of rich ganache infusions, glossy glazes, and premium chocolate pairings.</p>
            </div>

            <div className="bake-highlight-card">
              <div className="bake-card-icon">☕</div>
              <h3>Sip &amp; Savor</h3>
              <p>Enjoy handcrafted café drinks and snack platters while you bake and take your creations home.</p>
            </div>
          </div>
        </section>

        {/* Notify Form */}
        <section className="bake-notify-box">
          <h3>Get Notified First</h3>
          <p>
            Be the first to know when registrations and early-bird seats open for Bake It Happen.
          </p>

          {subscribed ? (
            <p style={{ color: '#4ade80', fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>
              ✓ Thank you! We'll notify you as soon as seats become available.
            </p>
          ) : (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                style={{
                  flex: '1 1 240px',
                  padding: '0.65rem 1.2rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(201, 139, 59, 0.4)',
                  backgroundColor: '#0f0f0f',
                  color: '#ffffff',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="bake-cta-btn"
                style={{ backgroundColor: '#c98b3b', color: '#0f0f0f' }}
              >
                Notify Me
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
