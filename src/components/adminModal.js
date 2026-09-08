/**
 * Admin Panel Modal for ByJosh
 * Activated by ?admin or clicking the footer trigger.
 * Protected by PIN.
 * 100% Native ByJosh UI Theme — Bilingual (English / Spanish)
 * Features:
 *  - Create single-use client links
 *  - Add reviews manually from Discord / WhatsApp
 *  - Manage review status (Approve, Hide, Delete)
 *  - Manage active tokens (Mark Used, Delete)
 *  - Connect Supabase Cloud Database
 */
import {
  getAdminPIN,
  setAdminPIN,
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
import { renderReviewsCards } from '../sections/reviews.js';

export function initAdminModal() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const shouldOpen = urlParams.has('admin') || hash.includes('admin');

  const footerTrigger = document.getElementById('footer-admin-trigger');
  if (footerTrigger) {
    footerTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openAdmin();
    });
  }

  if (shouldOpen) {
    openAdmin();
  }
}

export function openAdmin() {
  if (document.getElementById('byjosh-admin-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'byjosh-admin-modal';
  modal.className = 'custom-modal is-open';
  modal.innerHTML = `
    <div class="custom-modal__backdrop"></div>
    <div class="custom-modal__box custom-modal__box--large">
      <div class="modal-top-actions">
        <button type="button" class="btn btn--outline modal-lang-btn" id="admin-modal-lang-btn" aria-label="Toggle language">
          <span class="lang-en">ES</span><span class="lang-es">EN</span>
        </button>
        <button class="custom-modal__close" id="admin-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div id="admin-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.custom-modal__backdrop');
  const closeBtn = modal.querySelector('#admin-modal-close');
  const langBtn = modal.querySelector('#admin-modal-lang-btn');
  const bodyEl = modal.querySelector('#admin-modal-body');

  function toggleLang() {
    document.body.classList.toggle('lang-es');
    const isEs = document.body.classList.contains('lang-es');
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
        <span class="lang-en">Enter your master PIN to manage links and reviews.</span>
        <span class="lang-es">Ingresa tu PIN maestro para gestionar enlaces y reseñas.</span>
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
            <span class="lang-en">Admin</span><span class="lang-es">Panel</span>
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

      if (tab.dataset.tab === 'reviews') loadReviewsTab();
      if (tab.dataset.tab === 'tokens') loadTokensTab();
    });
  });

  renderCreateTab();
  renderSettingsTab();
}

function renderCreateTab() {
  const el = document.getElementById('tab-content-create');
  if (!el) return;

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
              <option value="Thumbnails">Thumbnails ($4.50 USD)</option>
              <option value="Profile Pictures / AVIS">Profile Pictures / AVIS ($4.00 USD)</option>
              <option value="Headers & Banners">Headers & Banners ($7.00 USD)</option>
              <option value="UI & Overlays">UI & Overlays ($10.50 USD)</option>
              <option value="Brand Identity">Brand Identity / Logos</option>
              <option value="Custom Design">Custom Design / Personalizado</option>
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
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="gen-link-output" class="form-input" readonly style="font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.35);" />
          <button class="btn btn--primary" id="btn-copy-link" style="white-space: nowrap; padding: 0 18px; height: 42px; font-size: 0.82rem;">
            <span class="lang-en">Copy</span>
            <span class="lang-es">Copiar</span>
          </button>
        </div>
        <p style="margin: 10px 0 0; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">
          <span class="lang-en">Send this link to your client on Discord or WhatsApp. It can only be used once.</span>
          <span class="lang-es">Envía este enlace a tu cliente por Discord o WhatsApp. Solo puede ser utilizado una vez.</span>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('gen-token-form');
  const resultBox = document.getElementById('gen-result-box');
  const linkOutput = document.getElementById('gen-link-output');
  const copyBtn = document.getElementById('btn-copy-link');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const service = document.getElementById('gen-service').value;
    const note = document.getElementById('gen-client-note').value;

    const tokenObj = await generateReviewToken({ service, clientNote: note });
    const baseUrl = window.location.origin + window.location.pathname;
    const fullLink = `${baseUrl}?review=${tokenObj.token}`;

    linkOutput.value = fullLink;
    resultBox.style.display = 'block';

    copyBtn.innerHTML = '<span class="lang-en">Copy</span><span class="lang-es">Copiar</span>';
    copyBtn.classList.remove('btn--copied');
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(linkOutput.value).then(() => {
      copyBtn.innerHTML = '<span class="lang-en">Copied</span><span class="lang-es">Copiado</span>';
      copyBtn.classList.add('btn--copied');
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="lang-en">Copy</span><span class="lang-es">Copiar</span>';
        copyBtn.classList.remove('btn--copied');
      }, 2500);
    });
  });
}

async function loadReviewsTab() {
  const el = document.getElementById('tab-content-reviews');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const reviews = await getAllReviews();

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 14px;">
      <!-- Top Action Bar: Add Review Manually Button -->
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

      <!-- Manual Review Form (Collapsible) -->
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
                <option value="Thumbnails">Thumbnails</option>
                <option value="Headers & Banners">Headers & Banners</option>
                <option value="Profile Pictures / AVIS">Profile Pictures / AVIS</option>
                <option value="UI & Overlays">UI & Overlays</option>
                <option value="Custom Design">Custom Design</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Calificación / Rating</label>
              <select id="man-rating" class="form-input form-select">
                <option value="5">5 Estrellas (★★★★★)</option>
                <option value="4">4 Estrellas (★★★★☆)</option>
                <option value="3">3 Estrellas (★★★☆☆)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.72rem;">Comentario / Feedback *</label>
            <textarea id="man-comment" class="form-input form-textarea" rows="3" placeholder="Escribe el comentario del cliente..." required></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" id="btn-cancel-manual" class="btn btn--outline" style="padding: 6px 14px; font-size: 0.78rem;">Cancelar</button>
            <button type="submit" class="btn btn--primary" style="padding: 6px 18px; font-size: 0.78rem;">Publicar Reseña</button>
          </div>
        </form>
      </div>

      <!-- Reviews List -->
      <div id="admin-reviews-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;">
        ${(!reviews || reviews.length === 0) ? `
          <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            <span class="lang-en">No reviews registered yet. Use '+ Add Review' to publish one manually.</span>
            <span class="lang-es">No hay reseñas registradas aún. Usa '+ Agregar Reseña' para añadir una.</span>
          </div>
        ` : reviews.map(r => `
          <div class="admin-review-item" id="admin-rev-${r.id}" style="padding: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <span style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem;">${escapeHtml(r.name)}</span>
                ${r.handle ? `<span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 6px;">(${escapeHtml(r.handle)})</span>` : ''}
                <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                  ${renderStarIcons(r.rating || 5)}
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 4px;">${r.rating}/5</span>
                </div>
              </div>
              <span class="badge ${r.status === 'approved' ? 'badge--accent' : 'badge--secondary'}" style="font-size: 0.65rem;">
                <span class="lang-en">${r.status === 'approved' ? 'Published' : 'Hidden'}</span>
                <span class="lang-es">${r.status === 'approved' ? 'Publicada' : 'Oculta'}</span>
              </span>
            </div>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; font-style: italic;">
              “${escapeHtml(r.comment)}”
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--border-color);">
              <span style="color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(r.service || 'Design')}</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn--outline btn-toggle-status" data-id="${r.id}" data-current="${r.status}" style="padding: 4px 12px; font-size: 0.72rem; border-radius: var(--radius-full);">
                  <span class="lang-en">${r.status === 'approved' ? 'Hide' : 'Approve'}</span>
                  <span class="lang-es">${r.status === 'approved' ? 'Ocultar' : 'Aprobar'}</span>
                </button>
                <button class="btn btn--outline btn-delete-rev" data-id="${r.id}" style="padding: 4px 12px; font-size: 0.72rem; color: #f87171; border-color: rgba(248, 113, 113, 0.25); border-radius: var(--radius-full);">
                  <span class="lang-en">Delete</span>
                  <span class="lang-es">Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Manual Review Form Logic
  const toggleBtn = document.getElementById('btn-toggle-manual-form');
  const manualBox = document.getElementById('manual-review-box');
  const cancelBtn = document.getElementById('btn-cancel-manual');
  const manualForm = document.getElementById('manual-review-form');

  toggleBtn?.addEventListener('click', () => {
    const isShown = manualBox.style.display !== 'none';
    manualBox.style.display = isShown ? 'none' : 'block';
  });

  cancelBtn?.addEventListener('click', () => {
    manualBox.style.display = 'none';
  });

  manualForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('man-name').value;
    const handle = document.getElementById('man-handle').value;
    const service = document.getElementById('man-service').value;
    const rating = parseInt(document.getElementById('man-rating').value, 10) || 5;
    const comment = document.getElementById('man-comment').value;

    await submitReview({
      token: 'manual-' + Date.now(),
      name,
      handle,
      service,
      rating,
      comment
    });

    await loadReviewsTab();
    renderReviewsCards();
  });

  el.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const current = btn.dataset.current;
      const next = current === 'approved' ? 'hidden' : 'approved';
      await updateReviewStatus(id, next);
      await loadReviewsTab();
      renderReviewsCards();
    });
  });

  el.querySelectorAll('.btn-delete-rev').forEach(btn => {
    btn.addEventListener('click', async () => {
      const isEs = document.body.classList.contains('lang-es');
      const msg = isEs ? '¿Deseas eliminar esta reseña permanentemente?' : 'Permanently delete this review?';
      if (confirm(msg)) {
        await deleteReview(btn.dataset.id);
        await loadReviewsTab();
        renderReviewsCards();
      }
    });
  });
}

async function loadTokensTab() {
  const el = document.getElementById('tab-content-tokens');
  if (!el) return;

  el.innerHTML = '<div style="padding: 30px; text-align: center;"><div class="custom-spinner"></div></div>';
  const tokens = await getAllTokens();

  if (!tokens || tokens.length === 0) {
    el.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        <span class="lang-en">No active links generated yet.</span>
        <span class="lang-es">No has generado ningún enlace aún.</span>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto;">
      ${tokens.map(t => `
        <div style="padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div>
            <div style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600;">
              ${escapeHtml(t.service)} ${t.client_note ? `<span style="font-weight: 400; color: var(--text-muted);">— ${escapeHtml(t.client_note)}</span>` : ''}
            </div>
            <code style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${escapeHtml(t.token)}</code>
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

function renderSettingsTab() {
  const el = document.getElementById('tab-content-settings');
  if (!el) return;

  const currentSbUrl = localStorage.getItem('byjosh_sb_url') || '';
  const currentSbKey = localStorage.getItem('byjosh_sb_key') || '';

  el.innerHTML = `
    <div style="padding: 6px 0; display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h4 style="margin: 0 0 6px; color: var(--text-primary); font-size: 0.95rem; font-family: var(--font-display); font-weight: 700;">
          <span class="lang-en">Supabase Cloud Database (Cloud Sync)</span>
          <span class="lang-es">Base de Datos Supabase (Sincronización en la Nube)</span>
        </h4>
        <p style="margin: 0 0 14px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
          <span class="lang-en">To synchronize reviews submitted by clients across the world in real-time, paste your Supabase Project URL & Anon Key:</span>
          <span class="lang-es">Para sincronizar en tiempo real las reseñas que envían tus clientes desde sus computadoras, pega tu Project URL y Anon Key de Supabase:</span>
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Project URL</label>
            <input type="text" id="sb-url-input" class="form-input" placeholder="https://xyzcompany.supabase.co" value="${escapeHtml(currentSbUrl)}" />
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Anon Public Key</label>
            <input type="password" id="sb-key-input" class="form-input" placeholder="eyJhbGciOiJIUzI1NiIsIn..." value="${escapeHtml(currentSbKey)}" />
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
