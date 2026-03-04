import React, { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className={`p-8 md:px-20  md:pt-12 pb-16  transition-transform duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>

        {/* SECTION 1 - Café Chocolate */}
        <section className="md:px-20 grid md:grid-cols-2 gap-10 items-center mb-20">
          <div className="space-y-6" style={{ fontFamily: 'Kalnia, serif' }}>
            <h1 style={{ fontFamily: 'Kalnia, serif' }} className="text-2xl md:text-3xl font-semibold text-white mb-4">Café Chocolate by Chocolate Clicks</h1>
            <div>
            <p className="text-gray-200 text-left leading-relaxed md:ml-6">
              A cozy escape in the heart of Stratford Avenue, serving indulgent chocolate brownies, cookies, cakes, and handcrafted beverages. What began as a home-based passion project by sisters Navodya and Amandya Weerathunga during lockdown has grown into a beloved café known for its signature treats and warm atmosphere.
            </p>
            </div>
            <div className="mt-4 text-sm text-gray-300 text-left pt-5">
              <strong className="text-amber-400">Locations:</strong>
              <div>No.8, Stratford Avenue</div>
              <div>Old Kotte Road, Welikada Rajagiriya</div>
            </div>

            <div className="mt-4 text-sm text-gray-300 text-left">
              <strong className="text-amber-400">Instagram:</strong>
              <div>@chocolate_clicks.lk</div>
            </div>
          </div>

          <div className="space-y-4">
            {cafeImages.map((src, idx) => (
              <div key={idx} className="h-44 md:h-56 overflow-hidden rounded-xl shadow-lg bg-neutral-900">
                <img
                  src={src}
                  alt={`cafe-${idx}`}
                  className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 - Art Studio (alternate layout) */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 order-2 md:order-1">
            {studioImages.map((src, idx) => (
              <div key={idx} className="h-44 md:h-56 overflow-hidden rounded-xl shadow-lg bg-neutral-900">
                <img
                  src={src}
                  alt={`studio-${idx}`}
                  className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="space-y-6 order-1 md:order-2 text-left" style={{ fontFamily: 'Kalnia, serif' }}>
            <h2 style={{ fontFamily: 'Kalnia, serif' }} className="text-3xl md:text-4xl font-semibold text-white mb-8">Chocolate Clicks Art Studio</h2>

            <p className="text-gray-200 leading-relaxed ml-2 md:ml-6">
              Visit our Art Studio for hands-on workshops, guided sessions and drop-in painting days. Perfect for a creative outing with friends or a private booked session for teams and parties.
            </p>

            <div className="mt-4 text-sm text-gray-300">
              <strong className="text-amber-400">Location:</strong>
              <div>No.17, Stratford Avenue, Colombo, Sri Lanka 00600</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
