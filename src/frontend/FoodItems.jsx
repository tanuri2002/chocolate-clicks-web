import React from 'react';
import { useNavigate } from 'react-router-dom';

import login from '../assets/login.jpeg';
import cake from '../assets/cake.jpeg';
import cake2 from '../assets/cake2.png';
import cake3 from '../assets/cake3.jpeg';
import cookie1 from '../assets/cookie1.jpeg';
import cookie2 from '../assets/cookie2.jpeg';
import cookie3 from '../assets/cookie3.jpeg';
import brownie1 from '../assets/brownie1.png';
import brownie2 from '../assets/brownie2.jpeg';
import brownie3 from '../assets/brownie3.jpeg';
import './FoodItems.css';

export default function FoodItems() {
  const navigate = useNavigate();

  const cakes = [
    { id: 1, name: "Valentine's Berry Bomb", image: cake },
    { id: 2, name: 'Classic Vanilla Cake with Strawberry Toppings', image: cake2 },
    { id: 3, name: 'Lemon Blueberry Cake', image: cake3 },
  ];

  const cupcakes = [
    { id: 4, name: 'Classic Chocolate Chip Cookies', image: cookie3 },
    { id: 5, name: 'Red Velvet Cookies', image: cookie2 },
    { id: 6, name: 'Matcha White C/C Cookies', image: cookie1 },
  ];

  const brownies = [
    { id: 7, name: 'Nutella Topping Brownies', image: brownie1 },
    { id: 8, name: 'Marshmallow Topping Brownies', image: brownie2 },
    { id: 9, name: 'Oreo Topping Brownies', image: brownie3 },
  ];

  return (
    <div className="food-page">

      {/* Hero Section */}
      <section
        className="food-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${login}')`,
        }}
      >
        <div className="food-hero-content">
          <h1>Sweeten Your Day with Chocolate Clicks!</h1>
          <p>
            Explore our freshly baked delights — from cakes to brownies, each made with love and premium chocolate.
          </p>
          <a href="#products" className="hero-button">Shop Now</a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="food-products">

        {/* Cakes */}
        <div className="product-category">
          <h2>Cakes...</h2>
          <p>Celebrate every occasion with our beautifully crafted cakes.</p>

          <div className="product-grid">
            {cakes.map((cake) => (
              <div key={cake.id} className="product-card">
                <img src={cake.image} alt={cake.name} />
                <h3>{cake.name}</h3>
              </div>
            ))}
          </div>

          <button
            className="product-button"
            onClick={() => navigate("/cakes")}
          >
            See More Cakes →
          </button>
        </div>

        {/* Cookies */}
        <div className="product-category">
          <h2>Cookies...</h2>
          <p>Freshly baked cookies with rich flavors.</p>

          <div className="product-grid">
            {cupcakes.map((cookie) => (
              <div key={cookie.id} className="product-card">
                <img src={cookie.image} alt={cookie.name} />
                <h3>{cookie.name}</h3>
              </div>
            ))}
          </div>

          <button
            className="product-button"
            onClick={() => navigate("/cookies")}
          >
            See More Cookies →
          </button>
        </div>

        {/* Brownies */}
        <div className="product-category">
          <h2>Brownies...</h2>
          <p>Rich chocolate brownies with delicious toppings.</p>

          <div className="product-grid">
            {brownies.map((brownie) => (
              <div key={brownie.id} className="product-card">
                <img src={brownie.image} alt={brownie.name} />
                <h3>{brownie.name}</h3>
              </div>
            ))}
          </div>

          <button
            className="product-button"
            onClick={() => navigate("/brownies")}
          >
            See More Brownies →
          </button>
        </div>

      </section>
    </div>
  );
}