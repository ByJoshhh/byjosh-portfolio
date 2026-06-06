/**
 * Navbar — logo uses plain text + accent color (no gradient text).
 */
export function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  navbar.innerHTML = `
    <div class="navbar__container">
      <a href="#" class="navbar__logo">By<span>Josh.</span></a>
      <div class="navbar__menu" id="nav-menu">
        <a href="#projects" class="navbar__link"><span class="lang-en">Work</span><span class="lang-es">Trabajo</span></a>
        <a href="#about" class="navbar__link"><span class="lang-en">About</span><span class="lang-es">Sobre mí</span></a>
        <a href="#services" class="navbar__link"><span class="lang-en">Services</span><span class="lang-es">Servicios</span></a>
        <a href="#pricing" class="navbar__link"><span class="lang-en">Pricing</span><span class="lang-es">Precios</span></a>
        <a href="#faq" class="navbar__link"><span class="lang-en">FAQ</span><span class="lang-es">FAQ</span></a>
        <a href="#contact" class="navbar__link"><span class="lang-en">Contact</span><span class="lang-es">Contacto</span></a>
        <button id="theme-toggle" class="btn btn--outline" aria-label="Toggle Theme" style="padding: 6px 10px; display: flex; align-items: center;">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
        <button id="lang-toggle" class="btn btn--outline" style="padding: 6px 14px; font-size: 0.75rem;">
          <span class="lang-en">ES</span><span class="lang-es">EN</span>
        </button>
      </div>
      <button class="navbar__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  // Throttled scroll handler — runs at most once per animation frame
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 50);

      // Update scroll progress bar
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (y / scrollHeight) * 100 : 0;
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) progressBar.style.width = progress + '%';

      document.querySelectorAll('section[id]').forEach((sec) => {
        const top = sec.offsetTop - 120;
        const bottom = top + sec.offsetHeight;
        const link = navbar.querySelector(`a[href="#${sec.id}"]`);
        if (!link) return;
        if (y >= top && y < bottom) {
          navbar.querySelectorAll('.navbar__link').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
      scrollTicking = false;
    });
  }, { passive: true });

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.navbar__link');
  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  // Initialize theme from localStorage
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      document.body.classList.toggle('lang-es');
    });
  }

  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu?.classList.contains('active') && !menu.contains(e.target) && e.target !== toggle) {
      toggle?.classList.remove('active');
      menu.classList.remove('active');
    }
  });

  menu?.querySelectorAll('.navbar__link, #theme-toggle, #lang-toggle').forEach((el) => {
    el.addEventListener('click', () => {
      toggle?.classList.remove('active');
      menu.classList.remove('active');
    });
  });
}
