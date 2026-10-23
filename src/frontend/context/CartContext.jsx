import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// ── Storage key ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'cc_cart_v2';

// ── Shape helpers ──────────────────────────────────────────────────────────
// Cart state: { [id]: { id, name, price, imageUrl, quantity, maxPerOrder } }

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {};

    const clean = {};
    for (const [key, entry] of Object.entries(parsed)) {
      const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
      if (
        entry &&
        typeof entry.id === 'string' && OBJECT_ID_RE.test(entry.id) &&
        typeof entry.name === 'string' &&
        typeof entry.price === 'number' && isFinite(entry.price) &&
        typeof entry.quantity === 'number' && entry.quantity > 0
      ) {
        clean[key] = {
          ...entry,
          maxPerOrder: typeof entry.maxPerOrder === 'number' && entry.maxPerOrder > 0 ? entry.maxPerOrder : 10,
        };
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Silently swallow storage errors
  }
}

// ── Reducer ────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action;
      const existing = state[item.id];
      const maxPerOrder = item.maxPerOrder || existing?.maxPerOrder || 10;
      return {
        ...state,
        [item.id]: existing
          ? { ...existing, quantity: existing.quantity + 1, maxPerOrder }
          : {
              id: item.id,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrl ?? '',
              maxPerOrder,
              quantity: 1,
            },
      };
    }
    case 'REMOVE_ITEM': {
      const next = { ...state };
      delete next[action.id];
      return next;
    }
    case 'UPDATE_QUANTITY': {
      const { id, qty } = action;
      if (qty <= 0) {
        const next = { ...state };
        delete next[id];
        return next;
      }
      if (!state[id]) return state;
      return { ...state, [id]: { ...state[id], quantity: qty } };
    }
    case 'CLEAR_CART':
      return {};
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, {}, loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist every time cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // ── Public API ─────────────────────────────────────────────────────────
  /**
   * Add a menu item to the cart.
   * Refuses items where inStock === false or isActive === false.
   */
  function addItem(menuItem) {
    if (menuItem.inStock === false || menuItem.isActive === false) return;
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: menuItem._id ?? menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        imageUrl: menuItem.imageUrl ?? '',
        maxPerOrder: typeof menuItem.maxPerOrder === 'number' && menuItem.maxPerOrder > 0 ? menuItem.maxPerOrder : 10,
      },
    });
  }

  function removeItem(id) {
    dispatch({ type: 'REMOVE_ITEM', id });
  }

  function updateQuantity(id, qty) {
    dispatch({ type: 'UPDATE_QUANTITY', id, qty });
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' });
  }

  // ── Derived values ──────────────────────────────────────────────────────
  const items = Object.values(cart);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Special order detection: true if any item's quantity exceeds its maxPerOrder
  const specialItems = items.filter((item) => item.quantity > (item.maxPerOrder || 10));
  const isSpecialOrder = specialItems.length > 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalItems,
        subtotal,
        isSpecialOrder,
        specialItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
