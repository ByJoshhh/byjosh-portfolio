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
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  document
    .querySelectorAll('.fade-up, .fade-in, .scale-in, .stagger-children, .card-spawn, .decode-text')
    .forEach((el) => scrollObserver.observe(el));
}

/**
 * Smooth-scroll for anchor links, accounting for the fixed navbar height.
 */
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const navH = document.querySelector('.navbar')?.offsetHeight || 0;
        window.scrollTo({
          top: target.offsetTop - navH,
          behavior: 'smooth',
        });
      }
    });
  });
}
