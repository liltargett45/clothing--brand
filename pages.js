// ==========================================
//  LUXE MARKET — Storefront Pages
// ==========================================

const Pages = (() => {

  // ---- HOME ----
  const renderHome = () => {
    const featured = Store.getProducts().filter(p => p.featured).slice(0, 4);
    const allProducts = Store.getProducts().slice(0, 8);
    return `
    <div class="page">
      <section class="hero">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;">
          <div class="hero-content fade-in">
            <div class="hero-badge"><span class="hero-badge-dot"></span> New Collection 2024</div>
            <h1 class="hero-title">Discover <span>Premium</span> Products</h1>
            <p class="hero-subtitle">Curated luxury goods from the world's finest brands. Elevate your lifestyle with our exclusive collection.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" onclick="App.navigate('shop')">Shop Now →</button>
              <button class="btn btn-secondary btn-lg" onclick="document.getElementById('featured').scrollIntoView({behavior:'smooth'})">Explore</button>
            </div>
            <div class="hero-stats">
              <div><div class="hero-stat-value">500+</div><div class="hero-stat-label">Premium Products</div></div>
              <div><div class="hero-stat-value">12K+</div><div class="hero-stat-label">Happy Customers</div></div>
              <div><div class="hero-stat-value">4.9★</div><div class="hero-stat-label">Average Rating</div></div>
            </div>
          </div>
          <div class="hero-image-wrapper fade-in">
            <div class="hero-image-grid">
              ${featured.slice(0,4).map(p => `
                <div class="hero-img-card" onclick="App.navigate('product',{id:'${p.id}'})">
                  <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'">
                </div>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="featured">
        <div class="container">
          <div class="flex-between mb-32">
            <div>
              <h2 class="section-title">Featured <span style="background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Products</span></h2>
              <p class="section-subtitle">Hand-picked items loved by thousands of customers</p>
            </div>
            <button class="btn btn-secondary" onclick="App.navigate('shop')">View All →</button>
          </div>
          <div class="products-grid">${featured.map(p => renderProductCard(p)).join('')}</div>
        </div>
      </section>

      <section class="section" style="background:var(--bg-secondary);border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
        <div class="container">
          <div class="grid-3" style="gap:32px;">
            ${[
              {icon:'🚀',title:'Free Shipping',desc:'Free shipping on orders over $100'},
              {icon:'🔒',title:'Secure Payments',desc:'256-bit SSL encrypted checkout'},
              {icon:'↩️',title:'Easy Returns',desc:'30-day hassle-free return policy'},
            ].map(f=>`
              <div class="card text-center">
                <div style="font-size:36px;margin-bottom:12px;">${f.icon}</div>
                <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${f.title}</div>
                <div style="color:var(--text-secondary);font-size:14px;">${f.desc}</div>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="text-center mb-32">
            <h2 class="section-title">All <span style="background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Collections</span></h2>
            <p class="section-subtitle">Browse our full range of premium products</p>
          </div>
          <div class="products-grid">${allProducts.map(p => renderProductCard(p)).join('')}</div>
        </div>
      </section>
    </div>`;
  };

  // ---- PRODUCT CARD ----
  const renderProductCard = (p) => `
    <div class="product-card" onclick="App.navigate('product',{id:'${p.id}'})">
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'">
        ${p.featured ? '<div class="product-badge"><span class="badge badge-purple">Featured</span></div>' : ''}
        <div class="product-actions-overlay">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();Cart.add(${JSON.stringify(p).replace(/"/g,'&quot;')})">Add to Cart</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${UI.renderStars(p.rating)}</span>
          <span class="product-rating-text">${p.rating} (${p.reviews})</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${UI.currency(p.price)}</span>
          <span style="font-size:12px;color:var(--text-muted)">${p.stock} in stock</span>
        </div>
      </div>
    </div>`;

  // ---- SHOP ----
  const renderShop = (params = {}) => {
    const all = Store.getProducts();
    const cats = ['All', ...new Set(all.map(p => p.category))];
    const active = params.category || 'All';
    const filtered = active === 'All' ? all : all.filter(p => p.category === active);
    return `
    <div class="page">
      <div class="page-hero">
        <div class="container">
          <h1 class="page-hero-title">🛍️ Shop All</h1>
          <p class="page-hero-subtitle">Discover ${all.length} premium products across all categories</p>
        </div>
      </div>
      <div class="container">
        <div class="shop-header">
          <div class="shop-filters">
            ${cats.map(c=>`<button class="filter-btn ${c===active?'active':''}" onclick="App.navigate('shop',{category:'${c}'})">${c}</button>`).join('')}
          </div>
        </div>
        <div class="products-grid">${filtered.length ? filtered.map(p=>renderProductCard(p)).join('') : '<div class="empty-state"><div class="empty-icon">🔍</div><p>No products found</p></div>'}</div>
      </div>
    </div>`;
  };

  // ---- PRODUCT DETAIL ----
  const renderProduct = (params = {}) => {
    const p = Store.getProducts().find(x => x.id === params.id);
    if (!p) return `<div class="page"><div class="container empty-state"><div class="empty-icon">😕</div><h2>Product not found</h2><button class="btn btn-primary mt-24" onclick="App.navigate('shop')">Back to Shop</button></div></div>`;
    const related = Store.getProducts().filter(x => x.category === p.category && x.id !== p.id).slice(0,4);
    return `
    <div class="page">
      <div class="container">
        <div class="breadcrumb mt-24">
          <span onclick="App.navigate('home')">Home</span> /
          <span onclick="App.navigate('shop')">Shop</span> /
          <span onclick="App.navigate('shop',{category:'${p.category}'})">${p.category}</span> /
          <span style="color:var(--text-secondary)">${p.name}</span>
        </div>
        <div class="product-detail-layout">
          <div class="product-detail-img">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/600'">
          </div>
          <div class="fade-in">
            <div class="product-detail-category">${p.category}</div>
            <h1 class="product-detail-name">${p.name}</h1>
            <div class="product-rating mb-16">
              <span class="stars" style="font-size:20px;">${UI.renderStars(p.rating)}</span>
              <span style="color:var(--text-secondary)">${p.rating} · ${p.reviews} reviews</span>
            </div>
            <div class="product-detail-price">${UI.currency(p.price)}</div>
            <p class="product-detail-desc">${p.description}</p>
            <div style="margin-bottom:16px;">
              <label style="font-size:13px;color:var(--text-secondary);font-weight:600;margin-bottom:10px;display:block;">QUANTITY</label>
              <div class="quantity-selector">
                <button class="qty-control-btn" id="qty-minus" onclick="changeQty(-1)">−</button>
                <span class="qty-display" id="qty-val">1</span>
                <button class="qty-control-btn" id="qty-plus" onclick="changeQty(1)">+</button>
              </div>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:24px;">
              <button class="btn btn-primary" style="flex:1;" onclick="addToCartFromDetail()">🛒 Add to Cart</button>
              <button class="btn btn-secondary" onclick="addToCartFromDetail();App.navigate('checkout')">Buy Now</button>
            </div>
            <div style="display:flex;gap:24px;font-size:13px;color:var(--text-secondary);">
              <span>✅ ${p.stock} in stock</span>
              <span>🚀 Free shipping over $100</span>
              <span>↩️ 30-day returns</span>
            </div>
          </div>
        </div>
        ${related.length ? `
        <div style="margin-top:60px;">
          <h2 class="section-title mb-24">You May Also Like</h2>
          <div class="products-grid">${related.map(r=>renderProductCard(r)).join('')}</div>
        </div>` : ''}
      </div>
    </div>`;
  };

  // ---- CART PAGE ----
  const renderCart = () => {
    Cart.open();
    return renderHome();
  };

  // ---- CHECKOUT ----
  const renderCheckout = () => {
    const items = Store.getCart();
    if (!items.length) return `<div class="page"><div class="container empty-state" style="padding-top:80px;"><div class="empty-icon">🛒</div><h2 class="empty-title">Your cart is empty</h2><button class="btn btn-primary mt-24" onclick="App.navigate('shop')">Start Shopping</button></div></div>`;
    const subtotal = items.reduce((s,i)=>s+i.price*i.qty, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return `
    <div class="page" style="min-height:100vh;">
      <div class="container">
        <div class="breadcrumb mt-24 mb-16"><span onclick="App.navigate('home')">Home</span> / <span onclick="Cart.open()">Cart</span> / Checkout</div>
        <h1 style="font-size:28px;font-weight:800;margin-bottom:32px;">Checkout</h1>
        <div class="checkout-layout">
          <div style="display:flex;flex-direction:column;gap:24px;">
            <div class="checkout-form-card">
              <div class="checkout-section-title"><div class="checkout-step-num">1</div>Contact Information</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="co-first" placeholder="John"></div>
                <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="co-last" placeholder="Doe"></div>
                <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Email</label><input class="form-input" id="co-email" type="email" placeholder="john@email.com"></div>
                <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Phone</label><input class="form-input" id="co-phone" placeholder="+1 (555) 000-0000"></div>
              </div>
            </div>
            <div class="checkout-form-card">
              <div class="checkout-section-title"><div class="checkout-step-num">2</div>Shipping Address</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Address</label><input class="form-input" id="co-addr" placeholder="123 Main Street"></div>
                <div class="form-group"><label class="form-label">City</label><input class="form-input" id="co-city" placeholder="New York"></div>
                <div class="form-group"><label class="form-label">ZIP Code</label><input class="form-input" id="co-zip" placeholder="10001"></div>
                <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Country</label>
                  <select class="form-input form-select" id="co-country"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option></select>
                </div>
              </div>
            </div>
            <div class="checkout-form-card">
              <div class="checkout-section-title"><div class="checkout-step-num">3</div>Payment Details</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Card Number</label><input class="form-input" id="co-card" placeholder="1234 5678 9012 3456" maxlength="19"></div>
                <div class="form-group"><label class="form-label">Expiry</label><input class="form-input" id="co-expiry" placeholder="MM/YY"></div>
                <div class="form-group"><label class="form-label">CVV</label><input class="form-input" id="co-cvv" placeholder="123" maxlength="4"></div>
              </div>
              <div style="margin-top:16px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm);font-size:13px;color:var(--success);">
                🔒 Your payment information is encrypted and secure.
              </div>
            </div>
            <button class="btn btn-success btn-lg btn-full" onclick="submitOrder(${total.toFixed(2)})">✅ Place Order · ${UI.currency(total)}</button>
          </div>
          <div class="order-summary-card">
            <div style="font-size:16px;font-weight:700;margin-bottom:20px;">Order Summary</div>
            ${items.map(i=>`
              <div class="summary-item">
                <img class="summary-item-img" src="${i.image}" onerror="this.src='https://via.placeholder.com/52'">
                <div class="summary-item-details">
                  <div class="summary-item-name">${i.name}</div>
                  <div class="summary-item-qty">Qty: ${i.qty}</div>
                </div>
                <div class="summary-item-price">${UI.currency(i.price*i.qty)}</div>
              </div>`).join('')}
            <div style="border-top:1px solid var(--border);margin:16px 0;padding-top:16px;">
              <div class="cart-total-row"><span>Subtotal</span><span>${UI.currency(subtotal)}</span></div>
              <div class="cart-total-row"><span>Shipping</span><span>${shipping===0?'<span style="color:var(--success)">FREE</span>':UI.currency(shipping)}</span></div>
              <div class="cart-total-row"><span>Tax (8%)</span><span>${UI.currency(tax)}</span></div>
              <div class="cart-total-row final"><span>Total</span><span>${UI.currency(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  };

  // ---- ORDER CONFIRMATION ----
  const renderOrderConfirmation = (params = {}) => `
    <div class="page">
      <div class="container flex-center" style="min-height:calc(100vh - var(--nav-height));">
        <div class="card confirmation-card fade-in">
          <div class="confirmation-icon">🎉</div>
          <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;">Order Placed!</h1>
          <p style="color:var(--text-secondary);margin-bottom:8px;">Thank you for your purchase.</p>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:var(--radius-sm);padding:16px;margin:20px 0;">
            <div style="font-size:13px;color:var(--text-muted);">Order ID</div>
            <div style="font-size:20px;font-weight:700;color:var(--accent-light);">${params.orderId || 'ORD-0001'}</div>
          </div>
          <p style="font-size:14px;color:var(--text-secondary);margin-bottom:28px;">A confirmation email has been sent. Your order will be processed within 1-2 business days.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="App.navigate('shop')">Continue Shopping</button>
            <button class="btn btn-secondary" onclick="App.navigate('home')">Go Home</button>
          </div>
        </div>
      </div>
    </div>`;

  // ---- CUSTOMER LOGIN ----
  const renderCustomerLogin = () => `
    <div class="auth-page">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
      <div class="auth-card">
        <div class="auth-logo">✦ LUXE</div>
        <div class="auth-tagline">Premium Shopping Experience</div>
        <h2 class="auth-title">Welcome Back</h2>
        <p class="auth-subtitle">Sign in to your customer account</p>
        <form class="auth-form" onsubmit="handleCustomerLogin(event)">
          <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="cl-email" type="email" placeholder="you@email.com" required></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="cl-pass" type="password" placeholder="••••••••" required></div>
          <div id="cl-error" style="color:var(--danger);font-size:13px;display:none;"></div>
          <button type="submit" class="btn btn-primary btn-full">Sign In →</button>
        </form>
        <div class="divider mt-24 mb-16">or</div>
        <div class="auth-switch">Don't have an account? <a onclick="App.navigate('customer-signup')">Create one free</a></div>
        <div class="auth-switch mt-8"><a onclick="App.navigate('admin-login')">Admin? Sign in here →</a></div>
      </div>
    </div>`;

  // ---- CUSTOMER SIGNUP ----
  const renderCustomerSignup = () => `
    <div class="auth-page">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
      <div class="auth-card">
        <div class="auth-logo">✦ LUXE</div>
        <div class="auth-tagline">Premium Shopping Experience</div>
        <h2 class="auth-title">Create Account</h2>
        <p class="auth-subtitle">Join thousands of premium shoppers</p>
        <form class="auth-form" onsubmit="handleCustomerSignup(event)">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="cs-name" placeholder="John Doe" required></div>
          <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="cs-email" type="email" placeholder="you@email.com" required></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="cs-pass" type="password" placeholder="Min. 6 characters" minlength="6" required></div>
          <div id="cs-error" style="color:var(--danger);font-size:13px;display:none;"></div>
          <button type="submit" class="btn btn-primary btn-full">Create Account →</button>
        </form>
        <div class="auth-switch mt-16">Already have an account? <a onclick="App.navigate('customer-login')">Sign in</a></div>
      </div>
    </div>`;

  // ---- ADMIN LOGIN ----
  const renderAdminLogin = () => `
    <div class="auth-page">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
      <div class="auth-card">
        <div class="auth-logo">✦ LUXE</div>
        <div class="auth-tagline">Admin Portal</div>
        <div class="admin-badge">🔐 Restricted — Admin Access Only</div>
        <h2 class="auth-title">Admin Sign In</h2>
        <p class="auth-subtitle">Default: admin@luxemarket.com / admin123</p>
        <form class="auth-form" onsubmit="handleAdminLogin(event)">
          <div class="form-group"><label class="form-label">Admin Email</label><input class="form-input" id="al-email" type="email" placeholder="admin@luxemarket.com" required></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="al-pass" type="password" placeholder="••••••••" required></div>
          <div id="al-error" style="color:var(--danger);font-size:13px;display:none;"></div>
          <button type="submit" class="btn btn-primary btn-full">Access Dashboard →</button>
        </form>
        <div class="divider mt-24 mb-16">or</div>
        <div class="auth-switch"><a onclick="App.navigate('admin-signup')">Register as new admin</a></div>
        <div class="auth-switch mt-8"><a onclick="App.navigate('customer-login')">← Customer login</a></div>
      </div>
    </div>`;

  // ---- ADMIN SIGNUP ----
  const renderAdminSignup = () => `
    <div class="auth-page">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
      <div class="auth-card">
        <div class="auth-logo">✦ LUXE</div>
        <div class="auth-tagline">Admin Portal</div>
        <div class="admin-badge">🔐 Admin Registration — Secret Key Required</div>
        <h2 class="auth-title">Admin Register</h2>
        <p class="auth-subtitle">Use secret key: <strong>LUXE2024</strong></p>
        <form class="auth-form" onsubmit="handleAdminSignup(event)">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="as-name" placeholder="Admin Name" required></div>
          <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="as-email" type="email" placeholder="admin@email.com" required></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="as-pass" type="password" placeholder="Min. 6 characters" minlength="6" required></div>
          <div class="form-group"><label class="form-label">Admin Secret Key</label><input class="form-input" id="as-key" placeholder="Enter secret key" required></div>
          <div id="as-error" style="color:var(--danger);font-size:13px;display:none;"></div>
          <button type="submit" class="btn btn-primary btn-full">Register Admin →</button>
        </form>
        <div class="auth-switch mt-16"><a onclick="App.navigate('admin-login')">← Back to Admin Login</a></div>
      </div>
    </div>`;

  return { renderHome, renderShop, renderProduct, renderCart, renderCheckout, renderOrderConfirmation, renderCustomerLogin, renderCustomerSignup, renderAdminLogin, renderAdminSignup };
})();
