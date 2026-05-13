// ==========================================
//  LUXE MARKET — Admin Panel
// ==========================================

const Admin = (() => {

  // ---- SHARED LAYOUT ----
  const renderLayout = (activePage, params = {}) => {
    const session = Store.getSession();
    const el = document.createElement('div');
    el.className = 'admin-layout';
    el.innerHTML = `
      ${renderSidebar(activePage, session)}
      <main class="admin-main" id="admin-content">
        ${renderPageContent(activePage, params)}
      </main>
    `;
    return el;
  };

  const renderSidebar = (activePage, session) => `
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-text">✦ LUXE</div>
        <div class="sidebar-logo-sub">Admin Portal</div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        <button class="sidebar-link ${activePage==='admin-dashboard'?'active':''}" onclick="App.navigate('admin-dashboard')">
          <span class="sidebar-link-icon">📊</span> Dashboard
        </button>
        <button class="sidebar-link ${activePage==='admin-products'?'active':''}" onclick="App.navigate('admin-products')">
          <span class="sidebar-link-icon">📦</span> Products
        </button>
        <button class="sidebar-link ${activePage==='admin-transactions'?'active':''}" onclick="App.navigate('admin-transactions')">
          <span class="sidebar-link-icon">💳</span> Transactions
        </button>
        <button class="sidebar-link ${activePage==='admin-customers'?'active':''}" onclick="App.navigate('admin-customers')">
          <span class="sidebar-link-icon">👥</span> Customers
        </button>
        <div class="sidebar-section-label">Store</div>
        <button class="sidebar-link" onclick="App.navigate('home')">
          <span class="sidebar-link-icon">🏪</span> View Store
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${session?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <div class="sidebar-user-name">${session?.name || 'Admin'}</div>
            <div class="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm btn-full" style="margin-top:12px;" onclick="App.logout()">Sign Out</button>
      </div>
    </aside>`;

  const renderPageContent = (page, params) => {
    const map = {
      'admin-dashboard': renderDashboardContent,
      'admin-products': renderProductsContent,
      'admin-transactions': renderTransactionsContent,
      'admin-customers': renderCustomersContent,
    };
    return map[page] ? map[page](params) : '<p>Page not found</p>';
  };

  // ---- DASHBOARD ----
  const renderDashboard = (params) => { return renderLayout('admin-dashboard', params); };

  const renderDashboardContent = () => {
    const orders = Store.getOrders();
    const completed = orders.filter(o => o.status === 'completed');
    const totalRevenue = completed.reduce((s,o) => s+o.total, 0);
    const totalCost = completed.reduce((s,o) => s+o.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const refunded = orders.filter(o => o.status === 'refunded').reduce((s,o)=>s+o.total, 0);
    const customers = Store.getCustomers();
    const products = Store.getProducts();

    // Monthly data for chart
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()];
      const mo = orders.filter(o => {
        const od = new Date(o.date);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status === 'completed';
      });
      const rev = mo.reduce((s,o)=>s+o.total,0);
      const cost = mo.reduce((s,o)=>s+o.cost,0);
      monthlyData.push({ label, revenue: rev, profit: rev - cost });
    }
    const maxVal = Math.max(...monthlyData.map(m => m.revenue), 1);

    const recentOrders = [...orders].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6);

    return `
    <div class="fade-in">
      <div class="admin-topbar">
        <div>
          <div class="admin-page-title">Dashboard</div>
          <div class="admin-page-subtitle">Welcome back! Here's what's happening.</div>
        </div>
        <div style="font-size:13px;color:var(--text-muted);">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">💰</div>
          <div class="stat-value">${UI.currency(totalRevenue)}</div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-change up">↑ from completed orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">📈</div>
          <div class="stat-value">${UI.currency(totalProfit)}</div>
          <div class="stat-label">Net Profit</div>
          <div class="stat-change up">↑ margin: ${totalRevenue>0?((totalProfit/totalRevenue)*100).toFixed(1):0}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-yellow">🛒</div>
          <div class="stat-value">${orders.length}</div>
          <div class="stat-label">Total Orders</div>
          <div class="stat-change up">↑ ${completed.length} completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-red">↩️</div>
          <div class="stat-value">${UI.currency(refunded)}</div>
          <div class="stat-label">Refunds</div>
          <div class="stat-change down">↓ ${orders.filter(o=>o.status==='refunded').length} orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">👥</div>
          <div class="stat-value">${customers.length}</div>
          <div class="stat-label">Customers</div>
          <div class="stat-change up">↑ registered users</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">📦</div>
          <div class="stat-value">${products.length}</div>
          <div class="stat-label">Products</div>
          <div class="stat-change up">↑ active listings</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-yellow">⚙️</div>
          <div class="stat-value">${orders.filter(o=>o.status==='processing').length}</div>
          <div class="stat-label">Processing</div>
          <div class="stat-change">pending orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">💸</div>
          <div class="stat-value">${UI.currency(totalCost)}</div>
          <div class="stat-label">Total Cost</div>
          <div class="stat-change down">↓ cost of goods</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">📊 Revenue vs Profit (6 Months)</div>
          </div>
          <div class="chart-container">
            <div class="chart-bars">
              ${monthlyData.map(m=>`
                <div class="chart-bar-group">
                  <div class="chart-bar-track">
                    <div style="position:absolute;bottom:0;left:0;right:0;display:flex;gap:2px;height:100%;align-items:flex-end;">
                      <div class="chart-bar-fill revenue" style="height:${maxVal>0?((m.revenue/maxVal)*100):0}%;flex:1;" title="${UI.currency(m.revenue)}"></div>
                      <div class="chart-bar-fill profit" style="height:${maxVal>0?((m.profit/maxVal)*100):0}%;flex:1;" title="${UI.currency(m.profit)}"></div>
                    </div>
                  </div>
                  <div class="chart-bar-label">${m.label}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><div class="legend-dot" style="background:#a78bfa;"></div>Revenue</div>
            <div class="legend-item"><div class="legend-dot" style="background:#34d399;"></div>Profit</div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">🥧 Order Status Breakdown</div></div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
            ${[
              {label:'Completed',count:completed.length,color:'var(--success)'},
              {label:'Processing',count:orders.filter(o=>o.status==='processing').length,color:'var(--info)'},
              {label:'Shipped',count:orders.filter(o=>o.status==='shipped').length,color:'var(--warning)'},
              {label:'Refunded',count:orders.filter(o=>o.status==='refunded').length,color:'var(--danger)'},
            ].map(s=>`
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                  <span style="color:var(--text-secondary);">${s.label}</span>
                  <span style="font-weight:600;">${s.count} orders</span>
                </div>
                <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
                  <div style="height:100%;width:${orders.length>0?((s.count/orders.length)*100):0}%;background:${s.color};border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">🕐 Recent Transactions</div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('admin-transactions')">View All →</button>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Profit</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              ${recentOrders.map(o=>`
                <tr>
                  <td style="font-weight:600;color:var(--accent-light);">${o.id}</td>
                  <td>${o.customer}</td>
                  <td>${o.items.reduce((s,i)=>s+i.qty,0)} item(s)</td>
                  <td style="font-weight:600;">${UI.currency(o.total)}</td>
                  <td style="color:var(--success);">${UI.currency(o.total-o.cost)}</td>
                  <td>${UI.statusBadge(o.status)}</td>
                  <td style="color:var(--text-muted);">${UI.formatDate(o.date)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  };

  // ---- PRODUCT MANAGER ----
  const renderProductManager = (params) => renderLayout('admin-products', params);

  const renderProductsContent = () => {
    const products = Store.getProducts();
    return `
    <div class="fade-in">
      <div class="admin-topbar">
        <div>
          <div class="admin-page-title">Product Manager</div>
          <div class="admin-page-subtitle">Add, edit, or remove products from your store</div>
        </div>
        <button class="btn btn-primary" onclick="Admin.openProductForm()">+ Add Product</button>
      </div>
      <div class="product-manager-grid">
        ${products.map(p=>`
          <div class="admin-product-card">
            <img class="admin-product-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x225'">
            <div class="admin-product-body">
              <div class="admin-product-name">${p.name}</div>
              <div class="admin-product-meta">
                <span>💰 ${UI.currency(p.price)}</span>
                <span>📦 Stock: ${p.stock}</span>
                <span>⭐ ${p.rating}</span>
              </div>
              <div style="margin-bottom:12px;"><span class="badge badge-purple">${p.category}</span>${p.featured?'<span class="badge badge-warning" style="margin-left:6px;">Featured</span>':''}</div>
              <div class="admin-product-actions">
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="Admin.openProductForm('${p.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="Admin.confirmDeleteProduct('${p.id}')">🗑️</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  };

  const openProductForm = (productId = null) => {
    const p = productId ? Store.getProducts().find(x=>x.id===productId) : null;
    UI.openModal(`
      <div class="modal-header">
        <span class="modal-title">${p?'✏️ Edit Product':'➕ Add New Product'}</span>
        <button class="modal-close" onclick="UI.closeModal()">×</button>
      </div>
      <form onsubmit="Admin.saveProduct(event,'${productId||''}')">
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="form-group"><label class="form-label">Product Name</label><input class="form-input" id="pf-name" placeholder="Product name" value="${p?.name||''}" required></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label class="form-label">Price ($)</label><input class="form-input" id="pf-price" type="number" step="0.01" min="0" placeholder="0.00" value="${p?.price||''}" required></div>
            <div class="form-group"><label class="form-label">Cost ($)</label><input class="form-input" id="pf-cost" type="number" step="0.01" min="0" placeholder="0.00" value="${p?.cost||''}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label class="form-label">Stock</label><input class="form-input" id="pf-stock" type="number" min="0" placeholder="0" value="${p?.stock||''}"></div>
            <div class="form-group"><label class="form-label">Category</label>
              <select class="form-input form-select" id="pf-cat">
                ${['Electronics','Clothing','Footwear','Accessories','Home & Kitchen'].map(c=>`<option ${p?.category===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="pf-desc" rows="3" placeholder="Product description...">${p?.description||''}</textarea></div>
          <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" id="pf-img" placeholder="https://..." value="${p?.image||''}"></div>
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="pf-featured" ${p?.featured?'checked':''} style="width:18px;height:18px;accent-color:var(--accent);">
            <label for="pf-featured" style="font-size:14px;cursor:pointer;">Mark as Featured</label>
          </div>
          <div style="display:flex;gap:12px;margin-top:8px;">
            <button type="submit" class="btn btn-primary" style="flex:1;">${p?'Update Product':'Add Product'}</button>
            <button type="button" class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          </div>
        </div>
      </form>
    `);
  };

  const saveProduct = (event, productId) => {
    event.preventDefault();
    const data = {
      name: document.getElementById('pf-name').value,
      price: parseFloat(document.getElementById('pf-price').value),
      cost: parseFloat(document.getElementById('pf-cost').value) || 0,
      stock: parseInt(document.getElementById('pf-stock').value) || 0,
      category: document.getElementById('pf-cat').value,
      description: document.getElementById('pf-desc').value,
      image: document.getElementById('pf-img').value,
      featured: document.getElementById('pf-featured').checked,
    };
    if (productId) {
      Store.updateProduct(productId, data);
      UI.showToast('Product updated!', 'success');
    } else {
      Store.addProduct(data);
      UI.showToast('Product added!', 'success');
    }
    UI.closeModal();
    App.navigate('admin-products');
  };

  const confirmDeleteProduct = (id) => {
    UI.confirm('Are you sure you want to delete this product? This action cannot be undone.', () => {
      Store.deleteProduct(id);
      UI.showToast('Product deleted.', 'error');
      App.navigate('admin-products');
    });
  };

  // ---- TRANSACTIONS ----
  const renderTransactions = (params) => renderLayout('admin-transactions', params);

  const renderTransactionsContent = () => {
    const orders = [...Store.getOrders()].sort((a,b)=>new Date(b.date)-new Date(a.date));
    const totalRev = orders.filter(o=>o.status==='completed').reduce((s,o)=>s+o.total,0);
    const totalProfit = orders.filter(o=>o.status==='completed').reduce((s,o)=>s+(o.total-o.cost),0);
    return `
    <div class="fade-in">
      <div class="admin-topbar">
        <div>
          <div class="admin-page-title">Transactions</div>
          <div class="admin-page-subtitle">All customer orders and financial records</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
        <div class="stat-card"><div class="stat-icon stat-icon-purple">💰</div><div class="stat-value">${UI.currency(totalRev)}</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-icon stat-icon-green">📈</div><div class="stat-value">${UI.currency(totalProfit)}</div><div class="stat-label">Net Profit</div></div>
        <div class="stat-card"><div class="stat-icon stat-icon-yellow">🛒</div><div class="stat-value">${orders.length}</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-icon stat-icon-blue">💵</div><div class="stat-value">${orders.length>0?UI.currency(totalRev/orders.length):'$0.00'}</div><div class="stat-label">Avg Order Value</div></div>
      </div>
      <div class="chart-card">
        <div class="chart-header"><div class="chart-title">All Transactions</div></div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Email</th><th>Products</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              ${orders.map(o=>`
                <tr>
                  <td style="font-weight:700;color:var(--accent-light);">${o.id}</td>
                  <td>${o.customer}</td>
                  <td style="color:var(--text-muted);font-size:12px;">${o.email}</td>
                  <td>${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</td>
                  <td style="font-weight:600;">${UI.currency(o.total)}</td>
                  <td style="color:var(--danger);">${UI.currency(o.cost)}</td>
                  <td style="color:var(--success);font-weight:600;">${UI.currency(o.total-o.cost)}</td>
                  <td>${UI.statusBadge(o.status)}</td>
                  <td style="color:var(--text-muted);font-size:12px;">${UI.formatDate(o.date)}</td>
                  <td>
                    <select class="form-input form-select" style="padding:4px 28px 4px 8px;font-size:12px;" onchange="Admin.updateStatus('${o.id}',this.value)">
                      ${['processing','shipped','completed','refunded','cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
                    </select>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  };

  const updateStatus = (id, status) => {
    Store.updateOrderStatus(id, status);
    UI.showToast(`Order ${id} updated to "${status}"`, 'success');
    App.navigate('admin-transactions');
  };

  // ---- CUSTOMERS ----
  const renderCustomers = (params) => renderLayout('admin-customers', params);

  const renderCustomersContent = () => {
    const customers = Store.getCustomers();
    const orders = Store.getOrders();
    return `
    <div class="fade-in">
      <div class="admin-topbar">
        <div>
          <div class="admin-page-title">Customers</div>
          <div class="admin-page-subtitle">${customers.length} registered customer(s)</div>
        </div>
      </div>
      ${customers.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <div class="empty-title">No customers yet</div>
          <div class="empty-text">Customers will appear here once they register.</div>
        </div>` : `
      <div class="chart-card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Joined</th></tr></thead>
            <tbody>
              ${customers.map(c=>{
                const custOrders = orders.filter(o=>o.email===c.email);
                const spent = custOrders.reduce((s,o)=>s+o.total,0);
                return `<tr>
                  <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;">${c.name.charAt(0).toUpperCase()}</div>${c.name}</div></td>
                  <td style="color:var(--text-muted);">${c.email}</td>
                  <td><span class="badge badge-purple">${custOrders.length}</span></td>
                  <td style="font-weight:600;color:var(--success);">${UI.currency(spent)}</td>
                  <td style="color:var(--text-muted);font-size:12px;">${UI.formatDate(c.createdAt)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`}
    </div>`;
  };

  return {
    renderLayout, renderDashboard, renderProductManager, renderTransactions, renderCustomers,
    openProductForm, saveProduct, confirmDeleteProduct, updateStatus,
  };
})();
