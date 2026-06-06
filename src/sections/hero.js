/**
 * Hero — editorial left-aligned layout with brand title.
 */
export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.innerHTML = `
    <div class="hero__container">
      <div class="hero__content">
        <div class="hero__badge fade-up">
          <span class="hero__badge-dot"></span>
          <span class="lang-en">Available for Freelance</span><span class="lang-es">Disponible para Freelance</span>
        </div>
        <h1 class="hero__title reveal-text">
          <span class="reveal-text__inner" style="animation-delay: 0.1s">By<span class="hero__title--accent">Josh</span><span class="hero__title-dot">.</span></span>
        </h1>
        <p class="hero__subtitle reveal-text">
          <span class="reveal-text__inner" style="animation-delay: 0.2s">
            <span class="lang-en">Graphic Designer<br>&amp; GFX Artist</span><span class="lang-es">Diseñador Gráfico<br>&amp; GFX Artist</span>
          </span>
        </p>
        <h2 class="fade-up" style="font-family: var(--font-display); font-size: clamp(1.3rem, 2.5vw, 1.8rem); font-weight: 800; margin-bottom: 24px; animation-delay: 0.3s; letter-spacing: -0.5px;">
          <span class="lang-en">Take total control of your <span class="text-gradient decode-text" data-text="design.">design.</span></span>
          <span class="lang-es">Toma el control total de tu <span class="text-gradient decode-text" data-text="diseño.">diseño.</span></span>
        </h2>
        <p class="hero__description fade-up" style="animation-delay: 0.4s">
          <span class="lang-en">I bring gaming and anime designs to life through striking visuals. From standout thumbnails and headers, I create designs that truly connect with your community.</span>
          <span class="lang-es">Doy vida a diseños en gaming y anime a través de visuales impactantes. Desde miniaturas destacadas y headers, creo diseños que realmente conectan con tu comunidad.</span>
        </p>
        <div class="hero__cta fade-up" style="animation-delay: 0.5s">
          <button onclick="document.getElementById('projects').scrollIntoView({behavior: 'smooth'})" class="btn btn--primary" id="cta-work">
            <span><span class="lang-en">View My Work</span><span class="lang-es">Ver Mi Trabajo</span></span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--outline" id="cta-contact"><span class="lang-en">Get in Touch</span><span class="lang-es">Contáctame</span></button>
        </div>
      </div>
      <div class="hero__visuals fade-in" style="animation-delay: 0.7s">
        <img src="/images/haimiya.gif" alt="Haimiya Anime Character" class="hero__character">
      </div>
    </div>
    <div class="hero__scroll-indicator">
      <span>Scroll</span>
      <div class="hero__scroll-line"></div>
    </div>
  `;
}
