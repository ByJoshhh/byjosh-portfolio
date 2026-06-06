/**
 * Contact section — info column with social links + styled form.
 */
export function initContact() {
  const section = document.getElementById('contact');
  if (!section) return;

  section.innerHTML = `
    <div class="contact__container">
      <div class="section__header fade-up">
        <span class="section__tag"><span class="lang-en">Let's Talk</span><span class="lang-es">Hablemos</span></span>
        <h2 class="section__title"><span class="lang-en">Get in <span class="text-gradient">touch</span></span><span class="lang-es">Ponte en <span class="text-gradient">contacto</span></span></h2>
      </div>
      <div class="contact__content">
        <div class="contact__info">
          <p class="fade-up" style="animation-delay: 0.1s">
            <span class="lang-en">If you are interested in a particular design, don't hesitate to get in touch with me ;)</span>
            <span class="lang-es">Si a usted le interesa algún diseño en particular, no dude en ponerse en contacto conmigo ;)</span>
          </p>
          <div class="contact__details">
            <div class="contact__detail">
              <span class="contact__detail-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <a href="mailto:byjoshmcpeyt456@gmail.com" class="text-hover">byjoshmcpeyt456@gmail.com</a>
            </div>
            <div class="contact__detail">
              <span class="contact__detail-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              <span><span class="lang-en">Mexico</span><span class="lang-es">México</span></span>
            </div>
            <div class="contact__detail">
              <span class="contact__detail-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </span>
              <span><span class="lang-en">Fast turnaround time</span><span class="lang-es">Entregas rápidas</span></span>
            </div>
          </div>
          <div class="contact__payment fade-up" style="animation-delay: 0.15s; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span class="lang-en" style="color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Payment Method:</span>
            <span class="lang-es" style="color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Método de Pago:</span>
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 10px;">
              <img src="/images/paypal.png" alt="PayPal" style="height: 22px; width: auto; object-fit: contain;">
              <span style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                <span class="lang-en">Only</span><span class="lang-es">Exclusivo</span>
              </span>
            </div>
          </div>
          <div class="contact__socials fade-up" style="animation-delay: 0.2s">
            <a href="https://x.com/ByJoshhh_" target="_blank" class="social-link" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              <span class="social-link__text">Twitter</span>
            </a>
            <a href="https://www.youtube.com/@ByJoshhh" target="_blank" class="social-link" aria-label="YouTube">
              <svg viewBox="0 0 24 24"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/></svg>
              <span class="social-link__text">YouTube</span>
            </a>
            <a href="https://www.behance.net/byjoshhh_" target="_blank" class="social-link" aria-label="Behance">
              <svg viewBox="0 0 24 24"><path d="M10.15 11.23c1.55-.47 2.37-1.39 2.37-2.91 0-2.31-1.61-3.32-4.07-3.32H3.5v14h5.27c2.61 0 4.29-1.22 4.29-3.53 0-1.85-1.12-2.95-2.91-3.24zM6.63 7.6h1.74c1.07 0 1.74.45 1.74 1.34 0 1-.72 1.44-1.85 1.44H6.63V7.6zm2.02 8.97H6.63v-3.03h2.02c1.23 0 2.05.5 2.05 1.54 0 1.05-.79 1.49-2.05 1.49zm11.85-5.9v-2.04h-4.32v2.04h4.32zM16.18 11.96c-1.82 0-3.06 1.35-3.06 3.42 0 2.12 1.31 3.45 3.19 3.45 1.57 0 2.62-.88 2.91-2.12h-2.73c-.15.46-.5.71-1.02.71-.62 0-1.05-.41-1.17-1.18h5.23c.04-.26.06-.55.06-.88 0-2.1-.96-3.4-3.41-3.4zm-1.02 2.31c.14-.64.54-1.08 1.04-1.08.52 0 .91.43 1 1.08h-2.04z"/></svg>
              <span class="social-link__text">Behance</span>
            </a>
            <a href="javascript:void(0)" class="social-link" title="Discord: ByJoshhh_" aria-label="Discord" onclick="navigator.clipboard.writeText('ByJoshhh_'); const t=this.querySelector('.tooltip'); t.style.opacity='1'; setTimeout(()=>t.style.opacity='0', 2000);">
              <svg viewBox="0 0 24 24"><path d="M19.14 5.96a16.63 16.63 0 0 0-4.14-1.28.16.16 0 0 0-.17.08c-.18.32-.38.74-.53 1.07a15.82 15.82 0 0 0-4.6 0c-.15-.33-.35-.75-.53-1.07a.16.16 0 0 0-.17-.08 16.63 16.63 0 0 0-4.14 1.28.16.16 0 0 0-.07.06C2.61 9.94 1.83 13.8 2.15 17.6a.2.2 0 0 0 .08.15 16.7 16.7 0 0 0 5.06 2.56.16.16 0 0 0 .17-.05c.4-.55.77-1.13 1.1-1.74a.16.16 0 0 0-.08-.22 11.23 11.23 0 0 1-1.6-.76.16.16 0 0 1-.01-.27c.1-.08.21-.17.31-.25a.15.15 0 0 1 .16-.02c3.34 1.53 6.95 1.53 10.27 0a.15.15 0 0 1 .16.02c.1.08.21.17.31.25a.16.16 0 0 1-.01.27 11.23 11.23 0 0 1-1.6.76.16.16 0 0 0-.08.22c.33.61.7 1.19 1.1 1.74a.16.16 0 0 0 .17.05 16.7 16.7 0 0 0 5.06-2.56.2.2 0 0 0 .08-.15c.37-4.3-.96-8.15-2.82-11.58a.16.16 0 0 0-.07-.06zm-10.42 8.7c-1.06 0-1.93-.95-1.93-2.12s.86-2.12 1.93-2.12c1.08 0 1.94.96 1.93 2.12 0 1.17-.86 2.12-1.93 2.12zm6.56 0c-1.06 0-1.93-.95-1.93-2.12s.86-2.12 1.93-2.12c1.08 0 1.94.96 1.93 2.12 0 1.17-.86 2.12-1.93 2.12z"/></svg>
              <span class="social-link__text">Discord</span>
              <span class="tooltip" style="position:absolute; top:-35px; left:50%; transform:translateX(-50%); background:var(--accent-primary); color:#000; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; opacity:0; transition:0.3s; pointer-events:none; white-space:nowrap;">¡Copiado! ByJoshhh_</span>
            </a>
          </div>
          <div class="contact__character fade-up" style="margin-top: 48px; animation-delay: 0.35s; display: flex; justify-content: center;">
            <img src="/images/reze-danza-reze-dance.gif" alt="Reze Dance" loading="lazy" decoding="async" style="max-width: 280px; width: 100%; border-radius: var(--radius-lg); animation: floatGif 4s ease-in-out infinite; box-shadow: var(--shadow-lg);">
          </div>
        </div>
        <form action="https://api.web3forms.com/submit" method="POST" class="contact__form fade-up" id="contact-form" style="animation-delay: 0.3s">
          <input type="hidden" name="access_key" value="48ac47a8-077b-4431-ac61-a6fb68fa626b">
          <input type="checkbox" name="botcheck" class="hidden" style="display: none;">
          <div class="form-row">
            <div class="form-group">
              <input type="text" class="form-input" id="contact-name" name="name"
                     placeholder="Your Name / Tu Nombre" required>
            </div>
            <div class="form-group">
              <input type="email" class="form-input" id="contact-email" name="email"
                     placeholder="Your Email / Tu Correo" required>
            </div>
          </div>
          <div class="form-group">
            <input type="text" class="form-input" id="contact-subject"
                   placeholder="Subject / Asunto">
          </div>
          <div class="form-group">
            <textarea class="form-textarea" id="contact-message" name="message"
                      placeholder="Tell me about your project... / Cuéntame sobre tu proyecto..." required></textarea>
          </div>
          <button type="submit" class="btn btn--primary form-submit" id="contact-submit">
            <span class="lang-en">Send Message</span><span class="lang-es">Enviar Mensaje</span>
          </button>
        </form>
      </div>
      <div class="footer-stamp fade-up" style="width: 100%; display: flex; justify-content: center; margin-top: 80px; padding-top: 40px; border-top: 1px solid var(--border-color); animation-delay: 0.5s;">
        <a onclick="document.getElementById('projects').scrollIntoView({behavior: 'smooth'}); setTimeout(() => document.querySelector('.filter-btn[data-filter=\\'geometry-dash\\']').click(), 400);" style="display: inline-block;">
          <img src="/images/logo%20-%20Geometry%20dash%20thumbnails.png" alt="Geometry Dash Thumbnails Stamp" style="max-width: 320px; opacity: 0.65; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); transition: opacity 0.3s ease, filter 0.3s ease; cursor: pointer;" onmouseover="this.style.opacity=1; this.style.filter='drop-shadow(0 8px 24px rgba(79, 195, 247, 0.3))';" onmouseout="this.style.opacity=0.65; this.style.filter='drop-shadow(0 4px 12px rgba(0,0,0,0.5))'">
        </a>
      </div>
    </div>
  `;

  const form = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const successClose = document.getElementById('success-close');

  successClose?.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const orig = btn.innerHTML;

    // --- Rate Limiting (Cooldown de 15 minutos) ---
    const COOLDOWN_MS = 15 * 60 * 1000;
    const lastSent = localStorage.getItem('byjosh_last_email_sent');
    if (lastSent && (Date.now() - parseInt(lastSent) < COOLDOWN_MS)) {
      btn.innerHTML = '<span class="lang-en">Wait 15 mins to send again</span><span class="lang-es">Espera 15 mins para enviar de nuevo</span>';
      btn.style.background = '#ff4757';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
      }, 4000);
      return;
    }

    btn.innerHTML = '<span class="lang-en">Sending...</span><span class="lang-es">Enviando...</span>';

    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        localStorage.setItem('byjosh_last_email_sent', Date.now().toString());
        btn.innerHTML = orig;
        form.reset();
        successModal.classList.add('active');
      } else {
        btn.innerHTML = '<span class="lang-en">Error :(</span><span class="lang-es">Error :(</span>';
        btn.style.background = '#ff4757';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
        }, 4000);
      }
    } catch (error) {
      btn.innerHTML = '<span class="lang-en">Error :(</span><span class="lang-es">Error :(</span>';
      btn.style.background = '#ff4757';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
      }, 4000);
    }
  });
}
