/**
 * Intersection Observer animations — reveals elements as they scroll into view.
 */

// Shared observer — exported so dynamic sections can observe new elements
export let scrollObserver;

export function initAnimations() {
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Glitch text decode effect
          if (entry.target.classList.contains('decode-text')) {
            const chars = '!<>-_\\\\/[]{}—=+*^?#_';
            const el = entry.target;
            const originalText = el.dataset.text;
            
            const triggerGlitch = () => {
              let iteration = 0;
              const interval = setInterval(() => {
                el.innerText = originalText
                  .split('')
                  .map((letter, index) => {
                    if (index < iteration) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                  })
                  .join('');
                if (iteration >= originalText.length) {
                  clearInterval(interval);
                  el.innerText = originalText; // ensure exact final text
                }
                iteration += 1 / 3; // speed of decode
              }, 30);
            };

            triggerGlitch(); // initial run
            setInterval(triggerGlitch, 7000); // repeat every 7 seconds
          }

          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '60px 0px 60px 0px' }
  );

  const selector = '.fade-up, .fade-in, .scale-in, .stagger-children, .card-spawn, .decode-text';

  // Initial observation of all currently present elements
  document.querySelectorAll(selector).forEach((el) => {
    scrollObserver.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });

  // Automatically observe any dynamic elements injected into the DOM (e.g., pricing, reviews, CMS updates)
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          if (node.matches && node.matches(selector)) {
            if (!node.classList.contains('visible')) scrollObserver.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll(selector).forEach((el) => {
              if (!el.classList.contains('visible')) scrollObserver.observe(el);
            });
          }
        }
      }
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

export function observeElements(root = document) {
  if (!scrollObserver) return;
  const selector = '.fade-up, .fade-in, .scale-in, .stagger-children, .card-spawn, .decode-text';
  root.querySelectorAll(selector).forEach((el) => {
    if (!el.classList.contains('visible')) {
      scrollObserver.observe(el);
    }
  });
}

/**
 * Smooth-scroll for anchor links, accounting for the fixed navbar height.
 * Uses getBoundingClientRect + window.scrollBy for pixel-accurate positioning.
 * Also closes the mobile menu on click and highlights the active nav link.
 */
export function initSmoothScroll() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  const menuEl = document.querySelector('.navbar__menu');

  // --- Anchor click → smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // getBoundingClientRect is relative to viewport (already accounts for current scroll)
      const navH = navbar?.offsetHeight || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Close mobile menu if open
      if (menuEl?.classList.contains('navbar__menu--open')) {
        menuEl.classList.remove('navbar__menu--open');
        navbar?.classList.remove('menu-open');
      }
    });
  });

  // --- Highlight active nav link on scroll ---
  const sections = [...document.querySelectorAll('section[id]')];
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px', // fires when section is roughly centered in view
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}
