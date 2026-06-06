/**
 * About — bio, clean badges (no emoji), and animated stat counters.
 */
export function initAbout() {
  const about = document.getElementById('about');
  if (!about) return;

  about.innerHTML = `
    <div class="about__content">
      <div class="about__left">
        <div class="section__header section__header--left fade-up" style="margin-bottom: 32px;">
          <span class="section__tag"><span class="lang-en">Who is</span><span class="lang-es">Quién soy</span></span>
          <h2 class="section__title"><span class="lang-en">About <span class="text-gradient">Me</span></span><span class="lang-es">Sobre <span class="text-gradient">Mí</span></span></h2>
        </div>
        <div class="about__bio fade-up">
          <p>
            <span class="lang-en">Hi, I'm Josh. Design is one of my hobbies that I've been polishing for the last 3.5 years, so welcome! Currently, I dedicate myself to creating headers, banners, thumbnails, overlays, and even programmer-level GUI interface designs. So if you're looking for something similar, you're in the right place!</span>
            <span class="lang-es">Hola soy Josh, el diseño es uno de mis hobbies que he estado puliendo desde estos ultimos 3.5 años, asi que bienvenido, actualmente me dedico a realizar headers, banners, miniaturas, overlays, y hasta diseños GUI interfaz a nivel programador, a si que si estas buscando algo similar estas en el sitio correcto!</span>
          </p>
          <p>
            <span class="lang-en">My focus ranges mainly from chaotic aesthetics to something simpler, with absolutely polished compositions using tools like Adobe Photoshop 2025 and Blender. I believe the most important thing is to deliver a totally high-quality design to the client within a very reasonable timeframe.</span>
            <span class="lang-es">Mi enfoque principalmente va hacia la estetica caotia a algo mas simple, composiciones absolutamente pulidos usando herramientas como Adobe Photoshop 2025 y Blender, en el cual pienso que lo mas importante es entregarle al cliente un diseño totalmente de calidad con un tiempo de entrega bastante razonable.</span>
          </p>
          <div class="about__badges">
            <span class="badge badge--accent"><span class="lang-en">Available for Freelance</span><span class="lang-es">Disponible para Freelance</span></span>
            <span class="badge badge--primary"><span class="lang-en">Student</span><span class="lang-es">Estudiante</span></span>
            <span class="badge badge--secondary"><span class="lang-en">Mexico</span><span class="lang-es">México</span></span>
          </div>
        </div>
        <div class="about__stats fade-up stagger-children" style="margin-top: 40px;">
          <div class="stat-card fade-up">
            <span class="stat-card__number" data-target="3" data-suffix="+">0+</span>
            <span class="stat-card__label"><span class="lang-en">Years Experience</span><span class="lang-es">Años de Experiencia</span></span>
          </div>
          <div class="stat-card fade-up" style="transition-delay: 150ms;">
            <span class="stat-card__number" data-target="200" data-suffix="+">0+</span>
            <span class="stat-card__label"><span class="lang-en">Projects Completed</span><span class="lang-es">Proyectos Completados</span></span>
          </div>
        </div>
      </div>
      <div class="about__visuals fade-up" style="animation-delay: 0.3s">
        <img src="/images/senpai-mio.gif" alt="Anime aesthetic 1" class="about__gif about__gif--1" loading="lazy" decoding="async">
        <img src="/images/haimiya-anime.gif" alt="Anime aesthetic 2" class="about__gif about__gif--2" loading="lazy" decoding="async">
      </div>
    </div>
  `;
}
