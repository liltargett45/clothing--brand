const Store = (() => {
  const SEED_PRODUCTS = [
    { id:'p1', name:'Stellar Wireless Headphones', category:'Electronics', price:149.99, cost:60, stock:45, image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', description:'Premium over-ear headphones with 40-hour battery life and active noise cancellation.', rating:4.8, reviews:312, featured:true },
    { id:'p2', name:'Apex Running Sneakers', category:'Footwear', price:119.99, cost:42, stock:78, image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', description:'Lightweight running shoes with carbon fiber plate technology and breathable mesh.', rating:4.6, reviews:198, featured:true },
    { id:'p3', name:'Noir Leather Jacket', category:'Clothing', price:289.99, cost:95, stock:23, image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', description:'Full-grain genuine leather jacket with slim modern cut and YKK zippers.', rating:4.9, reviews:87, featured:true },
    { id:'p4', name:'Obsidian Smart Watch', category:'Electronics', price:299.99, cost:110, stock:31, image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', description:'AMOLED display, built-in GPS, heart rate monitoring, and 7-day battery life.', rating:4.7, reviews:445, featured:true },
    { id:'p5', name:'Glacier Gym Bag', category:'Accessories', price:79.99, cost:28, stock:55, image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', description:'Durable 45L gym duffel with wet/dry compartment and ventilated shoe pocket.', rating:4.5, reviews:156, featured:false },
    { id:'p6', name:'Aurora Silk Blouse', category:'Clothing', price:89.99, cost:30, stock:40, image:'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80', description:'100% mulberry silk blouse with relaxed fit and lustrous finish.', rating:4.4, reviews:73, featured:false },
    { id:'p7', name:'Titanium Sunglasses', category:'Accessories', price:199.99, cost:65, stock:19, image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', description:'Ultra-lightweight titanium frame with polarized UV400 lenses.', rating:4.8, reviews:224, featured:false },
    { id:'p8', name:'Portable Espresso Maker', category:'Home & Kitchen', price:69.99, cost:22, stock:62, image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80', description:'Brew barista-quality espresso anywhere with 18 bars of pressure.', rating:4.6, reviews:389, featured:false },
  ];

  const get = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const generateSeedOrders = () => {
    const orders = [];
    const names = ['Alice Johnson','Bob Martinez','Carol White','David Lee','Emma Wilson','Frank Brown','Grace Chen','Henry Davis'];
    const statuses = ['completed','completed','completed','completed','processing','shipped','refunded'];
    let id = 1;
    for (let m = 5; m >= 0; m--) {
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const p = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        const date = new Date();
        date.setMonth(date.getMonth() - m);
        date.setDate(1 + Math.floor(Math.random() * 27));
        orders.push({
          id: `ORD-${String(id++).padStart(4,'0')}`,
          customer: names[Math.floor(Math.random() * names.length)],
          email: `customer${id}@example.com`,
          items: [{ productId:p.id, name:p.name, price:p.price, cost:p.cost, qty }],
          total: parseFloat((p.price * qty).toFixed(2)),
          cost: parseFloat((p.cost * qty).toFixed(2)),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: date.toISOString(),
        });
      }
    }
    return orders;
  };

  const init = () => {
    if (!get('lm_products', null)) set('lm_products', SEED_PRODUCTS);
    if (!get('lm_admins', null)) set('lm_admins', [{ id:'admin1', name:'Admin', email:'admin@luxemarket.com', password:'admin123', role:'admin' }]);
    if (!get('lm_customers', null)) set('lm_customers', []);
    if (!get('lm_orders', null)) set('lm_orders', generateSeedOrders());
    if (!get('lm_cart', null)) set('lm_cart', []);
  };

  const getProducts = () => get('lm_products', []);
  const addProduct = (p) => { const all = getProducts(); p.id='p'+Date.now(); p.rating=p.rating||4.5; p.reviews=0; p.featured=!!p.featured; all.push(p); set('lm_products', all); return p; };
  const updateProduct = (id, u) => set('lm_products', getProducts().map(p => p.id===id ? {...p,...u} : p));
  const deleteProduct = (id) => set('lm_products', getProducts().filter(p => p.id!==id));

  const getCustomers = () => get('lm_customers', []);
  const getAdmins = () => get('lm_admins', []);
  const registerCustomer = (name, email, password) => {
    const all = getCustomers();
    if (all.find(c => c.email===email)) return { error:'Email already registered.' };
    const user = { id:'c'+Date.now(), name, email, password, role:'customer', createdAt:new Date().toISOString() };
    all.push(user); set('lm_customers', all); return { user };
  };
  const loginCustomer = (email, password) => { const u = getCustomers().find(c => c.email===email && c.password===password); return u ? {user:u} : {error:'Invalid email or password.'}; };
  const registerAdmin = (name, email, password, secretKey) => {
    if (secretKey !== 'LUXE2024') return { error:'Invalid admin secret key.' };
    const all = getAdmins();
    if (all.find(a => a.email===email)) return { error:'Email already registered.' };
    const admin = { id:'a'+Date.now(), name, email, password, role:'admin', createdAt:new Date().toISOString() };
    all.push(admin); set('lm_admins', all); return { user:admin };
  };
  const loginAdmin = (email, password) => { const a = getAdmins().find(a => a.email===email && a.password===password); return a ? {user:a} : {error:'Invalid admin credentials.'}; };

  const getCart = () => get('lm_cart', []);
  const saveCart = (c) => set('lm_cart', c);
  const addToCart = (product, qty=1) => { const cart = getCart(); const ex = cart.find(i => i.productId===product.id); if (ex) ex.qty+=qty; else cart.push({ productId:product.id, name:product.name, price:product.price, cost:product.cost, image:product.image, qty }); saveCart(cart); };
  const updateCartQty = (productId, qty) => { if (qty<=0) return removeFromCart(productId); saveCart(getCart().map(i => i.productId===productId ? {...i,qty} : i)); };
  const removeFromCart = (productId) => saveCart(getCart().filter(i => i.productId!==productId));
  const clearCart = () => saveCart([]);

  const getOrders = () => get('lm_orders', []);
  const placeOrder = (customerName, email, items, total) => {
    const orders = getOrders();
    const cost = items.reduce((s,i) => s+(i.cost*i.qty), 0);
    const order = { id:`ORD-${String(orders.length+1).padStart(4,'0')}`, customer:customerName, email, items, total:parseFloat(total.toFixed(2)), cost:parseFloat(cost.toFixed(2)), status:'processing', date:new Date().toISOString() };
    orders.push(order); set('lm_orders', orders); clearCart(); return order;
  };
  const updateOrderStatus = (id, status) => set('lm_orders', getOrders().map(o => o.id===id ? {...o,status} : o));

  const getSession = () => get('lm_session', null);
  const setSession = (user) => set('lm_session', user);
  const clearSession = () => localStorage.removeItem('lm_session');

  return { init, getProducts, addProduct, updateProduct, deleteProduct, getCustomers, registerCustomer, loginCustomer, registerAdmin, loginAdmin, getCart, addToCart, updateCartQty, removeFromCart, clearCart, getOrders, placeOrder, updateOrderStatus, getSession, setSession, clearSession };
})();
