import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkshops } from "../api";
import "./MaskWorkshop.css";
import "./BakeItHappen.css";

export default function BakeItHappen() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [workshopError, setWorkshopError] = useState("");
  const [layeredVisible, setLayeredVisible] = useState(false);
  const layeredRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLayeredVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (layeredRef.current) {
      observer.observe(layeredRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getWorkshops("upcoming", "bake"), getWorkshops("past", "bake")])
      .then(([upcomingData, pastData]) => {
        if (cancelled) return;
        setUpcoming(upcomingData.workshops || []);
        setPast(pastData.workshops || []);
      })
      .catch((error) => {
        if (!cancelled) setWorkshopError(error.message || "Workshop information is unavailable.");
      });
    return () => { cancelled = true; };
  }, []);

  const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));

  return (
    <section className="mask-workshop-page bake-workshop-page">
      <div className="bake-top-bar">
        <button
          type="button"
          className="bake-back-nav-btn"
          onClick={() => navigate("/events")}
        >
          ← Back to Events
        </button>
      </div>

      <div className="mask-workshop-top">
        <div className="mask-workshop-text">
          <h1>Bake It Happen</h1>
          <h3>Join us for a Hands-on Baking &amp; Cake Art Masterclass</h3>
          <p>
            Bake, assemble, and decorate your own cake with step by step guidance
            <br />
            Sip on your favorite drink &amp; enjoy yummy snacks from Chocolate Clicks
          </p>
        </div>

        <div className="mask-triangle">
          <img src="/front_img/solo-left.jpeg" alt="Baking cake top" className="mask-top" />
          <img src="/front_img/big-left1.jpeg" alt="Baking studio left" className="mask-bottom-left" />
          <img src="/front_img/Big-picR.jpeg" alt="Artisan dessert right" className="mask-bottom-right" />
        </div>
      </div>

      <div className="mask-gallery">
        <div className="mask-gallery-card left-col">
          <img src="/front_img/big-left1.jpeg" alt="Baking moment 1" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="/front_img/Big-picR.jpeg" alt="Baking moment 2" />
          <div className="overlay-copy">
            <p>Witness how passion and imagination come alive in every cake.</p>
          </div>      
        </div>

        <div className="mask-gallery-card left-col">
          <img src="/front_img/solo-left.jpeg" alt="Baking moment 3" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="/front_img/solo-right.jpeg" alt="Baking moment 4" />
          <div className="overlay-copy">
            <p>Learn the secrets of artisanal baking and cake decoration</p>
          </div>
        </div>

        <div className="mask-gallery-card left-col">
          <img src="/front_img/Big-picR.jpeg" alt="Baking moment 5" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="/front_img/solo-left.jpeg" alt="Baking moment 6" />
          <div className="overlay-copy">
            <p>Take home your delicious hand-decorated creation</p>
          </div>
        </div>
      </div>

      <section className="workshop-public-section" id="upcoming-workshops" aria-labelledby="upcoming-bake-heading">
        <p className="workshop-public-kicker">Make something delicious with us</p>
        <h2 id="upcoming-bake-heading">Upcoming workshops</h2>
        {workshopError && <p className="workshop-public-message" role="status">{workshopError}</p>}
        {!workshopError && upcoming.length === 0 && (
          <p className="workshop-public-message">No upcoming Bake It Happen workshops are scheduled right now.</p>
        )}
        <div className="public-workshop-grid">
          {upcoming.map((workshop) => (
            <article className="public-workshop-card" key={workshop._id}>
              <img src={workshop.bannerUrl} alt={`${workshop.title} banner`} />
              <div className="public-workshop-card-content">
                <span className="bake-card-category-tag">Bake It Happen</span>
                <p className="public-workshop-date">{formatDate(workshop.date)}</p>
                <h3>{workshop.title}</h3>
                <p>{workshop.description}</p>
                <p className="public-workshop-location">{workshop.location}</p>
                <p className="public-workshop-count">{workshop.registrationCount || 0} registered</p>
                <button type="button" onClick={() => navigate(`/workshop/${workshop._id}/register`)}>
                  Register
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="layered-editions-section">
        <h2 className="editions-heading">Past workshops</h2>
        <p className="past-workshop-count">{past.length} previous workshop{past.length === 1 ? "" : "s"}</p>
        {past.length > 0 && (
          <div className="past-workshop-list">
            {past.map((workshop) => (
              <article className="past-workshop-item" key={workshop._id}>
                <img src={workshop.bannerUrl} alt={`${workshop.title} banner`} />
                <div>
                  <h3>{workshop.title}</h3>
                  <p>{formatDate(workshop.date)} · {workshop.location}</p>
                  <p>{workshop.registrationCount || 0} registered</p>
                </div>
              </article>
            ))}
          </div>
        )}
        
        <div ref={layeredRef} className={`layered-images-container ${layeredVisible ? 'animate-in' : ''}`}>
          {/* Bottom layer - 2 images */}
          <div className="layer-bottom">
            <img src="/front_img/solo-left.jpeg" alt="Bake edition 1" className="bottom-left" />
            <img src="/front_img/solo-right.jpeg" alt="Bake edition 2" className="bottom-right" />
          </div>

          {/* Middle layer - 2 images */}
          <div className="layer-middle">
            <img src="/front_img/big-left1.jpeg" alt="Bake edition 3" className="middle-left" />
            <img src="/front_img/Big-picR.jpeg" alt="Bake edition 4" className="middle-right" />
          </div>

          {/* Top layer - 1 image with shadow */}
          <div className="layer-top">
            <img src="/front_img/Big-picR.jpeg" alt="Bake edition 5" className="top-shadow" />
          </div>
        </div>

        <h2 className="editions-closing">Stay tuned for more<br/>sweet moments<br/>ahead!</h2>
      </div>
    </section>
  );
}
