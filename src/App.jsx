import './App.css'
import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import Home from "./frontend/Home";
import Login from "./frontend/Login";
import ProtectedUserRoute from "./frontend/ProtectedUserRoute";
import Profile from "./frontend/Profile";
import ForgotPassword from "./frontend/ForgotPassword";
import ResetPassword from "./frontend/ResetPassword";
import SignUp from "./frontend/SignUp";
import AdminSignUp from "./frontend/AdminSignUp";
import Payment from "./frontend/Payment";
import ProtectedAdminRoute from './frontend/ProtectedAdminRoute';
import AdminDashboard from './frontend/AdminDashboard';
import AdminLayout from './frontend/AdminLayout';
import DashboardOverview from './frontend/DashboardOverview';
import OrdersPage from './frontend/OrdersPage';
import CustomersPlaceholder from './frontend/CustomersPlaceholder';
import MenuManagement from './frontend/MenuManagement';
import FoodItems from "./frontend/FoodItems";
import MaskWorkshop from "./frontend/MaskWorkshop";
import About from './frontend/About';
import WorkshopRegistration from './frontend/WorkshopRegistration';
import Cakes from './frontend/cakes';
import ShoppingCart from './frontend/Shoppingcart';
import YourHome from './assets/frontend/Home'
import YourPayment from './assets/frontend/Payment'
import ScrollToTop from './ScrollToTop';
import { CartProvider } from './frontend/context/CartContext';
import CartDrawer from './frontend/CartDrawer';
import Checkout from './frontend/Checkout';
import OrderSuccess from './frontend/OrderSuccess';
import OrderCancelled from './frontend/OrderCancelled';
import OurEvents from './frontend/OurEvents';
import BakeItHappen from './frontend/BakeItHappen';

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
    <CartProvider>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food" element={<FoodItems />} />
          <Route path="/items" element={<FoodItems />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Admin Dashboard with sub-routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPlaceholder />} />
            <Route path="menu" element={<MenuManagement />} />
          </Route>
          <Route path="/events" element={<OurEvents />} />
          <Route path="/bake-it-happen" element={<BakeItHappen />} />
          <Route path="/mask-workshop" element={<MaskWorkshop />} />
          <Route path="/about" element={<About />} />

          {/* Your original routes preserved with /my prefix */}
          <Route path="/my-home" element={<YourHome />} />
          <Route path="/my-payment" element={<YourPayment />} />
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/workshop/:id/register" element={<WorkshopRegistration />} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  );
}

export default App;