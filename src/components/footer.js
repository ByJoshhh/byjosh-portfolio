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
        </div>
      </div>
    </div>
  `;
}
