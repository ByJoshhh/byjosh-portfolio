/**
 * Admin Panel Modal for ByJosh (Full CMS Suite)
 * Activated by ?admin or clicking the footer trigger.
 * Protected by PIN.
 * 100% Native ByJosh UI Theme — Bilingual (English / Spanish)
 * 
 * Features:
 *  1. Create single-use client links (Dynamic categories)
 *  2. Live Pricing Plans CMS (Edit prices, mark popular)
 *  3. Portfolio Gallery & Media CMS (Upload images to Supabase Storage, publish, delete)
 *  4. Categories Manager (Add custom categories & filter badges)
 *  5. Reviews Moderation & Manual Addition
 *  6. Single-Use Tokens Management
 *  7. Supabase Credentials & Security PIN
 */
import {
  getAdminPIN,
  setAdminPIN,
  getSupabaseConfig,
  saveSupabaseConfig,
  generateReviewToken,
  getAllReviews,
  getAllTokens,
  updateReviewStatus,
  deleteReview,
  toggleTokenUsed,
  deleteToken,
  submitReview
} from '../utils/reviewsDB.js';
import {
  getPricingPlans,
  updatePricingPlan,
  getCategories,
  addCategory,
  deleteCategory,
  uploadProjectImage,
  getDynamicProjects,
  addDynamicProject,
  deleteDynamicProject
} from '../utils/cmsDB.js';
import { renderReviewsCards } from '../sections/reviews.js';

export function initAdminModal() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  if (urlParams.has('admin') || hash.includes('admin')) {
    openAdminModal();
  }

  // Bind footer trigger if present
  const footerTrigger = document.getElementById('admin-footer-trigger');
  if (footerTrigger) {
    footerTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal();
    });
  }
}

export function openAdminModal() {
  // Remove existing instance if open
  const existing = document.getElementById('byjosh-admin-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'byjosh-admin-modal';
  modal.className = 'modal-backdrop is-open';

  modal.innerHTML = `
    <div class="modal-overlay" id="admin-backdrop"></div>
    <div class="modal-card modal-card--wide" style="max-width: 780px;">
      <div class="modal-header-actions" style="position: absolute; top: 18px; right: 18px; display: flex; align-items: center; gap: 10px; z-index: 10;">
        <button id="admin-lang-toggle" class="btn btn--outline" style="padding: 4px 12px; font-size: 0.75rem; border-radius: var(--radius-full); height: 30px;">
          <span class="lang-en">ES</span>
          <span class="lang-es">EN</span>
        </button>
        <button class="modal-close" id="admin-close-btn" aria-label="Close modal">&times;</button>
      </div>
      <div id="admin-body"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const backdrop = modal.querySelector('#admin-backdrop');
  const closeBtn = modal.querySelector('#admin-close-btn');
  const langBtn = modal.querySelector('#admin-lang-toggle');
  const bodyEl = modal.querySelector('#admin-body');

  function toggleLang() {
    const isEs = document.body.classList.toggle('lang-es');
    localStorage.setItem('byjosh_lang', isEs ? 'es' : 'en');
    window.dispatchEvent(new CustomEvent('byjosh:langchange', { detail: { lang: isEs ? 'es' : 'en' } }));
  }

  langBtn.addEventListener('click', toggleLang);

  function closeAdmin() {
    modal.classList.remove('is-open');
    setTimeout(() => modal.remove(), 300);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  backdrop.addEventListener('click', closeAdmin);
  closeBtn.addEventListener('click', closeAdmin);

  const isAuth = sessionStorage.getItem('byjosh_admin_auth') === '1';
  if (isAuth) {
    renderDashboard(bodyEl);
  } else {
    renderPinScreen(bodyEl);
  }
}

function renderPinScreen(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 12px 6px;">
      <div class="modal-icon-badge">
        <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <span class="section__tag" style="margin-bottom: 8px;">
        <span class="lang-en">Private Access</span>
        <span class="lang-es">Acceso Privado</span>
      </span>
      <h3 style="margin: 0 0 8px; color: var(--text-primary); font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;">
        <span class="lang-en">Admin Dashboard</span>
        <span class="lang-es">Panel de Administración</span>
      </h3>
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 26px;">
        <span class="lang-en">Enter your master PIN to manage prices, projects, links and reviews.</span>
        <span class="lang-es">Ingresa tu PIN maestro para gestionar precios, trabajos, enlaces y reseñas.</span>
      </p>

      <form id="admin-pin-form" style="max-width: 300px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px;">
        <input type="password" id="admin-pin-input" class="form-input" placeholder="••••" required autofocus style="text-align: center; letter-spacing: 6px; font-size: 1.3rem; height: 46px;" />
        <div id="pin-error" style="color: #ef4444; font-size: 0.8rem; display: none;">
          <span class="lang-en">Incorrect PIN. Try again.</span>
          <span class="lang-es">PIN incorrecto. Inténtalo de nuevo.</span>
        </div>
        <button type="submit" class="btn btn--primary" style="width: 100%; height: 44px;">
          <span class="lang-en">Enter Dashboard</span>
          <span class="lang-es">Entrar al Panel</span>
        </button>
      </form>
    </div>
  `;

  const form = document.getElementById('admin-pin-form');
  const pinInput = document.getElementById('admin-pin-input');
  const pinError = document.getElementById('pin-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = pinInput.value.trim();
    const correctPin = getAdminPIN();

    if (entered === correctPin) {
      sessionStorage.setItem('byjosh_admin_auth', '1');
      renderDashboard(container);
    } else {
      pinError.style.display = 'block';
      pinInput.value = '';
      pinInput.focus();
    }
  });
}

async function renderDashboard(container) {
  container.innerHTML = `
    <div class="admin-dashboard">
      <div class="admin-dashboard__header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="navbar__logo" style="font-size: 1.25rem;">By<span style="color: var(--accent-primary);">Josh.</span></span>
          <span class="badge badge--primary" style="font-size: 0.65rem; padding: 2px 8px;">
            <span class="lang-en">CMS Dashboard</span><span class="lang-es">Panel CMS</span>
          </span>
        </div>
        <button id="admin-logout-btn" class="btn btn--outline" style="padding: 6px 14px; font-size: 0.75rem; height: 32px;">
          <span class="lang-en">Log Out</span>
          <span class="lang-es">Cerrar Sesión</span>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab is-active" data-tab="create">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          <span class="lang-en">Create Link</span>
          <span class="lang-es">Generar Enlace</span>
        </button>
        <button class="admin-tab" data-tab="pricing">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span class="lang-en">Pricing</span>
          <span class="lang-es">Precios</span>
        </button>
        <button class="admin-tab" data-tab="projects">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <span class="lang-en">Gallery & Media</span>
          <span class="lang-es">Subir Trabajos</span>
        </button>
        <button class="admin-tab" data-tab="categories">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          <span class="lang-en">Categories</span>
          <span class="lang-es">Categorías</span>
        </button>
        <button class="admin-tab" data-tab="reviews">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span class="lang-en">Reviews</span>
          <span class="lang-es">Reseñas</span>
        </button>
        <button class="admin-tab" data-tab="tokens">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="lang-en">Active Links</span>
          <span class="lang-es">Enlaces Activos</span>
        </button>
        <button class="admin-tab" data-tab="settings">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span class="lang-en">Settings</span>
          <span class="lang-es">Configuración</span>
        </button>
      </div>

      <!-- Tab Contents -->
      <div class="admin-tab-content" id="tab-content-create"></div>
      <div class="admin-tab-content" id="tab-content-pricing" style="display:none;"></div>
      <div class="admin-tab-content" id="tab-content-projects" style="display:none;"></div>
      <div class="admin-tab-content" id="tab-content-categories" style="display:none;"></div>
      <div class="admin-tab-content" id="tab-content-reviews" style="display:none;"></div>
      <div class="admin-tab-content" id="tab-content-tokens" style="display:none;"></div>
      <div class="admin-tab-content" id="tab-content-settings" style="display:none;"></div>
    </div>
  `;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('byjosh_admin_auth');
    renderPinScreen(container);
  });

  const tabs = container.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      container.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const targetId = `tab-content-${tab.dataset.tab}`;
      const target = document.getElementById(targetId);
      if (target) target.style.display = 'block';

      if (tab.dataset.tab === 'create') renderCreateTab();
      if (tab.dataset.tab === 'pricing') loadPricingTab();
      if (tab.dataset.tab === 'projects') loadProjectsTab();
      if (tab.dataset.tab === 'categories') loadCategoriesTab();
      if (tab.dataset.tab === 'reviews') loadReviewsTab();
      if (tab.dataset.tab === 'tokens') loadTokensTab();
      if (tab.dataset.tab === 'settings') renderSettingsTab();
    });
  });

  renderCreateTab();
}

// ── TAB 1: CREATE LINK ────────────────────────────────────────────────────────
async function renderCreateTab() {
  const el = document.getElementById('tab-content-create');
  if (!el) return;

  const [plans, cats] = await Promise.all([
    getPricingPlans(),
    getCategories()
  ]);

  const options = [];
  (plans || []).forEach(p => {
    options.push({ value: p.title_en, label: `${p.title_es} / ${p.title_en} ($${Number(p.price).toFixed(2)} USD)` });
  });
  (cats || []).forEach(c => {
    if (!options.some(o => o.value.toLowerCase() === c.name_en.toLowerCase())) {
      options.push({ value: c.name_en, label: `${c.name_es} (${c.name_en})` });
    }
  });
  options.push({ value: 'Custom Design', label: 'Diseño Personalizado / Custom Design' });

  el.innerHTML = `
    <div style="padding: 6px 0;">
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 22px; line-height: 1.6;">
        <span class="lang-en">Generate a private single-use review link to send to your client after delivery and payment.</span>
        <span class="lang-es">Genera un link único de reseña para entregarle a tu cliente tras el pago y entrega del trabajo.</span>
      </p>

      <form id="gen-token-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label class="form-label">
            <span class="lang-en">Service Delivered</span>
            <span class="lang-es">Servicio Realizado</span>
          </label>
          <div class="form-select-wrap">
            <select id="gen-service" class="form-input form-select">
              ${options.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">
            <span class="lang-en">Client Note or Name (For your records)</span>
            <span class="lang-es">Nota o Nombre del Cliente (Para tu control)</span>
          </label>
          <input type="text" id="gen-client-note" class="form-input" placeholder="e.g. voltxge / The-Golden" maxlength="60" />
        </div>

        <button type="submit" class="btn btn--primary" id="btn-gen-link" style="width: 100%; height: 46px; margin-top: 4px;">
          <span class="lang-en">Generate Review Link</span>
          <span class="lang-es">Generar Enlace de Reseña</span>
        </button>
      </form>

      <div id="gen-result-box" style="display: none; margin-top: 24px; padding: 18px; background: rgba(79, 195, 247, 0.05); border: 1px solid rgba(79, 195, 247, 0.2); border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span class="badge badge--accent" style="font-size: 0.7rem;">
            <span class="lang-en">Link Created</span>
            <span class="lang-es">Enlace Creado</span>
          </span>
          <span id="gen-token-tag" style="font-family: monospace; font-size: 0.8rem; color: var(--accent-primary);"></span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
          <span class="lang-en">Send this URL directly to your client:</span>
          <span class="lang-es">Envía esta URL directamente a tu cliente:</span>
        </p>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="gen-url-input" class="form-input" readonly style="font-size: 0.8rem; background: var(--bg-surface); cursor: text;" />
          <button id="btn-copy-gen-url" class="btn btn--primary" style="padding: 0 18px; font-size: 0.82rem; white-space: nowrap;">
            <span class="lang-en">Copy</span>
            <span class="lang-es">Copiar</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('gen-token-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const service = document.getElementById('gen-service').value;
    const clientNote = document.getElementById('gen-client-note').value;
    const btn = document.getElementById('btn-gen-link');

    btn.disabled = true;
    btn.innerHTML = '...';

    const tokenObj = await generateReviewToken({ service, clientNote });
    const fullUrl = `${window.location.origin}${window.location.pathname}?review=${tokenObj.token}`;

    const resBox = document.getElementById('gen-result-box');
    const tokenTag = document.getElementById('gen-token-tag');
    const urlInput = document.getElementById('gen-url-input');

    resBox.style.display = 'block';
    tokenTag.textContent = tokenObj.token;
    urlInput.value = fullUrl;

    btn.disabled = false;
    btn.innerHTML = '<span class="lang-en">Generate Review Link</span><span class="lang-es">Generar Enlace de Reseña</span>';

    const copyBtn = document.getElementById('btn-copy-gen-url');
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fullUrl);
      copyBtn.innerHTML = '<span class="lang-en">Copied</span><span class="lang-es">Copiado</span>';
      copyBtn.classList.add('btn--copied');
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="lang-en">Copy</span><span class="lang-es">Copiar</span>';
        copyBtn.classList.remove('btn--copied');
      }, 2500);
    };
  });
}

// ── TAB 2: PRICING PLANS CMS ──────────────────────────────────────────────────
async function loadPricingTab() {
  const el = document.getElementById('tab-content-pricing');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const plans = await getPricingPlans();

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <h4 style="margin: 0 0 4px; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
            <span class="lang-en">Pricing Plans Manager</span>
            <span class="lang-es">Gestor de Planes de Precios</span>
          </h4>
          <p style="margin: 0; font-size: 0.82rem; color: var(--text-muted);">
            <span class="lang-en">Edit your service rates in real-time. Updates appear instantly on the website.</span>
            <span class="lang-es">Modifica los precios de tus servicios. Los cambios se reflejan al instante en tu web.</span>
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
        ${plans.map(p => `
          <div class="pricing-edit-card" data-id="${p.id}" style="padding: 18px; background: var(--bg-surface); border: 1px solid ${p.popular ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-display); font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
                <span class="lang-en">${escapeHtml(p.title_en)}</span>
                <span class="lang-es">${escapeHtml(p.title_es)}</span>
              </span>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" class="price-pop-checkbox" ${p.popular ? 'checked' : ''} style="accent-color: var(--accent-primary);" />
                <span class="lang-en">Popular</span><span class="lang-es">Popular</span>
              </label>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">$ USD</span>
              <input type="number" step="0.50" min="0" class="form-input price-amount-input" value="${Number(p.price).toFixed(2)}" style="font-size: 1.1rem; font-weight: 700; color: var(--accent-primary); width: 120px;" />
              <button class="btn btn--outline btn-save-plan" style="padding: 6px 14px; font-size: 0.75rem; margin-left: auto;">
                <span class="lang-en">Save</span>
                <span class="lang-es">Guardar</span>
              </button>
            </div>
            <div class="plan-feedback" style="font-size: 0.72rem; color: #4ade80; display: none;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.pricing-edit-card').forEach(card => {
    const planId = card.dataset.id;
    const priceInput = card.querySelector('.price-amount-input');
    const popCheckbox = card.querySelector('.price-pop-checkbox');
    const saveBtn = card.querySelector('.btn-save-plan');
    const feedback = card.querySelector('.plan-feedback');

    saveBtn.addEventListener('click', async () => {
      const newPrice = parseFloat(priceInput.value);
      if (isNaN(newPrice) || newPrice < 0) return alert('Por favor ingresa un precio válido.');

      saveBtn.disabled = true;
      saveBtn.innerHTML = '...';
      const isPop = popCheckbox.checked;

      await updatePricingPlan(planId, { price: newPrice, popular: isPop });
      window.dispatchEvent(new CustomEvent('byjosh:pricing_updated'));

      feedback.style.display = 'block';
      const isEs = document.body.classList.contains('lang-es');
      feedback.textContent = isEs ? 'Precio guardado con éxito.' : 'Price saved successfully.';
      setTimeout(() => { feedback.style.display = 'none'; }, 2500);

      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span class="lang-en">Save</span><span class="lang-es">Guardar</span>';
      card.style.borderColor = isPop ? 'var(--accent-primary)' : 'var(--border-color)';
    });
  });
}

// ── TAB 3: GALLERY & MEDIA CMS ────────────────────────────────────────────────
async function loadProjectsTab() {
  const el = document.getElementById('tab-content-projects');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const [categories, dynProjects] = await Promise.all([
    getCategories(),
    getDynamicProjects()
  ]);

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 24px;">
      <!-- Upload New Project Card -->
      <div style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <h4 style="margin: 0 0 4px; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Upload New Project to Portfolio</span>
          <span class="lang-es">Subir Nuevo Trabajo al Portafolio</span>
        </h4>
        <p style="margin: 0 0 16px; font-size: 0.82rem; color: var(--text-muted);">
          <span class="lang-en">Upload images directly to Supabase Cloud Storage and add them to your portfolio gallery.</span>
          <span class="lang-es">Sube imágenes directamente a la nube de Supabase para agregarlas a la galería de tu portafolio.</span>
        </p>

        <form id="form-upload-project" style="display: flex; flex-direction: column; gap: 14px;">
          <!-- File selection -->
          <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center; cursor: pointer; transition: all 0.2s;" id="dropzone-box">
            <input type="file" id="proj-file-input" accept="image/png, image/jpeg, image/webp" style="display: none;" />
            <div id="dropzone-prompt">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--accent-primary)" stroke-width="1.8" fill="none" style="margin-bottom: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <div style="font-size: 0.84rem; color: var(--text-primary); font-weight: 600;">
                <span class="lang-en">Click or drag image here (.webp, .png, .jpg)</span>
                <span class="lang-es">Haz clic o arrastra tu imagen aquí (.webp, .png, .jpg)</span>
              </div>
              <span id="proj-file-name" style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Máx 15MB</span>
            </div>
            <img id="proj-preview-img" style="max-height: 140px; border-radius: var(--radius-sm); margin: 0 auto; display: none; object-fit: cover;" />
          </div>

          <!-- Project Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Título / Title *</label>
              <input type="text" id="proj-title-input" class="form-input" placeholder="e.g. SpaceUK Thumbnail" required />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Categoría / Category *</label>
              <select id="proj-cat-select" class="form-input form-select" required>
                ${categories.map(c => `
                  <option value="${c.id}">${c.name_es} (${c.name_en})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="proj-featured-check" checked style="accent-color: var(--accent-primary);" />
              <span class="lang-en">Mark as Featured (Shown on homepage default)</span>
              <span class="lang-es">Marcar como Destacado (Visible al inicio)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="proj-new-check" checked style="accent-color: var(--accent-primary);" />
              <span class="lang-en">Show "NEW" Badge</span>
              <span class="lang-es">Mostrar Insignia "NEW"</span>
            </label>
          </div>

          <button type="submit" id="btn-submit-project" class="btn btn--primary" style="align-self: flex-start; padding: 10px 24px; font-size: 0.84rem; display: inline-flex; align-items: center; gap: 8px;">
            <span class="lang-en">Upload & Publish</span>
            <span class="lang-es">Subir y Publicar</span>
          </button>
          <div id="upload-status-msg" style="font-size: 0.78rem; display: none;"></div>
        </form>
      </div>

      <!-- Uploaded Projects List -->
      <div>
        <h4 style="margin: 0 0 12px; color: var(--text-primary); font-size: 0.92rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Custom Uploaded Projects (${dynProjects.length})</span>
          <span class="lang-es">Trabajos Personalizados Subidos (${dynProjects.length})</span>
        </h4>
        ${dynProjects.length === 0 ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.82rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
            <span class="lang-en">No custom projects uploaded yet. Use the form above to add your first work!</span>
            <span class="lang-es">Aún no has subido trabajos personalizados. ¡Usa el formulario de arriba para agregar el primero!</span>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${dynProjects.map(p => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); gap: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                  <img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-light);" />
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${escapeHtml(p.title)}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">
                      ${escapeHtml(p.cat)}
                    </div>
                  </div>
                </div>
                <button class="btn btn--outline btn-delete-proj" data-id="${p.id}" data-img="${escapeHtml(p.img)}" style="padding: 4px 10px; font-size: 0.72rem; color: #f87171; border-color: rgba(248, 113, 113, 0.25);">
                  <span class="lang-en">Delete</span>
                  <span class="lang-es">Eliminar</span>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  const dropzone = document.getElementById('dropzone-box');
  const fileInput = document.getElementById('proj-file-input');
  const previewImg = document.getElementById('proj-preview-img');
  const fileNameEl = document.getElementById('proj-file-name');

  dropzone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      fileNameEl.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  const form = document.getElementById('form-upload-project');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files?.[0];
    const title = document.getElementById('proj-title-input').value;
    const catBase = document.getElementById('proj-cat-select').value;
    const isFeatured = document.getElementById('proj-featured-check').checked;
    const isNew = document.getElementById('proj-new-check').checked;
    const submitBtn = document.getElementById('btn-submit-project');
    const statusMsg = document.getElementById('upload-status-msg');

    if (!file) return alert('Por favor selecciona una imagen para subir.');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="custom-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Subiendo imagen a Supabase...';
    statusMsg.style.display = 'none';

    try {
      const publicUrl = await uploadProjectImage(file);
      const catList = isFeatured ? `featured,${catBase}` : catBase;

      await addDynamicProject({
        title,
        cat: catList,
        img: publicUrl,
        is_new: isNew
      });

      window.dispatchEvent(new CustomEvent('byjosh:projects_updated'));

      statusMsg.style.display = 'block';
      statusMsg.style.color = '#4ade80';
      statusMsg.textContent = '¡Trabajo subido y publicado con éxito!';

      setTimeout(() => {
        loadProjectsTab();
      }, 1000);
    } catch (err) {
      console.error('Upload failed:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="lang-en">Upload & Publish</span><span class="lang-es">Subir y Publicar</span>';
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = 'Error al subir: ' + (err.message || 'Verifica la conexión.');
    }
  });

  el.querySelectorAll('.btn-delete-proj').forEach(btn => {
    btn.addEventListener('click', async () => {
      const isEs = document.body.classList.contains('lang-es');
      if (!confirm(isEs ? '¿Seguro que deseas eliminar este trabajo del portafolio?' : 'Are you sure you want to delete this project?')) return;

      btn.disabled = true;
      btn.textContent = '...';
      await deleteDynamicProject(btn.dataset.id, btn.dataset.img);
      window.dispatchEvent(new CustomEvent('byjosh:projects_updated'));
      await loadProjectsTab();
    });
  });
}

// ── TAB 4: CATEGORIES CMS ─────────────────────────────────────────────────────
async function loadCategoriesTab() {
  const el = document.getElementById('tab-content-categories');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const categories = await getCategories();

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 24px;">
      <!-- Add New Category Form -->
      <div style="padding: 18px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <h4 style="margin: 0 0 4px; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Add New Category</span>
          <span class="lang-es">Agregar Nueva Categoría</span>
        </h4>
        <p style="margin: 0 0 14px; font-size: 0.82rem; color: var(--text-muted);">
          <span class="lang-en">Categories appear as gallery filter buttons, upload options, and review service tags.</span>
          <span class="lang-es">Las categorías aparecen como botones de filtro en la galería, opciones de subida y etiquetas de reseñas.</span>
        </p>

        <form id="form-add-category" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Nombre en Inglés (English Name) *</label>
              <input type="text" id="cat-name-en" class="form-input" placeholder="e.g. Logos & Branding" required />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Nombre en Español (Spanish Name) *</label>
              <input type="text" id="cat-name-es" class="form-input" placeholder="e.g. Logotipos y Marca" required />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Insignia opcional / Badge (e.g. NEW)</label>
              <input type="text" id="cat-badge" class="form-input" placeholder="NEW, HOT o vacío" maxlength="10" />
            </div>
            <div style="display: flex; align-items: flex-end;">
              <button type="submit" class="btn btn--primary" style="padding: 10px 20px; font-size: 0.82rem; width: 100%;">
                <span class="lang-en">+ Add Category</span>
                <span class="lang-es">+ Agregar Categoría</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Categories List -->
      <div>
        <h4 style="margin: 0 0 12px; color: var(--text-primary); font-size: 0.92rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Current Categories (${categories.length})</span>
          <span class="lang-es">Categorías Activas (${categories.length})</span>
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">
          ${categories.map(c => `
            <div style="padding: 12px 14px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                  <span>${escapeHtml(c.name_es)}</span>
                  ${c.badge ? `<span class="filter-badge" style="font-size: 0.6rem;">${escapeHtml(c.badge)}</span>` : ''}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(c.name_en)} &bull; <code>${escapeHtml(c.id)}</code></div>
              </div>
              <button class="btn btn--outline btn-del-cat" data-id="${c.id}" style="padding: 3px 8px; font-size: 0.68rem; color: #f87171; border-color: rgba(248, 113, 113, 0.2);" title="Eliminar categoría">
                &times;
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('form-add-category')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name_en = document.getElementById('cat-name-en').value.trim();
    const name_es = document.getElementById('cat-name-es').value.trim();
    const badge = document.getElementById('cat-badge').value.trim();

    await addCategory({ name_en, name_es, badge });
    window.dispatchEvent(new CustomEvent('byjosh:projects_updated'));
    await loadCategoriesTab();
  });

  el.querySelectorAll('.btn-del-cat').forEach(btn => {
    btn.addEventListener('click', async () => {
      const isEs = document.body.classList.contains('lang-es');
      if (!confirm(isEs ? '¿Eliminar esta categoría?' : 'Delete this category?')) return;
      await deleteCategory(btn.dataset.id);
      window.dispatchEvent(new CustomEvent('byjosh:projects_updated'));
      await loadCategoriesTab();
    });
  });
}

// ── TAB 5: REVIEWS MODERATION ─────────────────────────────────────────────────
async function loadReviewsTab() {
  const el = document.getElementById('tab-content-reviews');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const [reviews, cats] = await Promise.all([
    getAllReviews(),
    getCategories()
  ]);

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; color: var(--text-secondary);">
          <span class="lang-en">Manage reviews published on your portfolio:</span>
          <span class="lang-es">Gestiona las reseñas de tu portafolio:</span>
        </span>
        <button id="btn-toggle-manual-form" class="btn btn--outline" style="padding: 5px 14px; font-size: 0.75rem; height: 32px;">
          <span class="lang-en">+ Add Review</span>
          <span class="lang-es">+ Agregar Reseña</span>
        </button>
      </div>

      <div id="manual-review-box" style="display: none; padding: 18px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md);">
        <h5 style="margin: 0 0 12px; color: var(--text-primary); font-size: 0.92rem; font-family: var(--font-display);">
          <span class="lang-en">Add Client Review Manually</span>
          <span class="lang-es">Agregar Reseña de Cliente Manualmente</span>
        </h5>
        <form id="manual-review-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Nombre / Name *</label>
              <input type="text" id="man-name" class="form-input" placeholder="e.g. voltxge" required />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Red Social / Handle</label>
              <input type="text" id="man-handle" class="form-input" placeholder="e.g. @voltxge" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Servicio / Service</label>
              <select id="man-service" class="form-input form-select">
                ${cats.map(c => `<option value="${c.name_en}">${c.name_es} (${c.name_en})</option>`).join('')}
                <option value="Custom Design">Custom Design</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Calificación / Rating</label>
              <select id="man-rating" class="form-input form-select">
                <option value="5">5 Estrellas / Stars</option>
                <option value="4">4 Estrellas / Stars</option>
                <option value="3">3 Estrellas / Stars</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.72rem;">Comentario / Comment *</label>
            <textarea id="man-comment" class="form-input" rows="2" placeholder="Reseña del cliente..." required></textarea>
          </div>
          <button type="submit" class="btn btn--primary" style="padding: 8px 18px; font-size: 0.78rem; align-self: flex-start;">
            <span class="lang-en">Publish Review</span>
            <span class="lang-es">Publicar Reseña</span>
          </button>
        </form>
      </div>

      ${reviews.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.85rem;">
          <span class="lang-en">No reviews received yet.</span>
          <span class="lang-es">Aún no hay reseñas registradas.</span>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${reviews.map(r => `
            <div class="admin-review-card" style="padding: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${escapeHtml(r.name)}</span>
                    ${r.handle ? `<span style="font-size: 0.75rem; color: var(--accent-primary);">${escapeHtml(r.handle)}</span>` : ''}
                    <span class="badge ${r.status === 'approved' ? 'badge--primary' : r.status === 'hidden' ? 'badge--secondary' : 'badge--accent'}" style="font-size: 0.65rem; padding: 1px 6px;">
                      ${r.status}
                    </span>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.service)}</span>
                </div>
                <div style="display: flex; gap: 2px;">
                  ${renderStarIcons(r.rating)}
                </div>
              </div>

              <p style="margin: 0; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; font-style: italic;">
                "${escapeHtml(r.comment)}"
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 10px; margin-top: 2px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">
                  ${new Date(r.created_at).toLocaleDateString()}
                </span>
                <div style="display: flex; gap: 6px;">
                  ${r.status !== 'approved' ? `
                    <button class="btn btn--primary btn-approve-review" data-id="${r.id}" style="padding: 4px 10px; font-size: 0.7rem; border-radius: var(--radius-full);">
                      <span class="lang-en">Approve</span>
                      <span class="lang-es">Aprobar</span>
                    </button>
                  ` : `
                    <button class="btn btn--outline btn-hide-review" data-id="${r.id}" style="padding: 4px 10px; font-size: 0.7rem; border-radius: var(--radius-full);">
                      <span class="lang-en">Hide</span>
                      <span class="lang-es">Ocultar</span>
                    </button>
                  `}
                  <button class="btn btn--outline btn-delete-review" data-id="${r.id}" style="padding: 4px 10px; font-size: 0.7rem; color: #f87171; border-color: rgba(248, 113, 113, 0.2); border-radius: var(--radius-full);">
                    <span class="lang-en">Delete</span>
                    <span class="lang-es">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  const toggleBtn = document.getElementById('btn-toggle-manual-form');
  const manualBox = document.getElementById('manual-review-box');
  toggleBtn?.addEventListener('click', () => {
    manualBox.style.display = manualBox.style.display === 'none' ? 'block' : 'none';
  });

  const manualForm = document.getElementById('manual-review-form');
  manualForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('man-name').value;
    const handle = document.getElementById('man-handle').value;
    const service = document.getElementById('man-service').value;
    const rating = document.getElementById('man-rating').value;
    const comment = document.getElementById('man-comment').value;

    await submitReview({
      token: 'admin-manual-' + Date.now(),
      name,
      handle,
      service,
      rating,
      comment
    });

    const reviewsContainer = document.getElementById('reviews-cards-container');
    if (reviewsContainer) renderReviewsCards(reviewsContainer);

    await loadReviewsTab();
  });

  el.querySelectorAll('.btn-approve-review').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateReviewStatus(btn.dataset.id, 'approved');
      const reviewsContainer = document.getElementById('reviews-cards-container');
      if (reviewsContainer) renderReviewsCards(reviewsContainer);
      await loadReviewsTab();
    });
  });

  el.querySelectorAll('.btn-hide-review').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateReviewStatus(btn.dataset.id, 'hidden');
      const reviewsContainer = document.getElementById('reviews-cards-container');
      if (reviewsContainer) renderReviewsCards(reviewsContainer);
      await loadReviewsTab();
    });
  });

  el.querySelectorAll('.btn-delete-review').forEach(btn => {
    btn.addEventListener('click', async () => {
      const isEs = document.body.classList.contains('lang-es');
      if (!confirm(isEs ? '¿Seguro que deseas eliminar esta reseña permanentemente?' : 'Delete this review permanently?')) return;
      await deleteReview(btn.dataset.id);
      const reviewsContainer = document.getElementById('reviews-cards-container');
      if (reviewsContainer) renderReviewsCards(reviewsContainer);
      await loadReviewsTab();
    });
  });
}

// ── TAB 6: TOKENS MANAGEMENT ──────────────────────────────────────────────────
async function loadTokensTab() {
  const el = document.getElementById('tab-content-tokens');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const tokens = await getAllTokens();

  if (tokens.length === 0) {
    el.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.85rem;">
        <span class="lang-en">No links generated yet.</span>
        <span class="lang-es">Aún no se han generado enlaces.</span>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 10px;">
      <span style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
        <span class="lang-en">List of all single-use client links:</span>
        <span class="lang-es">Lista de todos los enlaces únicos de clientes:</span>
      </span>
      ${tokens.map(t => `
        <div style="padding: 12px 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 0.85rem; color: var(--text-primary); font-weight: 600;">${escapeHtml(t.token)}</span>
              <button class="btn btn--outline btn-copy-row-link" data-token="${t.token}" style="padding: 2px 8px; font-size: 0.65rem; border-radius: var(--radius-full);" title="Copiar enlace">
                <span class="lang-en">Copy</span><span class="lang-es">Copiar</span>
              </button>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              ${escapeHtml(t.service)} ${t.client_note ? `&bull; <em>${escapeHtml(t.client_note)}</em>` : ''}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn--outline btn-toggle-token" data-token="${t.token}" style="padding: 4px 10px; font-size: 0.7rem; border-radius: var(--radius-full);">
              <span class="badge ${t.used ? 'badge--secondary' : 'badge--primary'}" style="font-size: 0.65rem; padding: 1px 6px;">
                <span class="lang-en">${t.used ? 'Used' : 'Pending'}</span>
                <span class="lang-es">${t.used ? 'Utilizado' : 'Pendiente'}</span>
              </span>
            </button>
            <button class="btn btn--outline btn-delete-token" data-token="${t.token}" style="padding: 4px 8px; font-size: 0.7rem; color: #f87171; border-color: rgba(248, 113, 113, 0.2); border-radius: var(--radius-full);" title="Eliminar enlace">
              &times;
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  el.querySelectorAll('.btn-copy-row-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const fullUrl = `${window.location.origin}${window.location.pathname}?review=${btn.dataset.token}`;
      navigator.clipboard.writeText(fullUrl);
      btn.innerHTML = '<span class="lang-en">Copied</span><span class="lang-es">Copiado</span>';
      btn.classList.add('btn--copied');
      setTimeout(() => {
        btn.innerHTML = '<span class="lang-en">Copy</span><span class="lang-es">Copiar</span>';
        btn.classList.remove('btn--copied');
      }, 2500);
    });
  });

  el.querySelectorAll('.btn-toggle-token').forEach(btn => {
    btn.addEventListener('click', async () => {
      await toggleTokenUsed(btn.dataset.token);
      await loadTokensTab();
    });
  });

  el.querySelectorAll('.btn-delete-token').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteToken(btn.dataset.token);
      await loadTokensTab();
    });
  });
}

// ── TAB 7: SETTINGS ───────────────────────────────────────────────────────────
function renderSettingsTab() {
  const el = document.getElementById('tab-content-settings');
  if (!el) return;

  const sbConfig = getSupabaseConfig();
  const currentSbUrl = localStorage.getItem('byjosh_sb_url') || sbConfig.url;
  const currentSbKey = localStorage.getItem('byjosh_sb_key') || sbConfig.key;

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 24px;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <h4 style="margin: 0; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
            <span class="lang-en">Supabase Cloud Database & Storage</span>
            <span class="lang-es">Base de Datos y Almacenamiento Supabase</span>
          </h4>
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: var(--radius-full); font-size: 0.72rem; color: var(--accent-primary);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="lang-en">Cloud Connected</span>
            <span class="lang-es">Nube Conectada</span>
          </div>
        </div>
        <p style="margin: 0 0 14px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
          <span class="lang-en">Connected to your Supabase project. Prices, projects, images, reviews, and tokens synchronize globally.</span>
          <span class="lang-es">Conectado a tu proyecto de Supabase. Precios, imágenes, proyectos, reseñas y tokens se sincronizan globalmente.</span>
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Project URL</label>
            <input type="text" id="sb-url-input" class="form-input" placeholder="https://xyzcompany.supabase.co" value="${escapeHtml(currentSbUrl)}" />
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Anon / Publishable Key</label>
            <input type="password" id="sb-key-input" class="form-input" placeholder="sb_publishable_... o eyJhbGciOiJIUzI1NiIsIn..." value="${escapeHtml(currentSbKey)}" />
          </div>
          <button id="btn-save-sb" class="btn btn--primary" style="align-self: flex-start; padding: 10px 22px; font-size: 0.82rem;">
            <span class="lang-en">Save Connection</span>
            <span class="lang-es">Guardar Conexión</span>
          </button>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 18px;">
        <h4 style="margin: 0 0 6px; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Change Admin PIN</span>
          <span class="lang-es">Cambiar PIN de Acceso</span>
        </h4>
        <div style="display: flex; gap: 10px; align-items: flex-end; margin-top: 10px;">
          <div style="flex: 1;">
            <label class="form-label" style="font-size: 0.75rem;">
              <span class="lang-en">New PIN</span>
              <span class="lang-es">Nuevo PIN</span>
            </label>
            <input type="password" id="new-pin-input" class="form-input" placeholder="e.g. 1234" maxlength="30" />
          </div>
          <button id="btn-save-pin" class="btn btn--outline" style="padding: 10px 20px; font-size: 0.82rem;">
            <span class="lang-en">Update PIN</span>
            <span class="lang-es">Actualizar PIN</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-save-sb')?.addEventListener('click', () => {
    const url = document.getElementById('sb-url-input').value;
    const key = document.getElementById('sb-key-input').value;
    saveSupabaseConfig(url, key);
    const isEs = document.body.classList.contains('lang-es');
    alert(isEs ? 'Credenciales de Supabase guardadas con éxito.' : 'Supabase credentials saved successfully.');
  });

  document.getElementById('btn-save-pin')?.addEventListener('click', () => {
    const pin = document.getElementById('new-pin-input').value;
    const isEs = document.body.classList.contains('lang-es');
    if (!pin) return alert(isEs ? 'Por favor ingresa un PIN válido.' : 'Please enter a valid PIN.');
    setAdminPIN(pin);
    alert(isEs ? 'PIN de administrador actualizado con éxito.' : 'Admin PIN updated successfully.');
    document.getElementById('new-pin-input').value = '';
  });
}

function renderStarIcons(count) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= count;
    html += `
      <svg viewBox="0 0 24 24" width="13" height="13" fill="${filled ? '#4fc3f7' : 'none'}" stroke="${filled ? '#4fc3f7' : 'rgba(255,255,255,0.2)'}" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;
  }
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
