import React, { useEffect, useRef, useState } from 'react';
import { useCart } from './context/CartContext';
import { getMenuItems } from '../api';
import './FoodItems.css';

// ── Canonical category metadata (order + subtitle) ────────────────────────
// Matches the original hardcoded MENU. Category names must match exactly
// what the admin stores in the `category` field in MongoDB.
const CATEGORY_META = [
  { name: 'Cakes',            slug: 'cakes',             description: 'Handcrafted cakes baked to perfection for every celebration.' },
  { name: 'Brownies',         slug: 'brownies',          description: 'A fudgy, chocolate-loaded bake finished with a decadent topping.' },
  { name: 'Cupcakes',         slug: 'cupcakes',          description: 'Tiny treats packed with rich chocolate and luscious toppings.' },
  { name: 'Cookies',          slug: 'cookies',           description: 'Soft-baked and packed with rich chocolate in every bite.' },
  { name: 'Vanilla Cakes',    slug: 'vanilla-cakes',     description: 'A light vanilla sponge layered with fresh, seasonal flavor.' },
  { name: 'Coffee Cakes',     slug: 'coffee-cakes',      description: 'A moist coffee-infused sponge with a smooth, aromatic finish.' },
  { name: 'Chocolate Cakes',  slug: 'chocolate-cakes',   description: 'A rich chocolate sponge finished with indulgent layers.' },
];

// ── Per-card component ────────────────────────────────────────────────────
function MenuItemCard({ item }) {
  const { addItem, cart } = useCart();
  const [added, setAdded] = useState(false);

  const cartQty = cart[item._id]?.quantity || 0;
  const maxPerOrder = typeof item.maxPerOrder === 'number' && item.maxPerOrder > 0 ? item.maxPerOrder : 10;
  const isSpecial = cartQty > maxPerOrder;

  function handleAdd() {
    if (item.inStock === false || item.isActive === false) return;
    addItem({
      _id: item._id,         // real MongoDB ObjectId string
      name: item.name,
      price: item.price,     // Number from the API
      imageUrl: item.imageUrl ?? '',
      inStock: item.inStock !== false,
      maxPerOrder,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <div className={`menu-card ${isSpecial ? 'menu-card-special-order' : ''}`}>
      <div className="menu-card-image-wrap">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <div className="menu-card-img-placeholder" aria-hidden="true" />}
        {!item.inStock && <span className="sold-out-badge">Sold Out</span>}
        {isSpecial && <span className="special-order-badge">Special Order ({cartQty})</span>}
      </div>
      <div className="menu-card-body">
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-desc">{item.description}</p>

        {isSpecial && (
          <div className="menu-card-special-notice" role="alert">
            Orders above {maxPerOrder} of an item are special orders. The owner will review your request and email you if it's accepted.
          </div>
        )}

        <div className="menu-card-footer">
          <div className="menu-card-price-wrap">
            <span className="menu-card-price">LKR {item.price.toLocaleString()}</span>
            <span className="menu-card-max-note">Max: {maxPerOrder}/order</span>
          </div>
          <button
            className="menu-add-btn"
            disabled={item.inStock === false || item.isActive === false}
            onClick={handleAdd}
            aria-label={!item.inStock ? 'Sold out' : `Add ${item.name} to cart`}
          >
            {item.inStock === false || item.isActive === false ? 'Sold Out' : added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function FoodItems() {
  const { isSpecialOrder } = useCart();
  // itemsByCategory: Map<categoryName, item[]>
  const [itemsByCategory, setItemsByCategory] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch from GET /api/menu on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getMenuItems();
        if (!cancelled) {
          // Group flat item array by category name
          const map = new Map();
          for (const item of data.items ?? []) {
            const cat = item.category || 'Other';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push(item);
          }
          setItemsByCategory(map);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Close dropdown on outside click
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

  // Ordered list: known categories first (in CATEGORY_META order),
  // then any extra categories that exist in DB but aren't in CATEGORY_META.
  const knownNames = new Set(CATEGORY_META.map((m) => m.name));
  const extraCategories = [...itemsByCategory.keys()]
    .filter((name) => !knownNames.has(name))
    .map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), description: '' }));

  const orderedCategories = [...CATEGORY_META, ...extraCategories].filter(
    (meta) => itemsByCategory.has(meta.name)
  );

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="menu-page">
        <section className="menu-hero">
          <h1>Our Menu</h1>
          <p style={{ color: '#ababab' }}>Loading items…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <section className="menu-hero">
          <h1>Our Menu</h1>
          <p style={{ color: '#c98b3b' }}>{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        <h1>Our Menu</h1>
        <p>Freshly baked cakes, brownies and cookies made with premium chocolate.</p>
        {isSpecialOrder && (
          <div className="menu-special-order-banner" role="alert">
            <span className="banner-icon">ℹ️</span>
            <span>
              <strong>Special Order Notice:</strong> One or more items in your cart exceed the regular order limit. The owner will review your request and email you if it's accepted.
            </span>
          </div>
        )}
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
              {orderedCategories.map((meta) => (
                <li key={meta.name}>
                  <button
                    className="menu-dropdown-item"
                    onClick={() => jumpToCategory(meta.slug)}
                  >
                    <span>{meta.name}</span>
                    <span className="count">({itemsByCategory.get(meta.name).length})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Menu sections — canonical order, with subtitle */}
      {orderedCategories.map((meta) => {
        const items = itemsByCategory.get(meta.name);
        return (
          <section key={meta.name} id={meta.slug} className="menu-section">
            <h2 className="menu-section-heading">
              {meta.name} <span className="menu-section-count">({items.length})</span>
            </h2>
            {meta.description && (
              <p className="menu-section-desc">{meta.description}</p>
            )}

            <div className="menu-grid">
              {items.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      {orderedCategories.length === 0 && (
        <p style={{ textAlign: 'center', color: '#ababab', padding: '4rem 1rem' }}>
          No menu items available yet.
        </p>
      )}
    </div>
  );
}
