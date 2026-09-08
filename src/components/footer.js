/**
 * Footer — matching updated logo style.
 */
export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer__container">
      <div class="footer__top">
        <a href="#" class="footer__logo">By<span>Josh.</span></a>
        <div class="footer__nav">
          <a href="#projects"><span class="lang-en">Work</span><span class="lang-es">Trabajo</span></a>
          <a href="#about"><span class="lang-en">About</span><span class="lang-es">Sobre mí</span></a>
          <a href="#services"><span class="lang-en">Services</span><span class="lang-es">Servicios</span></a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} ByJosh. <span class="lang-en">All rights reserved.</span><span class="lang-es">Todos los derechos reservados.</span></p>
        <div class="footer__socials">
          <a href="https://x.com/ByJoshhh_" target="_blank" aria-label="Twitter (X)">X</a>
          <a href="https://www.youtube.com/@ByJoshhh" target="_blank" aria-label="YouTube">YT</a>
          <a href="https://www.behance.net/byjoshhh_" target="_blank" aria-label="Behance">BE</a>
          <a href="#" aria-label="Discord" title="Discord: ByJoshhh_">DC</a>
          <a href="?admin" id="footer-admin-trigger" aria-label="Admin Panel" title="Admin Panel" style="opacity: 0.25; display: inline-flex; align-items: center; justify-content: center; margin-left: 6px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='0.25'">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}
