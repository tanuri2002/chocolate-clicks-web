import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        {/* Background Image */}
        <img src="/front_img/hero.jpg" alt="Chocolate" className="hero-img" />

        {/* Dark overlay */}
        <div className="hero-overlay"></div>

        {/* Text Content */}
        <div className="hero-text">
          <h1>Sweeten Your Day with Chocolate Clicks!</h1>
          <p>Where Every Slice Tells a Sweet Story</p>
        </div>

        {/* Uneven bottom wave */}
        <svg
          className="hero-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L120,74.7C240,85,480,107,720,96C960,85,1200,43,1320,21.3L1440,0L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
            fill="#0f0f0f"
          />
        </svg>

        {/* Logo */}
        <div className="logo-wrapper">
          <img src="/front_img/logo.jpeg" alt="Cafe Chocolate" />
        </div>
      </section>

      {/* Section 1: Clashed Image with Text */}
      <section className="section-1">
        <div className="section-content">
          <div className="text-block">
            <h2>Our patisserie produces unique sweets for lovers of yummy</h2>
            <p>unique sweets for lovers of yummy</p>
          </div>
          <div className="clashed-image-container">
            <img src="/front_img/second.jpg" alt="Sweets" className="clashed-image" />
          </div>
        </div>
      </section>

      {/* Section 2: Text on Image */}
      <section className="section-2">
        <img src="/front_img/third.jpg" alt="Products" className="section-2-img" />
        <div className="section-2-overlay">
          <h2>Made with love</h2>
          <p>unique sweet for gourmet</p>
        </div>
      </section>

      {/* Section 3: Normal Text Section */}
      <section className="section-3">
        <div className="section-3-content">
          <h3>Online Store</h3>
          <h2>Discover Sweet Delicious</h2>
        </div>
      </section>

      {/* Section 4: Two Column Image Gallery */}
      <section className="section-4">
        <div className="gallery-container">
          {/* Left Image */}
          <div className="gallery-item left">
            <img src="/front_img/l1.jpeg" alt="Brownies" />
            <div className="overlay overlay-top">
              <h3>Brownies</h3>
              <p>The beautiful frosty days</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="gallery-item right">
            <img src="/front_img/r1.jpeg" alt="Cake" />
            <div className="overlay overlay-bottom">
              <h3>Cake</h3>
              <p>Joyful moments that deserve extra love</p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 4: Two Column Image Gallery */}
      <section className="section-4">
        <div className="gallery-container">
          {/* Left Image */}
          <div className="gallery-item left">
            <img src="\front_img\lef2.jpeg" />
            <div className="overlay overlay-top">
              <h3>Brownies</h3>
              <p>The beautiful frosty days</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="gallery-item right">
            <img src="\front_img\right2.jpeg" />
            <div className="overlay overlay-bottom">
              <h3>Cake</h3>
              <p>Joyful moments that deserve extra love</p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 4: Two Column Image Gallery */}
      <section className="section-4">
        <div className="gallery-container">
          {/* Left Image */}
          <div className="gallery-item left">
            <img src="\front_img\cooki1.jpeg" />
            <div className="overlay overlay-top">
              <h3>Brownies</h3>
              <p>The beautiful frosty days</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="gallery-item right">
            <img src="\front_img\cooki2.jpeg" />
            <div className="overlay overlay-bottom">
              <h3>Cake</h3>
              <p>Joyful moments that deserve extra love</p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 4: Two Column Image Gallery */}
      <section className="section-4">
        <div className="gallery-container">
          {/* Left Image */}
          <div className="gallery-item left">
            <img src="/front_img/l1.jpeg" alt="Brownies" />
            <div className="overlay overlay-top">
              <h3>Brownies</h3>
              <p>The beautiful frosty days</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="gallery-item right">
            <img src="/front_img/r1.jpeg" alt="Cake" />
            <div className="overlay overlay-bottom">
              <h3>Cake</h3>
              <p>Joyful moments that deserve extra love</p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 3: Normal Text Section */}
      <section className="section-3">
        <div className="section-3-content">
         
          <h2>Special Editions from us</h2>
        </div>
      </section>
      {/* Section 5: Two Column Image Gallery */}
      <section className="section-5">
        <div className="gallery-containersection5">
          {/* Left Image */}
          <div className="gallery-item bigleft">
            <img src="\front_img\big-left1.jpeg" alt="big-left" />
          </div>

          {/* Right Image */}
          <div className="gallery-item bigright">
            <img src="\front_img\Big-picR.jpeg" alt="big-right" />
            
          </div>
        </div>
      </section>

      {/* Section 5: Two Column Image Gallery */}
      <section className="section-5">
        <div className="gallery-containersection5">
          {/* Left para */}
          <div className="gallery-itemleftpara">
            <p>one bite at a time. Taste our finest cakes and desserts, crafted to delight your senses and make every moment special</p>

          </div>

          {/* Right Image */}
          <div className="gallery-item bigright">
            <img src="\front_img\solo-right.jpeg" alt="big-right" />
            
          </div>
        </div>
      </section>

      {/* Section 5: Two Column Image Gallery */}
      <section className="section-5">
        <div className="gallery-containersection5">
          {/* Left Image */}
          <div className="gallery-item bigleft">
            <img src="\front_img\solo-left.jpeg" alt="big-left" />
          </div>

          {/* Right Image */}
          <div className="gallery-itemleftpara">
            <p>Roll up your sleeves and bring your cake ideas to life! Learn, bake, and decorate under expert guidance — and take home your masterpiece</p>
          </div>
        </div>
      </section>

      {/* Section 3: Normal Text Section */}
      <section className="section-3">
        <div className="section-3-content">
          <h3>Unleash your creativity with color and flavor! </h3>
          <h2>Events & Experiences</h2>
        </div>
      </section>

    </>
  );
}
