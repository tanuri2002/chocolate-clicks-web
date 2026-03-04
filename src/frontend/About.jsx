import React, { useEffect, useState } from 'react';
import './About.css';
import cake from '../assets/cake.jpeg';
import cake2 from '../assets/cake2.png';
import cake3 from '../assets/cake3.jpeg';

export default function About() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cafeImages = [cake, cake2, cake3];

  // using the same local images for studio placeholders; replace with studio-specific assets as needed
  const studioImages = [cake, cake2, cake3];

  return (
    <div className="about-page">
      <div className={`about-content ${mounted ? 'mounted' : 'unmounted'}`}>

        {/* SECTION 1 - Café Chocolate */}
        <section className="about-section">
          <div className="about-text">
            <h1>Café Chocolate by Chocolate Clicks</h1>
            <div>
            <p className="text-gray-200 text-left leading-relaxed md:ml-6">
              A cozy escape in the heart of Stratford Avenue, serving indulgent chocolate brownies, cookies, cakes, and handcrafted beverages. What began as a home-based passion project by sisters Navodya and Amandya Weerathunga during lockdown has grown into a beloved café known for its signature treats and warm atmosphere.
            </p>
            </div>
            <div className="meta" style={{ paddingTop: '1.25rem' }}>
              <strong>Locations:</strong>
              <div>No.8, Stratford Avenue</div>
              <div>Old Kotte Road, Welikada Rajagiriya</div>
            </div>

            <div className="meta">
              <strong>Instagram:</strong>
              <div>@chocolate_clicks.lk</div>
            </div>
          </div>

          <div className="about-images">
            {cafeImages.map((src, idx) => (
              <div key={idx} className="image-card">
                <img src={src} alt={`cafe-${idx}`} />
              </div>
            ))}
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

          <div className="studio-inner">
            <h2>Chocolate Clicks Art Studio</h2>

            <p className='text-left'>
              Visit our Art Studio for hands-on workshops, guided sessions and drop-in painting days. Perfect for a creative outing with friends or a private booked session for teams and parties.
            </p>

            <div className="meta">
              <strong>Location:</strong>
              <div>No.17, Stratford Avenue, Colombo, Sri Lanka 00600</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
