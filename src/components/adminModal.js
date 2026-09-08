/**
 * Admin Panel Modal for ByJosh
 * Activated by ?admin or clicking the footer trigger.
 * Protected by PIN.
 * Features:
 *  1. Generate unique single-use review links with 1 click
 *  2. Review moderation (approve, hide, delete)
 *  3. Cloud Database settings (Supabase credentials & PIN change)
 */
import {
  getAdminPIN,
  setAdminPIN,
  saveSupabaseConfig,
  generateReviewToken,
  getAllReviews,
  getAllTokens,
  updateReviewStatus,
  deleteReview
} from '../utils/reviewsDB.js';
import { renderReviewsCards } from '../sections/reviews.js';

export function initAdminModal() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const shouldOpen = urlParams.has('admin') || hash.includes('admin');

  // Also bind to footer trigger
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
      <button class="custom-modal__close" id="admin-modal-close" aria-label="Close">&times;</button>
      <div id="admin-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.custom-modal__backdrop');
  const closeBtn = modal.querySelector('#admin-modal-close');
  const bodyEl = modal.querySelector('#admin-modal-body');

  function closeAdmin() {
    modal.classList.remove('is-open');
    setTimeout(() => modal.remove(), 300);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  backdrop.addEventListener('click', closeAdmin);
  closeBtn.addEventListener('click', closeAdmin);

  // Check session authentication
  const isAuth = sessionStorage.getItem('byjosh_admin_auth') === '1';
  if (isAuth) {
    renderDashboard(bodyEl);
  } else {
    renderPinScreen(bodyEl);
  }
}

function renderPinScreen(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <div class="modal-icon modal-icon--lock">🔐</div>
      <h3 style="margin: 12px 0 6px; color: var(--text-primary); font-size: 1.3rem;">Panel de Administración</h3>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 24px;">
        Ingresa tu PIN de acceso para gestionar enlaces y reseñas.
      </p>

      <form id="admin-pin-form" style="max-width: 320px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px;">
        <input type="password" id="admin-pin-input" class="form-input" placeholder="PIN de acceso" required autofocus style="text-align: center; letter-spacing: 4px; font-size: 1.2rem;" />
        <div id="pin-error" style="color: #ff5252; font-size: 0.82rem; display: none;">PIN incorrecto. Inténtalo de nuevo.</div>
        <button type="submit" class="btn btn--primary" style="width: 100%; padding: 12px; font-weight: 700;">
          Entrar al Panel
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
        <div style="display: flex; align-items: center; gap: 10px;">
          <h3 style="margin: 0; color: var(--text-primary); font-size: 1.25rem;">Panel ByJosh</h3>
          <span class="badge badge--accent" style="font-size: 0.65rem;">Admin</span>
        </div>
        <button id="admin-logout-btn" class="btn btn--outline" style="padding: 4px 12px; font-size: 0.75rem;">Cerrar Sesión</button>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab is-active" data-tab="create">⚡ Generar Link</button>
        <button class="admin-tab" data-tab="reviews">💬 Reseñas</button>
        <button class="admin-tab" data-tab="tokens">🔗 Enlaces Activos</button>
        <button class="admin-tab" data-tab="settings">⚙️ Configuración</button>
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

  // Render initial tab (Create)
  renderCreateTab();
  renderSettingsTab();
}

function renderCreateTab() {
  const el = document.getElementById('tab-content-create');
  if (!el) return;

  el.innerHTML = `
    <div style="padding: 10px 0;">
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 20px;">
        Genera un link único de reseña para entregarle a tu cliente tras el pago y entrega del trabajo.
      </p>

      <form id="gen-token-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label class="form-label">Servicio Realizado</label>
          <select id="gen-service" class="form-input" style="cursor: pointer;">
            <option value="Geometry Dash & Gaming">Geometry Dash & Gaming ($4.50)</option>
            <option value="Profile Pictures / AVIS">Profile Pictures / AVIS ($4.00)</option>
            <option value="Headers & Banners">Headers & Banners ($7.00)</option>
            <option value="UI & Overlays">UI & Overlays ($10.50)</option>
            <option value="Brand Identity">Brand Identity / Logos</option>
            <option value="Diseño Personalizado">Diseño Personalizado</option>
          </select>
        </div>

        <div>
          <label class="form-label">Nota o Nombre del Cliente (Para tu control)</label>
          <input type="text" id="gen-client-note" class="form-input" placeholder="Ej. Alex GD - Discord" maxlength="60" />
        </div>

        <button type="submit" class="btn btn--primary" id="btn-gen-link" style="padding: 12px; font-weight: 700;">
          ⚡ Generar Enlace de Reseña
        </button>
      </form>

      <div id="gen-result-box" style="display: none; margin-top: 24px; padding: 18px; background: rgba(74, 222, 128, 0.08); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px;">
        <span style="font-size: 0.78rem; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.5px;">✓ Enlace Generado con Éxito</span>
        <div style="margin: 10px 0; display: flex; gap: 8px;">
          <input type="text" id="gen-link-output" class="form-input" readonly style="font-family: monospace; font-size: 0.82rem; background: rgba(0,0,0,0.4);" />
          <button class="btn btn--primary" id="btn-copy-link" style="white-space: nowrap; padding: 0 16px;">Copiar</button>
        </div>
        <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
          Copia este enlace y envíaselo a tu cliente por Discord o WhatsApp. Solo puede ser utilizado una vez.
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

    copyBtn.textContent = 'Copiar';
    copyBtn.style.background = '';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(linkOutput.value).then(() => {
      copyBtn.textContent = '¡Copiado! ✓';
      copyBtn.style.background = '#22c55e';
      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
        copyBtn.style.background = '';
      }, 2500);
    });
  });
}

async function loadReviewsTab() {
  const el = document.getElementById('tab-content-reviews');
  if (!el) return;

  el.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);"><div class="custom-spinner"></div></div>';
  const reviews = await getAllReviews();

  if (!reviews || reviews.length === 0) {
    el.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-muted);">No hay reseñas registradas aún.</div>';
    return;
  }

  el.innerHTML = `
    <div style="padding: 10px 0; display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
      ${reviews.map(r => `
        <div class="admin-review-item" id="admin-rev-${r.id}" style="padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHtml(r.name)}</strong>
              ${r.handle ? `<span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 6px;">(${escapeHtml(r.handle)})</span>` : ''}
              <div style="color: #f59e0b; font-size: 0.85rem; margin-top: 2px;">${'★'.repeat(r.rating || 5)} (${r.rating}/5)</div>
            </div>
            <span class="badge ${r.status === 'approved' ? 'badge--accent' : 'badge--secondary'}" style="font-size: 0.65rem;">
              ${r.status === 'approved' ? 'Publicada' : 'Oculta'}
            </span>
          </div>
          <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
            “${escapeHtml(r.comment)}”
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
            <span style="color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(r.service || 'Diseño')}</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn--outline btn-toggle-status" data-id="${r.id}" data-current="${r.status}" style="padding: 3px 10px; font-size: 0.72rem;">
                ${r.status === 'approved' ? 'Ocultar' : 'Aprobar'}
              </button>
              <button class="btn btn--outline btn-delete-rev" data-id="${r.id}" style="padding: 3px 10px; font-size: 0.72rem; color: #ff5252; border-color: rgba(255,82,82,0.3);">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Bind actions
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
      if (confirm('¿Seguro que deseas eliminar esta reseña permanentemente?')) {
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

  el.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);"><div class="custom-spinner"></div></div>';
  const tokens = await getAllTokens();

  if (!tokens || tokens.length === 0) {
    el.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-muted);">No has generado ningún enlace aún.</div>';
    return;
  }

  el.innerHTML = `
    <div style="padding: 10px 0; display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto;">
      ${tokens.map(t => `
        <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600;">
              ${escapeHtml(t.service)} ${t.client_note ? `<span style="font-weight: 400; color: var(--text-muted);">— ${escapeHtml(t.client_note)}</span>` : ''}
            </div>
            <code style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(t.token)}</code>
          </div>
          <span class="badge ${t.used ? 'badge--secondary' : 'badge--primary'}" style="font-size: 0.65rem; white-space: nowrap;">
            ${t.used ? '✓ Utilizado' : '⏳ Pendiente'}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSettingsTab() {
  const el = document.getElementById('tab-content-settings');
  if (!el) return;

  const currentSbUrl = localStorage.getItem('byjosh_sb_url') || '';
  const currentSbKey = localStorage.getItem('byjosh_sb_key') || '';

  el.innerHTML = `
    <div style="padding: 10px 0; display: flex; flex-direction: column; gap: 24px;">
      <!-- Supabase Cloud Connection -->
      <div>
        <h4 style="margin: 0 0 6px; color: var(--text-primary); font-size: 0.95rem;">Base de Datos Supabase (Opcional)</h4>
        <p style="margin: 0 0 14px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
          Para sincronizar las reseñas en la nube gratis, pega tus credenciales de tu proyecto en Supabase. Si las dejas vacías, el sistema funciona de forma local.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Project URL</label>
            <input type="text" id="sb-url-input" class="form-input" placeholder="https://xyzcompany.supabase.co" value="${escapeHtml(currentSbUrl)}" />
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Anon Public Key</label>
            <input type="password" id="sb-key-input" class="form-input" placeholder="eyJhbGciOiJIUzI1NiIsIn..." value="${escapeHtml(currentSbKey)}" />
          </div>
          <button id="btn-save-sb" class="btn btn--primary" style="align-self: flex-start; padding: 8px 18px; font-size: 0.85rem;">
            Guardar Conexión
          </button>
        </div>
      </div>

      <!-- PIN Change -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;">
        <h4 style="margin: 0 0 6px; color: var(--text-primary); font-size: 0.95rem;">Cambiar PIN de Acceso</h4>
        <div style="display: flex; gap: 10px; align-items: flex-end; margin-top: 10px;">
          <div style="flex: 1;">
            <label class="form-label" style="font-size: 0.75rem;">Nuevo PIN</label>
            <input type="password" id="new-pin-input" class="form-input" placeholder="Ej. 1234 o miClave" maxlength="30" />
          </div>
          <button id="btn-save-pin" class="btn btn--outline" style="padding: 10px 18px; font-size: 0.85rem;">
            Actualizar PIN
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-save-sb')?.addEventListener('click', () => {
    const url = document.getElementById('sb-url-input').value;
    const key = document.getElementById('sb-key-input').value;
    saveSupabaseConfig(url, key);
    alert('Credenciales de Supabase guardadas con éxito.');
  });

  document.getElementById('btn-save-pin')?.addEventListener('click', () => {
    const pin = document.getElementById('new-pin-input').value;
    if (!pin) return alert('Por favor ingresa un PIN válido.');
    setAdminPIN(pin);
    alert('PIN de administrador actualizado con éxito.');
    document.getElementById('new-pin-input').value = '';
  });
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
