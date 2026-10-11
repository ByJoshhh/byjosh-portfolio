/**
 * Cyber character decode / glitch effect utility
 * Decodes text with random futuristic symbols and provides hover interaction.
 */
const CHARS = '!<>-_\\\\/[]{}—=+*^?#_$%&@~';

export function runGlitchOnElement(target) {
  if (!target || target._glitching) return;
  target._glitching = true;

  const originalHtml = target.dataset.originalHtml || target.innerHTML;
  const originalText = target.dataset.text || target.textContent.trim();
  target.dataset.originalHtml = originalHtml;
  target.dataset.text = originalText;

  let iteration = 0;
  const interval = setInterval(() => {
    target.innerText = originalText
      .split('')
      .map((letter, index) => {
        if (letter === ' ') return ' ';
        if (index < iteration) return originalText[index];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    if (iteration >= originalText.length) {
      clearInterval(interval);
      target.innerHTML = originalHtml;
      target._glitching = false;
    }
    iteration += 1 / 2.5;
  }, 28);
}

export function setupGlitchDecode(container = document) {
  const targets = container.querySelectorAll('.decode-text');
  targets.forEach((target) => {
    runGlitchOnElement(target);
    if (!target._hasGlitchHover) {
      target._hasGlitchHover = true;
      target.addEventListener('mouseenter', () => {
        runGlitchOnElement(target);
      });
    }
  });
}
