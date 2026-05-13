// ==========================================
//  LUXE MARKET — Form Event Handlers
// ==========================================

// ---- Checkout ----
function submitOrder(total) {
  const first = document.getElementById('co-first')?.value?.trim();
  const last = document.getElementById('co-last')?.value?.trim();
  const email = document.getElementById('co-email')?.value?.trim();
  const card = document.getElementById('co-card')?.value?.trim();

  if (!first || !last || !email || !card) {
    UI.showToast('Please fill in all required fields.', 'error');
    return;
  }

  const items = Store.getCart();
  if (!items.length) { UI.showToast('Your cart is empty.', 'error'); return; }

  const session = Store.getSession();
  const order = Store.placeOrder(
    `${first} ${last}`,
    email,
    items.map(i => ({ productId:i.productId, name:i.name, price:i.price, cost:i.cost||0, qty:i.qty })),
    total
  );

  App.navigate('order-confirmation', { orderId: order.id });
  UI.showToast('🎉 Order placed successfully!', 'success');
}

// ---- Product detail qty ----
let _detailQty = 1;
function changeQty(delta) {
  _detailQty = Math.max(1, _detailQty + delta);
  const el = document.getElementById('qty-val');
  if (el) el.textContent = _detailQty;
}

function addToCartFromDetail() {
  // We find the product from the current page URL/state
  const hash = window.location.hash.replace('#', '');
  if (hash === 'product') {
    // Get product id from history state
    const state = window.history.state;
    if (state?.params?.id) {
      const p = Store.getProducts().find(x => x.id === state.params.id);
      if (p) {
        Cart.add(p, _detailQty);
        _detailQty = 1;
        const el = document.getElementById('qty-val');
        if (el) el.textContent = 1;
        return;
      }
    }
  }
  UI.showToast('Could not add to cart.', 'error');
}

// ---- Customer Login ----
function handleCustomerLogin(event) {
  event.preventDefault();
  const email = document.getElementById('cl-email').value;
  const pass = document.getElementById('cl-pass').value;
  const errEl = document.getElementById('cl-error');
  const result = Store.loginCustomer(email, pass);
  if (result.error) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
  } else {
    Store.setSession(result.user);
    UI.showToast(`Welcome back, ${result.user.name}! 👋`, 'success');
    App.navigate('home');
  }
}

// ---- Customer Signup ----
function handleCustomerSignup(event) {
  event.preventDefault();
  const name = document.getElementById('cs-name').value;
  const email = document.getElementById('cs-email').value;
  const pass = document.getElementById('cs-pass').value;
  const errEl = document.getElementById('cs-error');
  const result = Store.registerCustomer(name, email, pass);
  if (result.error) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
  } else {
    Store.setSession(result.user);
    UI.showToast(`Welcome to Luxe, ${result.user.name}! 🎉`, 'success');
    App.navigate('home');
  }
}

// ---- Admin Login ----
function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('al-email').value;
  const pass = document.getElementById('al-pass').value;
  const errEl = document.getElementById('al-error');
  const result = Store.loginAdmin(email, pass);
  if (result.error) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
  } else {
    Store.setSession(result.user);
    UI.showToast(`Welcome back, ${result.user.name}! 🔐`, 'success');
    App.navigate('admin-dashboard');
  }
}

// ---- Admin Signup ----
function handleAdminSignup(event) {
  event.preventDefault();
  const name = document.getElementById('as-name').value;
  const email = document.getElementById('as-email').value;
  const pass = document.getElementById('as-pass').value;
  const key = document.getElementById('as-key').value;
  const errEl = document.getElementById('as-error');
  const result = Store.registerAdmin(name, email, pass, key);
  if (result.error) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
  } else {
    Store.setSession(result.user);
    UI.showToast(`Admin account created! Welcome, ${result.user.name}!`, 'success');
    App.navigate('admin-dashboard');
  }
}
