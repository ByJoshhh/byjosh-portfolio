import { getApprovedReviews } from '../utils/reviewsDB.js';
import { setupGlitchDecode, runGlitchOnElement } from '../utils/glitch.js';

const HERO_SLIDES = [
  {
    src: '/images/haimiya-walk.gif',
    fallback: '/images/haimiya.gif',
    alt: 'Haimiya Mio Anime Character',
    isHaimiya: true,
    duration: 6200, // Exactly 2 complete animation cycles (3.1s x 2)
    titleEn: 'Take total control of your <span class="text-gradient decode-text" data-text="design.">design.</span>',
    titleEs: 'Toma el control total de tu <span class="text-gradient decode-text" data-text="diseño.">diseño.</span>',
    subEn: 'ByJosh &bull; Graphic Designer &amp; GFX Artist &bull; Striking visuals for gaming, anime &amp; creators',
    subEs: 'ByJosh &bull; Diseñador Gráfico &amp; GFX Artist &bull; Visuales impactantes para gaming, anime y creadores'
  },
  {
    src: '/images/GD%20thumbnails/Sunix-Thumbnail-TOP2.webp',
    fallback: '/images/GD%20thumbnails/Sunix-Thumbnail-TOP2.webp',
    alt: 'Sunix TOP 1 2016 Geometry Dash Artwork',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'Geometry Dash &bull; <span class="decode-text" data-text="Sunix TOP 1 2016">Sunix TOP 1 2016</span>',
    titleEs: 'Geometry Dash &bull; <span class="decode-text" data-text="Sunix TOP 1 2016">Sunix TOP 1 2016</span>',
    subEn: 'High-CTR thumbnail composition crafted for top recurring client Sunix',
    subEs: 'Miniatura de alto impacto diseñada para el cliente frecuente y estrella Sunix'
  },
  {
    src: '/images/GD%20thumbnails/Sunix-Grief-THUMBNAIL.webp',
    fallback: '/images/GD%20thumbnails/Sunix-Grief-THUMBNAIL.png',
    alt: 'Sunix Grief Geometry Dash Thumbnail',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'Grief &bull; <span class="decode-text" data-text="Sunix Attempts ????">Sunix Attempts ????</span>',
    titleEs: 'Grief &bull; <span class="decode-text" data-text="Sunix Attempts ????">Sunix Attempts ????</span>',
    subEn: 'Extreme demon thumbnail commission crafted for Sunix',
    subEs: 'Miniatura de extreme demon diseñada para Sunix'
  },
  {
    src: '/images/GD%20thumbnails/The-Golden-Viipr.webp',
    fallback: '/images/GD%20thumbnails/The-Golden-Viipr.webp',
    alt: 'The Golden Viipr Geometry Dash Thumbnail',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'The Golden &bull; <span class="decode-text" data-text="Viipr" style="white-space: nowrap">Viipr</span>',
    titleEs: 'The Golden &bull; <span class="decode-text" data-text="Viipr" style="white-space: nowrap">Viipr</span>',
    subEn: 'Legendary level thumbnail commission for Viipr',
    subEs: 'Miniatura de un nivel legendario para Viipr'
  },
  {
    src: '/images/Headers/Necrum-HEADER.webp',
    fallback: '/images/Headers/Necrum-HEADER.webp',
    alt: 'Necrum Hell Paradise Header Design',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'Hell\'s Paradise &bull; <span class="decode-text" data-text="Necrum" style="white-space: nowrap">Necrum</span>',
    titleEs: 'Hell\'s Paradise &bull; <span class="decode-text" data-text="Necrum" style="white-space: nowrap">Necrum</span>',
    subEn: 'Header for Necrum // Gabimaru the Hollow',
    subEs: 'Header para Necrum // Gabimaru the Hollow'
  },
  {
    src: '/images/E-SPORTS/Still-Home-G2-clean.webp?v=2',
    fallback: '/images/E-SPORTS/Still-Home-G2-clean.webp?v=2',
    alt: 'G2 Esports Still Home Artwork',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'G2 Esports &bull; <span class="decode-text" data-text="Still Home Graphic">Still Home Graphic</span>',
    titleEs: 'G2 Esports &bull; <span class="decode-text" data-text="Gráfica Still Home">Gráfica Still Home</span>',
    subEn: 'Pro-tier competitive match and tournament visuals for esports organizations',
    subEs: 'Visuales competitivas de torneo diseñadas para organizaciones de esports'
  },
  {
    src: '/images/Headers/violet-evergarden-header.webp',
    fallback: '/images/Headers/violet-evergarden-header.webp',
    alt: 'Violet Evergarden Anime Header',
    isHaimiya: false,
    duration: 5000,
    titleEn: 'Anime Aesthetics &bull; <span class="decode-text" data-text="Violet Evergarden">Violet Evergarden</span>',
    titleEs: 'Estética Anime &bull; <span class="decode-text" data-text="Violet Evergarden">Violet Evergarden</span>',
    subEn: 'Atmospheric depth of field, custom typography and master-class color grading',
    subEs: 'Profundidad de campo atmosférica, tipografía personalizada y color grading profesional'
  }
];

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.innerHTML = `
    <div class="wooting-hero">
      <!-- Main Showcase Container (Wooting Centered Architecture) -->
      <div class="wooting-hero__card" id="wooting-hero-card">
        
        <!-- Large Ambient Brand Watermark in Carousel -->
        <div class="wooting-hero__watermark" aria-hidden="true">
          By<span class="text-gradient">Josh.</span>
        </div>

        <!-- Card Top Bar: Large Designer Mark + Status Badge -->
        <div class="wooting-hero__top-bar fade-up">
          <div class="wooting-hero__brand-large" id="hero-brand-logo">
            By<span class="text-gradient decode-text" data-text="Josh.">Josh.</span>
          </div>
          <div class="wooting-hero__badge">
            <span class="wooting-hero__badge-dot"></span>
            <span class="lang-en">Available for Freelance</span>
            <span class="lang-es">Disponible para Freelance</span>
          </div>
        </div>

        <!-- Center Showcase Stage (Wide, High-Impact, Not Shrunk) -->
        <div class="wooting-hero__stage fade-up" id="hero-stage">
          <div class="wooting-hero__img-container" id="hero-img-container">
            <img 
              id="hero-main-img"
              src="${HERO_SLIDES[0].src}" 
              alt="${HERO_SLIDES[0].alt}" 
              class="wooting-hero__main-img"
              width="800" 
              height="450" 
              fetchpriority="high"
              onerror="this.src='${HERO_SLIDES[0].fallback}'"
            />
          </div>
        </div>

        <!-- Center Typography Content (Wooting Layout) -->
        <div class="wooting-hero__content fade-up">
          <h1 class="wooting-hero__title" id="hero-title">
            <span class="lang-en" id="hero-title-en">${HERO_SLIDES[0].titleEn}</span>
            <span class="lang-es" id="hero-title-es">${HERO_SLIDES[0].titleEs}</span>
          </h1>

          <p class="wooting-hero__subtitle" id="hero-subtitle">
            <span class="lang-en" id="hero-sub-en">${HERO_SLIDES[0].subEn}</span>
            <span class="lang-es" id="hero-sub-es">${HERO_SLIDES[0].subEs}</span>
          </p>

          <!-- Centered Action Buttons: Ice-Blue Pill + Outline -->
          <div class="wooting-hero__actions">
            <button onclick="document.getElementById('projects').scrollIntoView({behavior: 'smooth'})" class="btn btn--primary btn--wooting" id="cta-work">
              <span class="lang-en">View My Work</span><span class="lang-es">Ver Mi Trabajo</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--outline btn--wooting" id="cta-contact">
              <span class="lang-en">Get in Touch</span><span class="lang-es">Contáctame</span>
            </button>
          </div>
        </div>

        <!-- Wooting Bottom-Right Carousel Controls (Pill with dots + arrow) -->
        <div class="wooting-hero__controls">
          <div class="wooting-hero__dots" id="hero-dots">
            ${HERO_SLIDES.map((_, i) => `
              <button class="wooting-hero__dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
            `).join('')}
          </div>
          <button class="wooting-hero__arrow" id="hero-next" aria-label="Next Slide">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>

      <!-- Metrics Row (Discreet & Airy Outside the Card) -->
      <div class="subhero-metrics fade-up">
        <div class="subhero-metric-item">
          <span class="subhero-metric-num">3.5+</span>
          <span class="subhero-metric-lbl"><span class="lang-en">Years Experience</span><span class="lang-es">Años Experiencia</span></span>
        </div>
        <div class="subhero-metric-divider"></div>
        <div class="subhero-metric-item">
          <span class="subhero-metric-num">140+</span>
          <span class="subhero-metric-lbl"><span class="lang-en">Projects Completed</span><span class="lang-es">Proyectos Completados</span></span>
        </div>
        <div class="subhero-metric-divider"></div>
        <div class="subhero-metric-item">
          <span class="subhero-metric-num">5.0 ★</span>
          <span class="subhero-metric-lbl"><span class="lang-en">Client Rating</span><span class="lang-es">Calificación</span></span>
        </div>
      </div>

      <!-- Frequent / Recent Clients Strip -->
      <div class="wooting-community fade-up">
        <div class="wooting-community__label">
          <span class="lang-en">Frequent &amp; Recent Clients</span>
          <span class="lang-es">Clientes Frecuentes y Recientes</span>
        </div>

        <div class="wooting-community__badge-group" id="wooting-client-badges">
          <!-- Sunix prominent VIP emphasis (Josh's frequent client & GD Legend prodigy) -->
          <div class="wooting-client-pill wooting-client-pill--vip">
            <span class="wooting-client-pill__name">
              Sunix <span class="wooting-client-pill__tag-vip"><span class="lang-en">(Legend GD Player)</span><span class="lang-es">(Leyenda GD)</span></span>
            </span>
          </div>

          <!-- Necrum: Top / Best Client highlight -->
          <div class="wooting-client-pill wooting-client-pill--vip">
            <span class="wooting-client-pill__name">
              Necrum <span class="wooting-client-pill__tag-vip"><span class="lang-en">(Top Client)</span><span class="lang-es">(Mejor Cliente)</span></span>
            </span>
          </div>

          <!-- Jankos: LoL Legend highlight -->
          <div class="wooting-client-pill wooting-client-pill--vip">
            <span class="wooting-client-pill__name">
              Jankos <span class="wooting-client-pill__tag-vip"><span class="lang-en">(LoL Legend)</span><span class="lang-es">(Leyenda LoL)</span></span>
            </span>
          </div>

          <!-- Other valued clients -->
          <div class="wooting-client-pill">
            <span class="wooting-client-pill__name">Viipr</span>
          </div>

          <div class="wooting-client-pill">
            <span class="wooting-client-pill__name">G2 Esports</span>
          </div>

          <div class="wooting-client-pill">
            <span class="wooting-client-pill__name">Silexx</span>
          </div>
        </div>

        <div class="wooting-community__statement">
          <h2 class="wooting-community__title">
            <span class="lang-en">Elevating the competitive gaming & anime scene.</span>
            <span class="lang-es">Elevando la escena competitiva de gaming y anime.</span>
          </h2>
          <a href="#about" class="wooting-community__link">
            <span class="lang-en">Learn more about the creative journey &rarr;</span>
            <span class="lang-es">Conoce más sobre la trayectoria creativa &rarr;</span>
          </a>
        </div>
      </div>

    </div>
  `;

  setupHeroCarousel();
  setupGlitchDecode();
  syncFrequentClientsFromReviews();

  const heroBrand = hero.querySelector('#hero-brand-logo');
  const heroSpan = hero.querySelector('#hero-brand-logo .decode-text');
  if (heroBrand && heroSpan) {
    heroBrand.addEventListener('mouseenter', () => {
      runGlitchOnElement(heroSpan);
    });
  }
}

/**
 * Centered Wooting Carousel:
 * Starts with Haimiya Mio for 2 complete cycles (6.2s), then moves to portfolio works.
 */
function setupHeroCarousel() {
  const imgEl = document.getElementById('hero-main-img');
  const cardEl = document.getElementById('wooting-hero-card');
  const titleEnEl = document.getElementById('hero-title-en');
  const titleEsEl = document.getElementById('hero-title-es');
  const subEnEl = document.getElementById('hero-sub-en');
  const subEsEl = document.getElementById('hero-sub-es');
  const dots = document.querySelectorAll('.wooting-hero__dot');
  const nextBtn = document.getElementById('hero-next');

  if (!imgEl) return;

  let currentIndex = 0;
  let timer = null;

  function scheduleNext() {
    if (timer) clearTimeout(timer);
    const slide = HERO_SLIDES[currentIndex];
    const duration = slide.duration || 5000;
    timer = setTimeout(() => {
      setSlide(currentIndex + 1);
    }, duration);
  }

  function setSlide(index) {
    currentIndex = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
    const slide = HERO_SLIDES[currentIndex];

    // Smooth fade
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.98)';

    setTimeout(() => {
      imgEl.src = slide.src;
      imgEl.alt = slide.alt;
      imgEl.onerror = () => { imgEl.src = slide.fallback; };

      if (titleEnEl) titleEnEl.innerHTML = slide.titleEn;
      if (titleEsEl) titleEsEl.innerHTML = slide.titleEs;
      if (subEnEl) subEnEl.innerHTML = slide.subEn;
      if (subEsEl) subEsEl.innerHTML = slide.subEs;

      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';

      // Re-trigger glitch decode on newly mounted title
      setupGlitchDecode();
    }, 220);

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    scheduleNext();
  }

  nextBtn?.addEventListener('click', () => {
    setSlide(currentIndex + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      setSlide(idx);
    });
  });

  cardEl?.addEventListener('mouseenter', () => {
    if (timer) clearTimeout(timer);
  });

  cardEl?.addEventListener('mouseleave', () => {
    scheduleNext();
  });

  // Start with exactly 2 cycles on Haimiya walking animation (6200ms)
  scheduleNext();
}

/**
 * Dynamically enrich frequent clients list with verified reviewers from the database
 */
async function syncFrequentClientsFromReviews() {
  try {
    const reviews = await getApprovedReviews();
    if (!reviews || !reviews.length) return;

    const badgeGroup = document.getElementById('wooting-client-badges');
    if (!badgeGroup) return;

    const existingNames = new Set([
      'sunix', 'viipr', 'necrum', 'jankos', 'g2 esports', 'silexx', 'helpegasus'
    ]);

    reviews.forEach((rev) => {
      const rawName = (rev.client_name || '').trim();
      if (!rawName) return;
      const lower = rawName.toLowerCase();
      if (!existingNames.has(lower)) {
        existingNames.add(lower);
        const pill = document.createElement('div');
        pill.className = 'wooting-client-pill';
        const safeName = rawName.replace(/[&<>"']/g, (m) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
        pill.innerHTML = `<span class="wooting-client-pill__name">${safeName}</span>`;
        badgeGroup.appendChild(pill);
      }
    });
  } catch (err) {
    console.warn('Could not sync frequent clients with reviews:', err);
  }
}

