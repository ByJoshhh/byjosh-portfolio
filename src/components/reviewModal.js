/**
 * Client Review Modal
 * Activated when ?review=TOKEN is in the URL.
 * 100% Native ByJosh UI Theme — Clean SVG Line Icons, Vector Stars, No Emojis
 */
import { validateToken, submitReview } from '../utils/reviewsDB.js';
import { renderReviewsCards } from '../sections/reviews.js';

export async function initReviewModal() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  
  let token = urlParams.get('review');
  if (!token && hash.includes('review')) {
    const hashParams = new URLSearchParams(hash.split('?')[1] || '');
    token = hashParams.get('token');
  }

  if (!token) return;

  const modal = document.createElement('div');
  modal.id = 'client-review-modal';
  modal.className = 'custom-modal is-open';
  modal.innerHTML = `
    <div class="custom-modal__backdrop"></div>
    <div class="custom-modal__box">
      <button class="custom-modal__close" id="review-modal-close" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div id="review-modal-content">
        <div class="review-modal__loading" style="text-align: center; padding: 40px 10px;">
          <div class="custom-spinner"></div>
          <p style="margin-top: 16px; color: var(--text-secondary); font-size: 0.88rem;">Verificando enlace de cliente...</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.custom-modal__backdrop');
  const closeBtn = modal.querySelector('#review-modal-close');
  const contentEl = modal.querySelector('#review-modal-content');

  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => modal.remove(), 300);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  const validation = await validateToken(token);

  if (!validation.valid) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 16px 6px;">
        <div class="modal-icon-badge" style="border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08); color: #ef4444;">
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3 style="margin: 12px 0 6px; color: var(--text-primary); font-family: var(--font-display); font-size: 1.4rem;">Enlace no disponible</h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; margin-bottom: 24px;">
          ${escapeHtml(validation.error || 'Este enlace ya fue utilizado o no es válido.')}
        </p>
        <button class="btn btn--primary" id="btn-err-close" style="width: 100%; height: 44px;">
          Explorar Portafolio
        </button>
      </div>
    `;
    document.getElementById('btn-err-close')?.addEventListener('click', closeModal);
    return;
  }

  const tokenData = validation.tokenData;
  const serviceName = tokenData.service || 'Diseño Gráfico';
  let currentRating = 5;

  contentEl.innerHTML = `
    <div class="review-form">
      <div class="review-form__header">
        <span class="section__tag" style="margin-bottom: 6px;">Valoración de Cliente</span>
        <h3 class="review-form__title" style="font-family: var(--font-display);">Comparte tu Experiencia</h3>
        <p class="review-form__subtitle">
          Servicio: <strong style="color: var(--accent-primary);">${escapeHtml(serviceName)}</strong>
        </p>
      </div>

      <form id="review-submit-form" style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Star Rating Picker using Clean SVGs -->
        <div>
          <label class="form-label">Calificación</label>
          <div class="star-rating-picker" id="star-picker">
            ${[1, 2, 3, 4, 5].map(val => `
              <button type="button" class="star-btn active" data-value="${val}" aria-label="${val} estrellas">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            `).join('')}
          </div>
          <div class="star-rating-caption" id="star-caption">Excelente trabajo (5/5)</div>
        </div>

        <div>
          <label class="form-label" for="rev-author-name">Nombre o Apodo *</label>
          <input type="text" id="rev-author-name" class="form-input" placeholder="Ej. Kroh, Alex..." required maxlength="40" />
        </div>

        <div>
          <label class="form-label" for="rev-author-handle">Red Social o Discord (Opcional)</label>
          <input type="text" id="rev-author-handle" class="form-input" placeholder="Ej. @usuario o Discord: Tag#0001" maxlength="50" />
        </div>

        <div>
          <label class="form-label" for="rev-comment">Tu Opinión sobre el Trabajo *</label>
          <textarea id="rev-comment" class="form-input form-textarea" rows="4" placeholder="¿Qué te pareció el diseño y la atención?..." required maxlength="600"></textarea>
        </div>

        <button type="submit" class="btn btn--primary" id="btn-submit-review" style="width: 100%; height: 46px; margin-top: 4px;">
          Publicar Reseña
        </button>
      </form>
    </div>
  `;

  const starPicker = document.getElementById('star-picker');
  const starBtns = starPicker.querySelectorAll('.star-btn');
  const starCaption = document.getElementById('star-caption');

  const captions = {
    1: 'Mala experiencia (1/5)',
    2: 'Regular (2/5)',
    3: 'Bueno (3/5)',
    4: 'Muy bueno (4/5)',
    5: 'Excelente trabajo (5/5)'
  };

  function updateStars(val) {
    starBtns.forEach(btn => {
      const btnVal = parseInt(btn.dataset.value, 10);
      btn.classList.toggle('active', btnVal <= val);
    });
    starCaption.textContent = captions[val] || `${val}/5`;
  }

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      updateStars(parseInt(btn.dataset.value, 10));
    });
    btn.addEventListener('click', () => {
      currentRating = parseInt(btn.dataset.value, 10);
      updateStars(currentRating);
    });
  });

  starPicker.addEventListener('mouseleave', () => {
    updateStars(currentRating);
  });

  const form = document.getElementById('review-submit-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-review');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const name = document.getElementById('rev-author-name').value;
    const handle = document.getElementById('rev-author-handle').value;
    const comment = document.getElementById('rev-comment').value;

    try {
      const res = await submitReview({
        token,
        name,
        handle,
        service: serviceName,
        rating: currentRating,
        comment
      });

      if (res.success) {
        contentEl.innerHTML = `
          <div style="text-align: center; padding: 20px 6px;">
            <div class="modal-icon-badge" style="color: var(--accent-primary);">
              <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span class="section__tag" style="margin-bottom: 6px;">Publicada</span>
            <h3 style="margin: 0 0 8px; color: var(--text-primary); font-family: var(--font-display); font-size: 1.4rem;">¡Gracias por tu Reseña!</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px;">
              Tus comentarios ayudan a otros creadores a conocer la calidad de mi trabajo.
            </p>
            <button class="btn btn--primary" id="btn-done-close" style="width: 100%; height: 44px;">
              Ver en la Web
            </button>
          </div>
        `;

        document.getElementById('btn-done-close')?.addEventListener('click', () => {
          closeModal();
          document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
        });

        renderReviewsCards();
      }
    } catch (err) {
      alert('Ocurrió un error al enviar la reseña. Inténtalo de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Publicar Reseña';
    }
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
