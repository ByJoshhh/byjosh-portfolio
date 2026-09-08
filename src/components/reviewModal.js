/**
 * Client Review Modal
 * Activated when ?review=TOKEN is in the URL.
 * Allows verified clients with a valid single-use link to submit feedback.
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

  // Create Modal Container
  const modal = document.createElement('div');
  modal.id = 'client-review-modal';
  modal.className = 'custom-modal is-open';
  modal.innerHTML = `
    <div class="custom-modal__backdrop"></div>
    <div class="custom-modal__box">
      <button class="custom-modal__close" id="review-modal-close" aria-label="Close">&times;</button>
      <div id="review-modal-content">
        <div class="review-modal__loading">
          <div class="custom-spinner"></div>
          <p style="margin-top: 14px; color: var(--text-secondary); font-size: 0.9rem;">Verificando enlace de cliente...</p>
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
    // Remove query param cleanly
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  // Validate Token
  const validation = await validateToken(token);

  if (!validation.valid) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div class="modal-icon modal-icon--warning">⚠️</div>
        <h3 style="margin: 12px 0 8px; color: var(--text-primary);">Enlace no disponible</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px;">
          ${escapeHtml(validation.error || 'Este enlace ya fue utilizado o no es válido.')}
        </p>
        <button class="btn btn--primary" id="btn-err-close" style="width: 100%;">Explorar Portafolio</button>
      </div>
    `;
    document.getElementById('btn-err-close')?.addEventListener('click', closeModal);
    return;
  }

  const tokenData = validation.tokenData;
  const serviceName = tokenData.service || 'Diseño Gráfico';

  // Render Review Form
  let currentRating = 5;

  contentEl.innerHTML = `
    <div class="review-form">
      <div class="review-form__header">
        <span class="review-form__badge">${escapeHtml(serviceName)}</span>
        <h3 class="review-form__title">¡Deja tu Reseña!</h3>
        <p class="review-form__subtitle">
          Gracias por confiar en <strong>ByJosh</strong>. Tu opinión sincera me ayuda muchísimo a seguir creando contenido y diseños de calidad.
        </p>
      </div>

      <form id="review-submit-form" style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Star Rating Picker -->
        <div>
          <label class="form-label">Tu Calificación</label>
          <div class="star-rating-picker" id="star-picker">
            <span class="star-btn active" data-value="1">★</span>
            <span class="star-btn active" data-value="2">★</span>
            <span class="star-btn active" data-value="3">★</span>
            <span class="star-btn active" data-value="4">★</span>
            <span class="star-btn active" data-value="5">★</span>
          </div>
          <div class="star-rating-caption" id="star-caption">¡Excelente trabajo! (5/5)</div>
        </div>

        <!-- Name / Nickname -->
        <div>
          <label class="form-label" for="rev-author-name">Tu Nombre o Apodo *</label>
          <input type="text" id="rev-author-name" class="form-input" placeholder="Ej. Kroh, Alex, Juan..." required maxlength="40" />
        </div>

        <!-- Social Media Handle -->
        <div>
          <label class="form-label" for="rev-author-handle">Tu Red Social o Discord (Opcional)</label>
          <input type="text" id="rev-author-handle" class="form-input" placeholder="Ej. @tu_usuario o Discord: TuTag#1234" maxlength="50" />
        </div>

        <!-- Review Comment -->
        <div>
          <label class="form-label" for="rev-comment">Tu Opinión sobre el Trabajo *</label>
          <textarea id="rev-comment" class="form-input form-textarea" rows="4" placeholder="¿Qué te pareció el diseño, la rapidez y el trato?..." required maxlength="600"></textarea>
        </div>

        <button type="submit" class="btn btn--primary" id="btn-submit-review" style="width: 100%; padding: 14px; font-weight: 700; font-size: 1rem;">
          Publicar Reseña ★
        </button>
      </form>
    </div>
  `;

  // Interactive Stars Logic
  const starPicker = document.getElementById('star-picker');
  const starBtns = starPicker.querySelectorAll('.star-btn');
  const starCaption = document.getElementById('star-caption');

  const captions = {
    1: 'Mala experiencia (1/5)',
    2: 'Regular (2/5)',
    3: 'Bueno (3/5)',
    4: '¡Muy bueno! (4/5)',
    5: '¡Excelente trabajo! (5/5)'
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

  // Form Submission
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
          <div style="text-align: center; padding: 24px 10px;">
            <div class="modal-icon modal-icon--success">🎉</div>
            <h3 style="margin: 12px 0 8px; color: var(--text-primary);">¡Reseña Recibida!</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
              Muchísimas gracias por tus comentarios, <strong>${escapeHtml(name)}</strong>. Tu valoración ya está registrada y publicada en el portafolio.
            </p>
            <button class="btn btn--primary" id="btn-done-close" style="width: 100%;">Ver mi Reseña en la Web</button>
          </div>
        `;

        document.getElementById('btn-done-close')?.addEventListener('click', () => {
          closeModal();
          // Scroll smoothly to reviews section
          document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
        });

        // Re-render reviews section on page
        renderReviewsCards();
      }
    } catch (err) {
      alert('Ocurrió un error al enviar la reseña. Inténtalo de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Publicar Reseña ★';
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
