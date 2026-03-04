import React from "react";
import "./MaskWorkshop.css";

export default function MaskWorkshop() {
  return (
    <section className="mask-workshop-page">
      <div className="mask-workshop-top">
        <div className="mask-workshop-text">
          <h1>Wes Mask Painting Workshop</h1>
          <h3>Join us for a Creative &amp; Fun Mask Painting Workshop</h3>
          <p>
            Paint your own mask unique mask with easy step by step guidance
            <br />
            Sip on your favorite drink &amp; enjoy yummy snacks from Chocolate
            Click
          </p>
        </div>

        <div className="mask-triangle">
          <img src="/front_img/mask1.png" alt="Mask one" className="mask-top" />
          <img src="/front_img/mask2.png" alt="Mask two" className="mask-bottom-left" />
          <img src="/front_img/mask3.png" alt="Mask three" className="mask-bottom-right" />
        </div>
      </div>

      <div className="mask-gallery">
        <div className="mask-gallery-card left-col">
          <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.30 (1).jpeg" alt="Workshop moment 1" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.31.jpeg" alt="Workshop moment 2" />
          <div className="overlay-copy">
            <p>Witness how history and imagination come alive in every mask.</p>
          </div>        </div>

        <div className="mask-gallery-card left-col">
          <img src="/front_img/mask1.jpeg" alt="Workshop moment 3" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.37.jpeg" alt="Workshop moment 4" />
          <div className="overlay-copy">
            <p>Learn the cultural and artistic value of mask art</p>
          </div>
        </div>

        <div className="mask-gallery-card left-col">
          <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.32.jpeg" alt="Workshop moment 5" />
        </div>
        <div className="mask-gallery-card right-col with-overlay">
          <img src="\front_img\WhatsApp Image 2026-01-20 at 22.31.38.jpeg" alt="Workshop moment 6" />
          <div className="overlay-copy">
            <p>Take home your hand-painted mask</p>
          </div>
        </div>
      </div>

      <div className="layered-editions-section">
        <h2 className="editions-heading">10 editions down</h2>
        
        <div className="layered-images-container">
          {/* Bottom layer - 2 images */}
          <div className="layer-bottom">
            <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.52.jpeg" alt="Edition poster 1" className="bottom-left" />
            <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.56.jpeg" alt="Edition poster 2" className="bottom-right" />
          </div>

          {/* Middle layer - 2 images */}
          <div className="layer-middle">
            <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.57 (1).jpeg" alt="Edition poster 3" className="middle-left" />
            <img src="/front_img/WhatsApp Image 2026-01-20 at 22.31.59.jpeg" alt="Edition poster 4" className="middle-right" />
          </div>

          {/* Top layer - 1 image with shadow */}
          <div className="layer-top">
            <img src="/front_img/WhatsApp Image 2026-01-20 at 22.32.00 (1).jpeg" alt="Edition poster 5" className="top-shadow" />
          </div>
        </div>

        <h2 className="editions-closing">stay tuned for more<br/>colorful moments<br/>ahead!</h2>
      </div>
    </section>
  );
}