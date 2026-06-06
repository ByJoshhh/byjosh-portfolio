export function initSakura() {
  const container = document.getElementById('sakura-container');
  if (!container) return;

  const isMobile = window.innerWidth <= 768;
  const numPetals = isMobile ? 8 : 28;

  for (let i = 0; i < numPetals; i++) {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (Math.random() * 6 + 7) + 's';
    // Spread delays across full duration so screen always has petals visible
    petal.style.animationDelay = (Math.random() * 12) + 's';
    const size = isMobile
      ? Math.random() * 6 + 7   // 7–13px on mobile
      : Math.random() * 8 + 8;  // 8–16px on desktop
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    container.appendChild(petal);
  }

  // Pause CSS animations when tab is hidden — saves battery on mobile
  document.addEventListener('visibilitychange', () => {
    container.style.animationPlayState = document.hidden ? 'paused' : 'running';
    container.querySelectorAll('.sakura-petal').forEach(p => {
      p.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
}
