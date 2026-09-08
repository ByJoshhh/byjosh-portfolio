/**
 * Reviews / Testimonials Section
 * Displays verified client feedback with SVG star ratings and service tags.
 * 100% Native ByJosh UI Theme — No Emojis, Clean SVG Line Icons
 */
import { getApprovedReviews } from '../utils/reviewsDB.js';

export async function initReviews() {
  const section = document.getElementById('reviews');
  if (!section) return;

  section.innerHTML = `
    <div class="container" style="max-width: var(--container-width); margin: 0 auto; padding: 0 var(--container-padding);">
      <div class="section__header fade-up" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 36px;">
        <span class="section__tag"><span class="lang-en">Feedback</span><span class="lang-es">Testimonios</span></span>
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 16px;">
          <h2 class="section__title" style="margin: 0;">
            <span class="lang-en">Client <span class="text-gradient">Reviews</span></span>
            <span class="lang-es">Reseñas de <span class="text-gradient">Clientes</span></span>
          </h2>
          <div class="reviews__summary-badge" id="reviews-summary-badge">
            <div class="reviews__stars-row">
              ${renderStarSvg(5, 14)}
            </div>
            <span class="reviews__rating-text">5.0 / 5.0</span>
            <span class="badge badge--primary" style="font-size: 0.68rem; padding: 2px 8px;">
              <span class="lang-en">Verified</span><span class="lang-es">Verificado</span>
            </span>
          </div>
        </div>
      </div>

      <div class="reviews__grid stagger-children fade-up" id="reviews-grid">
        <div class="reviews__loading" style="color: var(--text-muted); font-size: 0.9rem; padding: 30px 0;">
          <span class="lang-en">Loading client feedback...</span><span class="lang-es">Cargando reseñas de clientes...</span>
        </div>
      </div>

      <!-- Guarantee Footer Note -->
      <div class="reviews__footer-banner fade-up" style="margin-top: 36px;">
        <div class="reviews__banner-content">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="color: var(--accent-primary); flex-shrink: 0;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
            <span class="lang-en">Every review is submitted directly by real clients via private one-time delivery links.</span>
            <span class="lang-es">Todas las reseñas son enviadas directamente por clientes reales a través de enlaces privados únicos de entrega.</span>
          </p>
        </div>
      </div>
    </div>
  `;

  await renderReviewsCards();
}

export async function renderReviewsCards() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  const reviews = await getApprovedReviews();

  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); grid-column: 1 / -1;">
        <p><span class="lang-en">No public reviews yet. Be the first!</span><span class="lang-es">Aún no hay reseñas públicas. ¡Sé el primero!</span></p>
      </div>
    `;
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);
  const badgeEl = document.getElementById('reviews-summary-badge');
  if (badgeEl) {
    badgeEl.querySelector('.reviews__rating-text').textContent = `${avgRating} / 5.0 (${reviews.length})`;
  }

  container.innerHTML = reviews.map(r => {
    const initial = (r.name || 'C').charAt(0).toUpperCase();

    let dateStr = '';
    if (r.created_at) {
      try {
        const d = new Date(r.created_at);
        dateStr = d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
      } catch (e) {}
    }

    return `
      <div class="review-card">
        <div class="review-card__header">
          <div class="review-card__user">
            <div class="review-card__avatar">${initial}</div>
            <div class="review-card__meta">
              <div class="review-card__name-row">
                <span class="review-card__name">${escapeHtml(r.name)}</span>
                <span class="review-card__check" title="Cliente Verificado">
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>
              ${r.handle ? `<span class="review-card__handle">${escapeHtml(r.handle)}</span>` : ''}
            </div>
          </div>
          <span class="review-card__date">${dateStr}</span>
        </div>

        <div class="review-card__stars">
          ${renderStarSvg(r.rating || 5, 14)}
        </div>

        <p class="review-card__comment">“${escapeHtml(r.comment)}”</p>

        <div class="review-card__footer">
          <span class="review-card__service-badge">${escapeHtml(r.service || 'Design')}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderStarSvg(count, size = 14) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= count;
    html += `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${filled ? '#4fc3f7' : 'none'}" stroke="${filled ? '#4fc3f7' : 'rgba(255,255,255,0.2)'}" stroke-width="1.5">
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
