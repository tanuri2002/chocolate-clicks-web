import React, { useEffect, useState } from 'react';
import './About.css';
import cafe from '../assets/cafe.jpg';
import cafe2 from '../assets/cafe2.jpg';
import cafe3 from '../assets/cafe3.jpg';
import art1 from '../assets/art1.jpeg';
import art3 from '../assets/art3.jpg';
import art4 from '../assets/art4.jpg';

export default function About() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cafeImages = [cafe, cafe2, cafe3];

  // using the same local images for studio placeholders; replace with studio-specific assets as needed
  const studioImages = [art4, art3, art1];

  return (
    <div className="about-page">
      <div className={`about-content ${mounted ? 'mounted' : 'unmounted'}`}>

        {/* SECTION 1 - Café Chocolate */}
        <section className="about-section">
          <div className="about-text text-left">
            <h1>Café Chocolate by Chocolate Clicks</h1>
            <div>
            <p className="text-gray-200 text-left leading-relaxed md:ml-6">
              A cozy escape in the heart of Stratford Avenue, serving indulgent chocolate brownies, cookies, cakes, and handcrafted beverages. What began as a home-based passion project by sisters Navodya and Amandya Weerathunga during lockdown has grown into a beloved café known for its signature treats and warm atmosphere.
            </p>
            </div>
            <div className="meta text-left" style={{ paddingTop: '1.25rem' }}>
              <strong>Locations:</strong>
              <div>No.8, Stratford Avenue</div>
              <div>Old Kotte Road, Welikada Rajagiriya</div>
            </div>

            <div className="meta text-left">
              <strong>Instagram:</strong>
              <div>@chocolate_clicks.lk</div>
            </div>
          </div>

          <div className="about-images">
            <div className="image-card img-left-top">
              <img src={cafeImages[0]} alt="cafe-top-left" />
            </div>

            <div className="image-card img-right">
              <img src={cafeImages[1]} alt="cafe-right" />
            </div>

            <div className="image-card img-left-bottom">
              <img src={cafeImages[2]} alt="cafe-bottom-left" />
            </div>
          </div>
        </section>

        {/* SECTION 2 - Art Studio (alternate layout) */}
        <section className="studio-section">
          <div className="about-images">
            {studioImages.map((src, idx) => (
              <div key={idx} className="image-card">
                <img src={src} alt={`studio-${idx}`} />
              </div>
            ))}
          </div>

          <div className="studio-inner text-left">
            <h2>Chocolate Clicks Art Studio</h2>

            <p className='text-left'>
              Visit our Art Studio for hands-on workshops, guided sessions and drop-in painting days. Perfect for a creative outing with friends or a private booked session for teams and parties.
            </p>

            <div className="meta text-left" style={{ paddingTop: '1.25rem' }}>
              <strong>Location:</strong>
              <div>No.17, Stratford Avenue, Colombo, Sri Lanka 00600</div>
            </div>

            <div className="meta text-left">
              <strong>Instagram:</strong>
              <div>@art_studio_by_chocolate_clicks.lk</div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
