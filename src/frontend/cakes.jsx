import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cakes.css";

export default function Cakes() {
  const theme = { brand: "#b88d4a", dark: "#0f0f0f" };
  const navigate = useNavigate();
  const sampleProducts = [
    { id: 1, name: "Classic Chocolate Cake", price: 2200, img: "/front_img/cake1.jpeg", desc: "Rich chocolate sponge with ganache" },
    { id: 2, name: "Vanilla Dream", price: 1850, img: "/front_img/cake2.jpeg", desc: "Light vanilla sponge with cream" },
    { id: 3, name: "Red Velvet", price: 2400, img: "/front_img/l1.jpeg", desc: "Velvety cake with cream cheese" },
    { id: 4, name: "Fruit Fiesta", price: 2000, img: "/front_img/r1.jpeg", desc: "Fresh fruits and vanilla cream" },
    { id: 5, name: "Birthday Special", price: 2600, img: "/front_img/big-left1.jpeg", desc: "Custom decorations for celebrations" },
    { id: 6, name: "Mini Cupcakes Box", price: 1200, img: "/front_img/cup1.jpeg", desc: "Assorted mini cupcakes" },
  ];

  const [products] = useState(sampleProducts);
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cakes_cart");
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("cakes_cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[product.id]) copy[product.id].qty += 1;
      else copy[product.id] = { ...product, qty: 1 };
      return copy;
    });
  }

  function changeQty(id, delta) {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id].qty += delta;
      if (copy[id].qty <= 0) delete copy[id];
      return copy;
    });
  }

  function clearCart() {
    setCart({});
  }

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="cakes-page">
      <header className="cakes-hero" style={{ backgroundColor: theme.dark }}>
        <h1>Our Cakes</h1>
        <p>Choose your favourite — handcrafted daily</p>
      </header>

      <div className="cakes-container">
        <main className="cakes-main">
          <div className="cakes-grid">
            {products.map((p) => (
              <div key={p.id} className="cake-card">
                <div className="cake-image">
                  <img src={p.img} alt={p.name} />
                </div>
                <div className="cake-body">
                  <h3>{p.name}</h3>
                  <p className="cake-desc">{p.desc}</p>
                  <div className="cake-footer">
                    <div className="price">LKR {p.price.toLocaleString()}</div>
                    <button
                      className="add-btn"
                      onClick={() => addToCart(p)}
                      style={{ backgroundColor: theme.brand }}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="cakes-cart">
          <div className="cart-inner">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
              <div className="empty">Cart is empty</div>
            ) : (
              <div className="cart-list">
                {cartItems.map((it) => (
                  <div className="cart-item" key={it.id}>
                    <img src={it.img} alt={it.name} />
                    <div className="meta">
                      <div className="name">{it.name}</div>
                      <div className="qty">
                        <button onClick={() => changeQty(it.id, -1)}>-</button>
                        <span>{it.qty}</span>
                        <button onClick={() => changeQty(it.id, +1)}>+</button>
                      </div>
                    </div>
                    <div className="item-price">LKR { (it.price * it.qty).toLocaleString() }</div>
                  </div>
                ))}

                <div className="cart-summary">
                  <div>Subtotal</div>
                  <div className="summary-price">LKR {subtotal.toLocaleString()}</div>
                </div>

                <div className="cart-actions">
                <button className="checkout" onClick={() => navigate('/cart')}>Checkout</button>                  
                <button className="clear" onClick={clearCart}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
