/**
 * Client Review Modal
 * Activated when ?review=TOKEN is in the URL.
 * 100% Native ByJosh UI Theme — Bilingual (English / Spanish) with In-Modal Language Switcher
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
      <div class="modal-top-actions">
        <button type="button" class="btn btn--outline modal-lang-btn" id="review-modal-lang-btn" aria-label="Toggle language">
          <span class="lang-en">ES</span><span class="lang-es">EN</span>
        </button>
        <button class="custom-modal__close" id="review-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div id="review-modal-content">
        <div class="review-modal__loading" style="text-align: center; padding: 40px 10px;">
          <div class="custom-spinner"></div>
          <p style="margin-top: 16px; color: var(--text-secondary); font-size: 0.88rem;">
            <span class="lang-en">Verifying client link...</span>
            <span class="lang-es">Verificando enlace de cliente...</span>
          </p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.custom-modal__backdrop');
  const closeBtn = modal.querySelector('#review-modal-close');
  const langBtn = modal.querySelector('#review-modal-lang-btn');
  const contentEl = modal.querySelector('#review-modal-content');

  function toggleLang() {
    document.body.classList.toggle('lang-es');
    const isEs = document.body.classList.contains('lang-es');
    localStorage.setItem('byjosh_lang', isEs ? 'es' : 'en');
    window.dispatchEvent(new CustomEvent('byjosh:langchange', { detail: { lang: isEs ? 'es' : 'en' } }));
    updatePlaceholders();
  }

  langBtn.addEventListener('click', toggleLang);

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
        <h3 style="margin: 12px 0 6px; color: var(--text-primary); font-family: var(--font-display); font-size: 1.4rem;">
          <span class="lang-en">Link Unavailable</span>
          <span class="lang-es">Enlace no disponible</span>
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; margin-bottom: 24px;">
          <span class="lang-en">This review link has already been used or is invalid.</span>
          <span class="lang-es">${escapeHtml(validation.error || 'Este enlace ya fue utilizado o no es válido.')}</span>
        </p>
        <button class="btn btn--primary" id="btn-err-close" style="width: 100%; height: 44px;">
          <span class="lang-en">Explore Portfolio</span>
          <span class="lang-es">Explorar Portafolio</span>
        </button>
      </div>
    `;
    document.getElementById('btn-err-close')?.addEventListener('click', closeModal);
    return;
  }

  const tokenData = validation.tokenData;
  const serviceName = tokenData.service || 'Graphic Design';
  let currentRating = 5;

  contentEl.innerHTML = `
    <div class="review-form">
      <div class="review-form__header">
        <span class="section__tag" style="margin-bottom: 6px;">
          <span class="lang-en">Client Feedback</span>
          <span class="lang-es">Valoración de Cliente</span>
        </span>
        <h3 class="review-form__title" style="font-family: var(--font-display);">
          <span class="lang-en">Share Your Experience</span>
          <span class="lang-es">Comparte tu Experiencia</span>
        </h3>
        <p class="review-form__subtitle">
          <span class="lang-en">Delivered: </span><span class="lang-es">Servicio: </span>
          <strong style="color: var(--accent-primary);">${escapeHtml(serviceName)}</strong>
        </p>
      </div>

      <form id="review-submit-form" style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Star Rating Picker -->
        <div>
          <label class="form-label">
            <span class="lang-en">Rating</span>
            <span class="lang-es">Calificación</span>
          </label>
          <div class="star-rating-picker" id="star-picker">
            ${[1, 2, 3, 4, 5].map(val => `
              <button type="button" class="star-btn active" data-value="${val}" aria-label="${val} stars">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            `).join('')}
          </div>
          <div class="star-rating-caption" id="star-caption">
            <span class="lang-en">Excellent work (5/5)</span>
            <span class="lang-es">Excelente trabajo (5/5)</span>
          </div>
        </div>

        <div>
          <label class="form-label" for="rev-author-name">
            <span class="lang-en">Your Name or Nickname *</span>
            <span class="lang-es">Nombre o Apodo *</span>
          </label>
          <input type="text" id="rev-author-name" class="form-input" required maxlength="40" />
        </div>

        <div>
          <label class="form-label" for="rev-author-handle">
            <span class="lang-en">Social Media or Discord (Optional)</span>
            <span class="lang-es">Red Social o Discord (Opcional)</span>
          </label>
          <input type="text" id="rev-author-handle" class="form-input" maxlength="50" />
        </div>

        <div>
          <label class="form-label" for="rev-comment">
            <span class="lang-en">Your Review & Feedback *</span>
            <span class="lang-es">Tu Opinión sobre el Trabajo *</span>
          </label>
          <textarea id="rev-comment" class="form-input form-textarea" rows="4" required maxlength="600"></textarea>
        </div>

        <button type="submit" class="btn btn--primary" id="btn-submit-review" style="width: 100%; height: 46px; margin-top: 4px;">
          <span class="lang-en">Submit Review</span>
          <span class="lang-es">Publicar Reseña</span>
        </button>
      </form>
    </div>
  `;

  function updatePlaceholders() {
    const isEs = document.body.classList.contains('lang-es');
    const nameInp = document.getElementById('rev-author-name');
    const handleInp = document.getElementById('rev-author-handle');
    const commInp = document.getElementById('rev-comment');

    if (nameInp) nameInp.placeholder = isEs ? 'Ej. Kroh, Alex...' : 'e.g. Alex, Kroh...';
    if (handleInp) handleInp.placeholder = isEs ? 'Ej. @usuario o Discord: Tag#0001' : 'e.g. @user or Discord: Tag#0001';
    if (commInp) commInp.placeholder = isEs ? '¿Qué te pareció el diseño y la atención?...' : 'How was the design, delivery, and experience?...';
  }

  updatePlaceholders();

  const starPicker = document.getElementById('star-picker');
  const starBtns = starPicker.querySelectorAll('.star-btn');
  const starCaption = document.getElementById('star-caption');

  const captions = {
    1: { en: 'Poor experience (1/5)', es: 'Mala experiencia (1/5)' },
    2: { en: 'Fair (2/5)', es: 'Regular (2/5)' },
    3: { en: 'Good (3/5)', es: 'Bueno (3/5)' },
    4: { en: 'Very good (4/5)', es: 'Muy bueno (4/5)' },
    5: { en: 'Excellent work (5/5)', es: 'Excelente trabajo (5/5)' }
  };

  function updateStars(val) {
    starBtns.forEach(btn => {
      const btnVal = parseInt(btn.dataset.value, 10);
      btn.classList.toggle('active', btnVal <= val);
    });
    const item = captions[val] || { en: `${val}/5`, es: `${val}/5` };
    starCaption.innerHTML = `<span class="lang-en">${item.en}</span><span class="lang-es">${item.es}</span>`;
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
    const isEs = document.body.classList.contains('lang-es');
    btn.textContent = isEs ? 'Enviando...' : 'Submitting...';

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
            <span class="section__tag" style="margin-bottom: 6px;">
              <span class="lang-en">Published</span>
              <span class="lang-es">Publicada</span>
            </span>
            <h3 style="margin: 0 0 8px; color: var(--text-primary); font-family: var(--font-display); font-size: 1.4rem;">
              <span class="lang-en">Thank You for Your Review!</span>
              <span class="lang-es">¡Gracias por tu Reseña!</span>
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px;">
              <span class="lang-en">Your feedback helps other creators see the quality of my work.</span>
              <span class="lang-es">Tus comentarios ayudan a otros creadores a conocer la calidad de mi trabajo.</span>
            </p>
            <button class="btn btn--primary" id="btn-done-close" style="width: 100%; height: 44px;">
              <span class="lang-en">View on Website</span>
              <span class="lang-es">Ver en la Web</span>
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
      alert(isEs ? 'Ocurrió un error al enviar la reseña.' : 'Error submitting review.');
      btn.disabled = false;
      btn.innerHTML = '<span class="lang-en">Submit Review</span><span class="lang-es">Publicar Reseña</span>';
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
