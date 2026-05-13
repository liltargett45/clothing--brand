// ==========================================
//  LUXE MARKET — Router & App Shell
// ==========================================

const App = (() => {
  let currentPage = '';

  const routes = {
    'home': Pages.renderHome,
    'shop': Pages.renderShop,
    'product': Pages.renderProduct,
    'cart': Pages.renderCart,
    'checkout': Pages.renderCheckout,
    'order-confirmation': Pages.renderOrderConfirmation,
    'customer-login': Pages.renderCustomerLogin,
    'customer-signup': Pages.renderCustomerSignup,
    'admin-login': Pages.renderAdminLogin,
    'admin-signup': Pages.renderAdminSignup,
    'admin-dashboard': Admin.renderDashboard,
    'admin-products': Admin.renderProductManager,
    'admin-transactions': Admin.renderTransactions,
    'admin-customers': Admin.renderCustomers,
  };

  const navigate = (page, params = {}) => {
    window.scrollTo(0, 0);
    currentPage = page;
    window.history.pushState({ page, params }, '', `#${page}`);
    render(page, params);
  };

  const render = (page, params = {}) => {
    // Admin pages use their own full-page layout
    const adminPages = ['admin-dashboard','admin-products','admin-transactions','admin-customers'];
    const isAdmin = adminPages.includes(page);

    if (isAdmin) {
      const session = Store.getSession();
      if (!session || session.role !== 'admin') {
        navigate('admin-login');
        return;
      }
    }

    const root = document.getElementById('app-root');

    if (isAdmin) {
      root.innerHTML = '';
      root.appendChild(Admin.renderLayout(page, params));
    } else {
      root.innerHTML = renderShell(page, params);
      UI.initNavbarScroll();
      Cart.initDrawer();
    }

    // After render, attach page-specific handlers
    if (typeof window[`onPage_${page.replace(/-/g,'_')}`] === 'function') {
      window[`onPage_${page.replace(/-/g,'_')}`](params);
    }
  };

  const renderShell = (page, params) => {
    const fn = routes[page];
    const pageHTML = fn ? fn(params) : `<div class="page"><div class="container empty-state"><div class="empty-icon">🔍</div><h2 class="empty-title">Page not found</h2><p class="empty-text">The page you're looking for doesn't exist.</p><button class="btn btn-primary mt-24" onclick="App.navigate('home')">Go Home</button></div></div>`;
    return `
      ${renderNavbar()}
      ${pageHTML}
      ${page !== 'checkout' ? renderFooter() : ''}
      ${renderCartDrawer()}
    `;
  };

  const renderNavbar = () => {
    const session = Store.getSession();
    const cartCount = Store.getCart().reduce((s, i) => s + i.qty, 0);
    const userSection = session
      ? `<div class="nav-user" onclick="App.handleUserMenu()">
           <div class="nav-avatar">${session.name.charAt(0).toUpperCase()}</div>
           <span>${session.name}</span>
         </div>`
      : `<button class="btn btn-secondary btn-sm" onclick="App.navigate('customer-login')">Sign In</button>
         <button class="btn btn-primary btn-sm" onclick="App.navigate('customer-signup')">Join Free</button>`;

    return `
      <nav class="navbar" id="main-navbar">
        <div class="nav-logo" onclick="App.navigate('home')" style="cursor:pointer;">✦ LUXE</div>
        <div class="nav-links">
          <button class="nav-link" onclick="App.navigate('home')">Home</button>
          <button class="nav-link" onclick="App.navigate('shop')">Shop</button>
          <button class="nav-link" onclick="App.navigate('shop',{category:'Electronics'})">Electronics</button>
          <button class="nav-link" onclick="App.navigate('shop',{category:'Clothing'})">Clothing</button>
          <button class="nav-link" onclick="App.navigate('shop',{category:'Accessories'})">Accessories</button>
        </div>
        <div class="nav-actions">
          <button class="cart-btn" onclick="Cart.open()" title="Shopping Cart">
            🛒 ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
          </button>
          ${userSection}
        </div>
      </nav>
    `;
  };

  const renderFooter = () => `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">✦ LUXE MARKET</div>
            <p class="footer-desc">Your destination for premium products curated from the world's finest brands. Quality, style, and excellence delivered to your door.</p>
          </div>
          <div>
            <div class="footer-heading">Shop</div>
            <div class="footer-links">
              <span class="footer-link" onclick="App.navigate('shop')">All Products</span>
              <span class="footer-link" onclick="App.navigate('shop',{category:'Electronics'})">Electronics</span>
              <span class="footer-link" onclick="App.navigate('shop',{category:'Clothing'})">Clothing</span>
              <span class="footer-link" onclick="App.navigate('shop',{category:'Accessories'})">Accessories</span>
            </div>
          </div>
          <div>
            <div class="footer-heading">Account</div>
            <div class="footer-links">
              <span class="footer-link" onclick="App.navigate('customer-login')">Sign In</span>
              <span class="footer-link" onclick="App.navigate('customer-signup')">Register</span>
              <span class="footer-link" onclick="App.navigate('admin-login')">Admin Portal</span>
            </div>
          </div>
          <div>
            <div class="footer-heading">Info</div>
            <div class="footer-links">
              <span class="footer-link">About Us</span>
              <span class="footer-link">Contact</span>
              <span class="footer-link">Privacy Policy</span>
              <span class="footer-link">Terms of Service</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2024 Luxe Market. All rights reserved.</span>
          <span>Made with 💜 for premium shoppers</span>
        </div>
      </div>
    </footer>
  `;

  const renderCartDrawer = () => {
    const items = Store.getCart();
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    const itemsHTML = items.length === 0
      ? `<div class="cart-empty"><div class="cart-empty-icon">🛍️</div><p>Your cart is empty</p><button class="btn btn-primary mt-16" onclick="Cart.close();App.navigate('shop')">Start Shopping</button></div>`
      : items.map(item => `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/72'">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${UI.currency(item.price * item.qty)}</div>
              <div class="cart-qty-control">
                <button class="qty-btn" onclick="Cart.updateQty('${item.productId}', ${item.qty - 1})">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="Cart.updateQty('${item.productId}', ${item.qty + 1})">+</button>
                <button class="btn-icon btn-sm" onclick="Cart.remove('${item.productId}')" style="margin-left:auto;font-size:14px;padding:4px 8px;">🗑️</button>
              </div>
            </div>
          </div>
        `).join('');

    return `
      <div class="cart-overlay" id="cart-overlay" onclick="Cart.close()"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-header">
          <span class="cart-title">🛒 Shopping Cart <span style="color:var(--text-muted);font-weight:400;font-size:14px;">(${items.length} items)</span></span>
          <button class="modal-close" onclick="Cart.close()">×</button>
        </div>
        <div class="cart-items" id="cart-items">${itemsHTML}</div>
        ${items.length > 0 ? `
        <div class="cart-footer">
          <div class="cart-total-row"><span>Subtotal</span><span>${UI.currency(subtotal)}</span></div>
          <div class="cart-total-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">FREE</span>' : UI.currency(shipping)}</span></div>
          ${subtotal < 100 ? `<p style="font-size:12px;color:var(--text-muted);margin-top:4px;">Add ${UI.currency(100-subtotal)} more for free shipping!</p>` : ''}
          <div class="cart-total-row final"><span>Total</span><span>${UI.currency(total)}</span></div>
          <button class="btn btn-primary btn-full mt-16" onclick="Cart.close();App.navigate('checkout')">Proceed to Checkout</button>
          <button class="btn btn-secondary btn-full mt-8" onclick="Cart.close();App.navigate('shop')">Continue Shopping</button>
        </div>` : ''}
      </div>
    `;
  };

  const handleUserMenu = () => {
    const session = Store.getSession();
    if (!session) return navigate('customer-login');
    if (session.role === 'admin') return navigate('admin-dashboard');

    UI.openModal(`
      <div class="modal-header">
        <span class="modal-title">My Account</span>
        <button class="modal-close" onclick="UI.closeModal()">×</button>
      </div>
      <div style="text-align:center;padding:20px 0;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;margin:0 auto 12px;">
          ${session.name.charAt(0).toUpperCase()}
        </div>
        <div style="font-size:20px;font-weight:700;">${session.name}</div>
        <div style="color:var(--text-muted);font-size:14px;">${session.email}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px;">
        <button class="btn btn-secondary btn-full" onclick="UI.closeModal()">View Orders</button>
        <button class="btn btn-danger btn-full" onclick="UI.closeModal();App.logout()">Sign Out</button>
      </div>
    `);
  };

  const logout = () => {
    Store.clearSession();
    navigate('home');
    UI.showToast('Signed out successfully.', 'info');
  };

  const init = () => {
    Store.init();
    const hash = window.location.hash.replace('#', '') || 'home';
    render(hash);
    window.addEventListener('popstate', (e) => {
      if (e.state) render(e.state.page, e.state.params || {});
    });
  };

  return { navigate, render, handleUserMenu, logout, renderNavbar, renderCartDrawer, renderFooter, init };
})();

// ---- Cart Controller ----
const Cart = (() => {
  const open = () => {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };
  const initDrawer = () => {};
  const updateQty = (productId, qty) => {
    Store.updateCartQty(productId, qty);
    refreshCart();
  };
  const remove = (productId) => {
    Store.removeFromCart(productId);
    refreshCart();
    UI.showToast('Item removed from cart.', 'info');
  };
  const add = (product, qty = 1) => {
    Store.addToCart(product, qty);
    refreshCart();
    UI.showToast(`${product.name} added to cart! 🛒`, 'success');
  };
  const refreshCart = () => {
    // Re-render just the cart drawer and cart button count
    const cartArea = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const wasOpen = cartArea?.classList.contains('open');

    const root = document.getElementById('app-root');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = App.renderCartDrawer();
    const newDrawer = tempDiv.querySelector('#cart-drawer');
    const newOverlay = tempDiv.querySelector('#cart-overlay');

    if (cartArea) cartArea.replaceWith(newDrawer);
    if (overlay) overlay.replaceWith(newOverlay);
    if (wasOpen) {
      document.getElementById('cart-drawer')?.classList.add('open');
      document.getElementById('cart-overlay')?.classList.add('open');
    }

    // Update cart count badge in navbar
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
      const count = Store.getCart().reduce((s,i)=>s+i.qty,0);
      const existing = cartBtn.querySelector('.cart-count');
      if (existing) existing.remove();
      if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'cart-count';
        badge.textContent = count;
        cartBtn.appendChild(badge);
      }
    }
  };
  return { open, close, initDrawer, updateQty, remove, add, refreshCart };
})();
