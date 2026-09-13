import React, { useEffect, useRef, useState } from 'react';

import brownie1 from '../assets/brownie1.png';
import brownie2 from '../assets/brownie2.jpeg';
import brownie3 from '../assets/brownie3.jpeg';
import cookie1 from '../assets/cookie1.jpeg';
import cookie2 from '../assets/cookie2.jpeg';
import cookie3 from '../assets/cookie3.jpeg';
import cake from '../assets/cake.jpeg';
import cake2 from '../assets/cake2.png';
import cake3 from '../assets/cake3.jpeg';
import cafe from '../assets/cafe.jpg';
import cafe2 from '../assets/cafe2.jpg';
import cafe3 from '../assets/cafe3.jpg';
import './FoodItems.css';

// Local menu data — can migrate to a MongoDB "Menu" collection later.
const MENU = [
  {
    slug: 'brownies',
    name: 'Brownies',
    description: 'A fudgy, chocolate-loaded bake finished with a decadent topping.',
    images: [brownie1, brownie2, brownie3],
    items: [
      { name: 'Classic Fudge', price: 'LKR 850' },
      { name: 'Nutella', price: 'LKR 950', soldOut: true },
      { name: 'Kinder Bueno', price: 'LKR 1050' },
      { name: 'Cookie & Brownie', price: 'LKR 950' },
      { name: 'Oreo Brownie', price: 'LKR 900' },
    ],
  },
  {
    slug: 'cookies',
    name: 'Cookies',
    description: 'Soft-baked and packed with rich chocolate in every bite.',
    images: [cookie1, cookie2, cookie3],
    items: [
      { name: 'Chocolate Chip', price: 'LKR 350' },
      { name: 'Nutella Chocolate Chip', price: 'LKR 450' },
      { name: 'Kinder Bueno Chocolate Chip', price: 'LKR 500' },
      { name: 'Chocolate Fudge Cookie', price: 'LKR 400' },
      { name: 'Biscoff Chocolate Chip', price: 'LKR 480', soldOut: true },
    ],
  },
  {
    slug: 'vanilla-cakes',
    name: 'Vanilla Cakes',
    description: 'A light vanilla sponge layered with fresh, seasonal flavor.',
    images: [cake, cake2, cake3],
    items: [
      { name: 'Classic Milk Vanilla', price: 'LKR 2200' },
      { name: 'Blueberry Vanilla', price: 'LKR 2600' },
      { name: 'Raspberry Vanilla', price: 'LKR 2600' },
      { name: 'Fruit Salad Vanilla', price: 'LKR 2800' },
      { name: 'Caramelized Nuts Loaded Vanilla', price: 'LKR 3000' },
      { name: 'Strawberry Vanilla', price: 'LKR 2600' },
      { name: 'Nutella Vanilla', price: 'LKR 2900' },
      { name: 'Blackberry Vanilla', price: 'LKR 2700' },
      { name: 'Pineapple Vanilla', price: 'LKR 2500' },
      { name: 'Salted Caramel Vanilla', price: 'LKR 2900' },
      { name: 'Cherry Vanilla', price: 'LKR 2700' },
    ],
  },
  {
    slug: 'coffee-cakes',
    name: 'Coffee Cakes',
    description: 'A moist coffee-infused sponge with a smooth, aromatic finish.',
    images: [cafe, cafe2, cafe3],
    items: [
      { name: 'Coffee Brownie', price: 'LKR 2600' },
      { name: 'Coffee Tiramisu', price: 'LKR 3200' },
      { name: 'Classic Coffee', price: 'LKR 2400' },
      { name: 'Coffee Caramel', price: 'LKR 2800' },
      { name: 'Coffee Nutty', price: 'LKR 2900' },
      { name: 'Mocha', price: 'LKR 2700', soldOut: true },
      { name: 'Coffee Cream Cheese', price: 'LKR 3000' },
    ],
  },
  {
    slug: 'chocolate-cakes',
    name: 'Chocolate Cakes',
    description: 'A rich chocolate sponge finished with indulgent layers.',
    images: [cake2, cake3, cake],
    items: [
      { name: 'Oreo Chocolate', price: 'LKR 2900' },
      { name: 'Snicker Cake', price: 'LKR 3100' },
      { name: 'Raspberry Chocolate', price: 'LKR 2800' },
      { name: 'Rich Classic Chocolate', price: 'LKR 2500' },
      { name: 'Kinder Bueno Chocolate', price: 'LKR 3200' },
      { name: 'Peanut Butter Chocolate', price: 'LKR 3000' },
      { name: 'Kitkat Chocolate Fudge', price: 'LKR 3100', soldOut: true },
      { name: 'Coffee and Chocolate', price: 'LKR 2900' },
      { name: 'Chocolate & Salted Caramel', price: 'LKR 3000' },
    ],
  },
];

function MenuItemCard({ item, image, description }) {
  return (
    <div className="menu-card">
      <div className="menu-card-image-wrap">
        <img src={image} alt={item.name} />
        {item.soldOut && <span className="sold-out-badge">Sold Out</span>}
      </div>
      <div className="menu-card-body">
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-desc">{description}</p>
        <div className="menu-card-footer">
          <span className="menu-card-price">{item.price}</span>
          <button className="menu-add-btn" disabled={item.soldOut}>
            {item.soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FoodItems() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function jumpToCategory(slug) {
    setDropdownOpen(false);
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        <h1>Our Menu</h1>
        <p>Freshly baked cakes, brownies and cookies made with premium chocolate.</p>
      </section>

      {/* Sticky category nav */}
      <div className="menu-category-nav">
        <div className="menu-dropdown" ref={dropdownRef}>
          <button
            className="menu-dropdown-toggle"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            Our Menu <span aria-hidden="true">{dropdownOpen ? '▴' : '▾'}</span>
          </button>

          {dropdownOpen && (
            <ul className="menu-dropdown-list" role="listbox">
              {MENU.map((category) => (
                <li key={category.slug}>
                  <button
                    className="menu-dropdown-item"
                    onClick={() => jumpToCategory(category.slug)}
                  >
                    <span>{category.name}</span>
                    <span className="count">({category.items.length})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Menu sections */}
      {MENU.map((category) => (
        <section key={category.slug} id={category.slug} className="menu-section">
          <h2 className="menu-section-heading">
            {category.name} <span className="menu-section-count">({category.items.length})</span>
          </h2>
          <p className="menu-section-desc">{category.description}</p>

          <div className="menu-grid">
            {category.items.map((item, index) => (
              <MenuItemCard
                key={item.name}
                item={item}
                image={category.images[index % category.images.length]}
                description={category.description}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
