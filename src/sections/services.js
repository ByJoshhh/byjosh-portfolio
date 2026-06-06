/**
 * Services — clean SVG line-icon cards instead of emoji.
 */
export function initServices() {
  const section = document.getElementById('services');
  if (!section) return;

  section.innerHTML = `
    <div class="services__container">
      <div class="section__header fade-up">
        <span class="section__tag"><span class="lang-en">Expertise</span><span class="lang-es">Experiencia</span></span>
        <h2 class="section__title"><span class="lang-en">What I <span class="text-gradient">do</span></span><span class="lang-es">Lo que <span class="text-gradient">hago</span></span></h2>
      </div>
      <div class="services__grid stagger-children fade-up">
        <div class="service-card">
          <div class="service-card__icon">
            <img src="/images/favicongd.svg" alt="Geometry Dash Icon" style="width: 24px; height: 24px; object-fit: contain;">
          </div>
          <h3 class="service-card__title"><span class="lang-en">Thumbnail Design</span><span class="lang-es">Diseño de Miniaturas</span></h3>
          <p class="service-card__description"><span class="lang-en">Geometry Dash exclusive thumbnails, if you require any other style of thumbnail you are completely free to choose ;)</span><span class="lang-es">Miniaturas exclusivamente de geometry dash, si usted requiere algun otro estilo de miniatura es totalmente libre de elegir ;)</span></p>
        </div>
        <div class="service-card">
          <div class="service-card__icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <h3 class="service-card__title"><span class="lang-en">Brand Identity</span><span class="lang-es">Identidad de Marca</span></h3>
          <p class="service-card__description"><span class="lang-en">Logos, banners, and complete channel assets for streamers and creators.</span><span class="lang-es">Logos, banners y recursos completos de canal para streamers y creadores.</span></p>
        </div>

        <div class="service-card">
          <div class="service-card__icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <h3 class="service-card__title"><span class="lang-en">UI/UX Design</span><span class="lang-es">Diseño de Interfaces</span></h3>
          <p class="service-card__description"><span class="lang-en">Clean, modern web and app interfaces tailored for creative brands.</span><span class="lang-es">Interfaces modernas y limpias para aplicaciones y webs de marcas creativas.</span></p>
        </div>
      </div>
    </div>
  `;
}
