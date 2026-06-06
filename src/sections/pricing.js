/**
 * Pricing section — honest pricing cards.
 */
export function initPricing() {
  const section = document.getElementById('pricing');
  if (!section) return;

  section.innerHTML = `
    <div class="container" style="max-width: var(--container-width); margin: 0 auto; padding: 0 var(--container-padding);">
      <div class="section__header fade-up" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
        <span class="section__tag"><span class="lang-en">Invest in Quality</span><span class="lang-es">Invierte en Calidad</span></span>
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <h2 class="section__title" style="margin: 0;"><span class="lang-en">Pricing <span class="text-gradient">Plans</span></span><span class="lang-es">Planes de <span class="text-gradient">Precios</span></span></h2>
          <span class="badge badge--primary" style="font-size: 0.75rem; padding: 4px 12px; animation: pulse-dot 2s infinite;"><span class="lang-en">Offers Coming Soon!</span><span class="lang-es">¡Ofertas Pronto!</span></span>
        </div>
      </div>
      
      <div class="pricing__grid stagger-children fade-up" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 40px;">
        
        <!-- Thumbnails -->
        <div class="service-card" style="padding: 32px; border: 2px solid var(--accent-primary); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <h3 class="service-card__title" style="margin-bottom: 0;"><span class="lang-en">Thumbnails</span><span class="lang-es">Miniaturas</span></h3>
              <span style="background: var(--accent-gradient); color: #0b0d14; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; white-space: nowrap;"><span class="lang-en">Popular</span><span class="lang-es">Popular</span></span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;"><span class="lang-en">Geometry Dash & Gaming</span><span class="lang-es">Geometry Dash y Gaming</span></p>
            <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px;">$4<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;"> USD</span></div>
          </div>
          <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--primary" style="width: 100%;"><span class="lang-en">Order Now</span><span class="lang-es">Ordenar Ahora</span></button>
        </div>

        <!-- AVIS -->
        <div class="service-card" style="padding: 32px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 class="service-card__title" style="margin-bottom: 8px;"><span class="lang-en">Avatars / AVIS</span><span class="lang-es">Avatares / AVIS</span></h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;"><span class="lang-en">Profile Pictures</span><span class="lang-es">Fotos de Perfil</span></p>
            <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px;">$3.50<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;"> USD</span></div>
          </div>
          <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--outline" style="width: 100%;"><span class="lang-en">Order Now</span><span class="lang-es">Ordenar Ahora</span></button>
        </div>

        <!-- Headers & Banners -->
        <div class="service-card" style="padding: 32px; border: 2px solid var(--accent-primary); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <h3 class="service-card__title" style="margin-bottom: 0;"><span class="lang-en">Headers & Banners</span><span class="lang-es">Headers & Banners</span></h3>
              <span style="background: var(--accent-gradient); color: #0b0d14; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; white-space: nowrap;"><span class="lang-en">Popular</span><span class="lang-es">Popular</span></span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;"><span class="lang-en">Twitter, YouTube, Twitch</span><span class="lang-es">Twitter, YouTube, Twitch</span></p>
            <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px;">$6.50<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;"> USD</span></div>
          </div>
          <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--primary" style="width: 100%;"><span class="lang-en">Order Now</span><span class="lang-es">Ordenar Ahora</span></button>
        </div>

        <!-- UI / Overlays -->
        <div class="service-card" style="padding: 32px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 class="service-card__title" style="margin-bottom: 8px;"><span class="lang-en">UI & Overlays</span><span class="lang-es">Interfaces & Overlays</span></h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;"><span class="lang-en">Stream Packs & Web UI</span><span class="lang-es">Stream Packs & Web UI</span></p>
            <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px;">$10<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;"> USD</span></div>
          </div>
          <button onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="btn btn--outline" style="width: 100%;"><span class="lang-en">Order Now</span><span class="lang-es">Ordenar Ahora</span></button>
        </div>
      </div>

      <div class="fade-up" style="text-align: left; margin-top: 32px; padding: 20px 24px; background: rgba(255, 193, 7, 0.08); border-left: 4px solid #ffc107; border-radius: 0 var(--radius-lg) var(--radius-lg) 0;">
        <p style="font-size: 0.95rem; color: #ffca28; margin: 0 0 8px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span class="lang-en">Maximum Price Guarantee</span><span class="lang-es">Garantía de Precio Máximo</span>
        </p>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.6;">
          <span class="lang-en">The prices shown above are the <strong>absolute maximum</strong> you will pay. The final price is completely negotiable and may be lower depending on the specific requirements or simplicity of your project, but it will never go higher than what is stated here.</span>
          <span class="lang-es">Los precios plasmados arriba son lo <strong>máximo</strong> que pagarás. El precio final es totalmente negociable hacia abajo dependiendo de la simplicidad o los requisitos de tu proyecto, pero te garantizo que nunca subirán a más de lo que ves aquí.</span>
        </p>
      </div>

      <div class="fade-up" style="text-align: left; margin-top: 16px; padding: 20px 24px; background: rgba(76, 175, 80, 0.08); border-left: 4px solid #4caf50; border-radius: 0 var(--radius-lg) var(--radius-lg) 0; animation-delay: 0.2s;">
        <p style="font-size: 0.95rem; color: #81c784; margin: 0 0 8px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span class="lang-en">100% Delivery & Quality Guarantee</span><span class="lang-es">100% Garantía de Entrega y Calidad</span>
        </p>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.6;">
          <span class="lang-en">The most important thing is to deliver exactly what the client asks for. Based on that, the final result will fully reflect the agreed price, ensuring you receive a polished design worth every penny.</span>
          <span class="lang-es">Lo más importante aquí es entregar exactamente lo que el cliente pida. En base a eso, el rendimiento cumplirá al 100% con el precio acordado, asegurando que recibas un diseño pulido que valga cada centavo.</span>
        </p>
      </div>

    </div>
  `;
}
