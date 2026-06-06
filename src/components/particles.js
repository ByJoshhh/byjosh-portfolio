/**
 * Lightweight canvas particles — optimized for mobile & low-power devices.
 */
export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];
  let w, h;
  let paused = false;
  let rafId;

  // Pause when tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) draw();
  });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  const palette = ['255,117,140', '79,195,247', '255,126,179', '129,212,250'];

  function makeParticle() {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const o = Math.random() * 0.3 + 0.06;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      // Pre-cache fillStyle string — avoids string building in the hot loop
      fill: `rgba(${color},${o.toFixed(2)})`,
      color,
      o,
    };
  }

  function init() {
    resize();
    const isMobile = w <= 768;
    // Mobile: max 20 particles, Desktop: max 40
    const count = isMobile
      ? Math.min(Math.floor((w * h) / 30000), 20)
      : Math.min(Math.floor((w * h) / 20000), 40);
    particles = Array.from({ length: count }, makeParticle);
  }

  const CONNECT_DIST_SQ = 120 * 120; // Use squared distance — avoids Math.sqrt entirely

  function draw() {
    if (paused) return;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > w) p.dx *= -1;
      if (p.y < 0 || p.y > h) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.fill;
      ctx.fill();
    }

    // Connections only on desktop — use squared distance (no sqrt needed)
    if (w > 768) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECT_DIST_SQ) {
            const alpha = 0.035 * (1 - Math.sqrt(distSq) / 120);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79,195,247,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  init();
  draw();

  // Debounce resize to avoid thrashing on mobile orientation change
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
}
