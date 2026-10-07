import React from 'react';
import './About.css';
import cafe from '../assets/cafe.jpg';
import cafe2 from '../assets/cafe2.jpg';
import cafe3 from '../assets/cafe3.jpg';
import art1 from '../assets/art1.jpeg';
import art3 from '../assets/art3.jpg';
import art4 from '../assets/art4.jpg';

export default function About() {
  return (
    <>
      {/* Intro */}
      <section className="about-intro">
        <h3>Our story</h3>
        <h1>One space, one sweet vision</h1>
        <p>
          Chocolate Clicks began as a home-based passion project during
          lockdown and has grown into a café and an art studio - one for
          indulgent treats, the other for creative afternoons.
        </p>
      </section>

      {/* Café — two large images */}
      <section className="about-gallery">
        <div className="about-gallery-container">
          <div className="about-gallery-item">
            <img src={cafe} alt="Café Chocolate storefront" />
          </div>
          <div className="about-gallery-item">
            <img src={cafe2} alt="Café Chocolate entrance" />
          </div>
        </div>
      </section>

      {/* Café — full-bleed image with overlaid details */}
      <section className="about-feature">
        <img src={cafe3} alt="Inside Café Chocolate" className="about-feature-img" />
        <div className="about-feature-overlay">
          <h3>The café</h3>
          <h2>Café Chocolate</h2>
          <p className="about-feature-body">
            A cozy escape in the heart of Stratford Avenue, serving indulgent
            chocolate brownies, cookies, cakes, and handcrafted beverages —
            made by sisters Navodya and Amandya Weerathunga.
          </p>
          <div className="about-meta-row">
            <div className="about-meta">
              <span className="about-meta-label">Locations</span>
              <span>No.8, Stratford Avenue</span>
              <span>Old Kotte Road, Welikada Rajagiriya</span>
            </div>
            <div className="about-meta">
              <span className="about-meta-label">Instagram</span>
              <span>@chocolate_clicks.lk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Studio intro */}
      <section className="about-intro">
        <h3>The studio</h3>
        <h1>Chocolate Clicks Art Studio</h1>
        <p>
          Hands-on workshops, guided sessions, and drop-in painting days — a
          creative outing with friends, or a private session for teams and
          parties.
        </p>
      </section>

      {/* Studio — two large images */}
      <section className="about-gallery">
        <div className="about-gallery-container">
          <div className="about-gallery-item">
            <img src={art4} alt="Studio painting session" />
          </div>
          <div className="about-gallery-item">
            <img src={art3} alt="Finished artwork on display" />
          </div>
        </div>
      </section>

      {/* Studio — full-bleed image with overlaid details */}
      <section className="about-feature">
        <img src={art1} alt="Guests painting together" className="about-feature-img" />
        <div className="about-feature-overlay">
          <h3>Visit the studio</h3>
          <h2>No.17, Stratford Avenue</h2>
          <div className="about-meta-row">
            <div className="about-meta">
              <span className="about-meta-label">Location</span>
              <span>No.17, Stratford Avenue, Colombo, Sri Lanka 00600</span>
            </div>
            <div className="about-meta">
              <span className="about-meta-label">Instagram</span>
              <span>@art_studio_by_chocolate_clicks.lk</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}