import './App.css'
import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import Home from "./frontend/Home";
import Login from "./frontend/Login";
import SignUp from "./frontend/SignUp";
import Payment from "./frontend/Payment";
import Dashboard from './frontend/Dashboard';
import FoodItems from "./frontend/FoodItems";
import MaskWorkshop from "./frontend/MaskWorkshop";
import About from './frontend/About';
import Cakes from './frontend/cakes';
import ShoppingCart from './frontend/Shoppingcart';
import YourHome from './assets/frontend/Home'
import YourPayment from './assets/frontend/Payment'
import ScrollToTop from './ScrollToTop';

function App() {
  // ── Cart state: single source of truth ──────────────────────────
  // Initialise from localStorage so cart survives a page refresh
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cakes_cart");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Keep localStorage in sync whenever cart changes
  useEffect(() => {
    localStorage.setItem("cakes_cart", JSON.stringify(cart));
  }, [cart]);

  // ── Cart helpers (pass these down to any page that needs them) ───
  function addToCart(item) {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[item.id]) {
        copy[item.id] = { ...copy[item.id], qty: copy[item.id].qty + 1 };
      } else {
        copy[item.id] = { ...item, qty: 1 };
      }
      return copy;
    });
  }

  function removeFromCart(id) {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  function updateQty(id, delta) {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id] = { ...copy[id], qty: copy[id].qty + delta };
      if (copy[id].qty <= 0) delete copy[id];
      return copy;
    });
  }

  function clearCart() {
    setCart({});
  }

  return (
    <>
    <ScrollToTop />
      <Navbar cart={cart} />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food" element={<FoodItems />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Cart — pass cart state + helpers */}
          <Route
            path="/cart"
            element={
              <ShoppingCart
                cart={cart}
                onUpdateQty={updateQty}
                onRemove={removeFromCart}
              />
            }
          />

          {/* Payment — receives cart as props, clears it on success */}
          <Route
            path="/payment"
            element={
              <Payment
                cart={cart}
                onClearCart={clearCart}
              />
            }
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<FoodItems />} />
          <Route path="/mask-workshop" element={<MaskWorkshop />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/cakes"
            element={<Cakes onAddToCart={addToCart} cart={cart} />}
          />

          {/* Original routes preserved */}
          <Route path="/my-home" element={<YourHome />} />
          <Route path="/my-payment" element={<YourPayment />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;