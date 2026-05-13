// ==========================================
//  LUXE MARKET — UI Utilities
// ==========================================

const UI = (() => {
  // ---- Toast Notifications ----
  const showToast = (message, type = 'info', duration = 3000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: '💜' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ---- Modal ----
  const openModal = (html) => {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    const m = document.getElementById('active-modal');
    if (m) m.remove();
    document.body.style.overflow = '';
  };

  // ---- Confirm Dialog ----
  const confirm = (message, onConfirm) => {
    openModal(`
      <div class="modal-header">
        <span class="modal-title">⚠️ Confirm Action</span>
        <button class="modal-close" onclick="UI.closeModal()">×</button>
      </div>
      <p style="color:var(--text-secondary);margin-bottom:28px;">${message}</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="confirm-yes">Yes, Confirm</button>
      </div>
    `);
    document.getElementById('confirm-yes').onclick = () => { closeModal(); onConfirm(); };
  };

  // ---- Stars ----
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  };

  // ---- Format currency ----
  const currency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  // ---- Format date ----
  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  };

  // ---- Status badge ----
  const statusBadge = (status) => {
    const map = {
      completed: 'success', processing: 'info', shipped: 'warning',
      refunded: 'danger', cancelled: 'danger',
    };
    return `<span class="badge badge-${map[status] || 'purple'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  };

  // ---- Scroll handler for navbar ----
  const initNavbarScroll = () => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const handler = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', handler);
    handler();
  };

  return { showToast, openModal, closeModal, confirm, renderStars, currency, formatDate, statusBadge, initNavbarScroll };
})();
