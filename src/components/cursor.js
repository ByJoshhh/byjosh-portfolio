export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');

  if (!dot || !outline) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let outlineX = mouseX;
  let outlineY = mouseY;

  // Track mouse movement (only store coordinates, don't update DOM here)
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let isHovering = false;
  let currentScale = 1;

  // Performant smooth animation loop synced with screen refresh rate
  const loop = () => {
    // Dot follows almost instantly, but inside rAF to prevent layout thrashing
    dotX += (mouseX - dotX) * 0.8;
    dotY += (mouseY - dotY) * 0.8;
    
    // Outline trails behind smoothly (0.15 interpolation is buttery smooth, masks lag)
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    // Smoothly interpolate scale for hover effect
    const targetScale = isHovering ? 1.5 : 1;
    currentScale += (targetScale - currentScale) * 0.15;
    
    // Dot is 8x8px, subtract 4px to center it (since JS overwrites CSS translate -50%)
    dot.style.transform = `translate3d(${dotX - 4}px, ${dotY - 4}px, 0)`;
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
