export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');

  if (!dot || !outline) return;

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  // Track mouse movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  let isHovering = false;
  let currentScale = 1;

  // Performant smooth animation loop
  const loop = () => {
    outlineX += (mouseX - outlineX) * 0.45;
    outlineY += (mouseY - outlineY) * 0.45;
    
    // Smoothly interpolate scale for hover effect (GPU accelerated)
    const targetScale = isHovering ? 1.5 : 1;
    currentScale += (targetScale - currentScale) * 0.2;
    
    outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) scale(${currentScale})`;
    requestAnimationFrame(loop);
  };
  loop();

  // Add hover scale effect to interactive elements
  const addHoverEffects = () => {
    const interactables = document.querySelectorAll('a, button, .filter-btn, .project-card, input, textarea');
    interactables.forEach(el => {
      // Prevent attaching multiple times if called again
      if (el.dataset.cursorAttached) return;
      el.dataset.cursorAttached = 'true';

      el.addEventListener('mouseenter', () => {
        isHovering = true;
        outline.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        isHovering = false;
        outline.classList.remove('hovering');
      });
    });
  };

  addHoverEffects();

  // Lightweight delegation — instead of MutationObserver watching ALL DOM changes,
  // use event delegation on document to catch dynamically added elements
  document.body.addEventListener('mouseenter', (e) => {
    const el = e.target;
    if (el.matches('a, button, .filter-btn, .project-card, input, textarea') && !el.dataset.cursorAttached) {
      el.dataset.cursorAttached = 'true';
      el.addEventListener('mouseenter', () => outline.classList.add('hovering'));
      el.addEventListener('mouseleave', () => outline.classList.remove('hovering'));
    }
  }, true);

  // Also directly handle lightbox close button since it's critical
  document.addEventListener('click', () => outline.classList.remove('hovering'));
}
