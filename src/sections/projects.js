/**
 * Projects gallery — updated with cool-toned gradients.
 */
import { scrollObserver } from '../utils/animations.js';
export function initProjects() {
  const section = document.getElementById('projects');
  if (!section) return;

  const data = [
    { title: 'Acheron', cat: 'featured,geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Acheron.jpg', bg: 'linear-gradient(135deg, #1a1e3a, #0b0d14)' },
    { title: 'Acheron Variant', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/ACHERON-THUMBNAIL1.png', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'ASTR1D Rework', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/ASTR1D-rework.png', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'Aegleseeker', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Aegleseeker.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Bloodlust', cat: 'featured,geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Bloodlust.jpg', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'Crimson Clutter', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Crimson-Clutter.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Ouroboros', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Ouroboros.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Nhelv Old', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Nhelv(old).jpg', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Black Blizzard', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Black-Blizzard.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Black Blizzard Old', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Black-Blizzard(old).png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Cosmic Cyclone', cat: 'featured,geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Cosmic-Cyclone.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Digital Descent', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/DigitalDescent.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Nhelv 4k', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Nhelv-4k.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Night Rider', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Night-Rider.png', bg: 'linear-gradient(135deg, #1a1e3a, #0b0d14)' },
    { title: 'Proto Flicker', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/PROTO-FLICKER.png', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'Retitled', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Retitled.jpg', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Sonic Wave', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/SonicWave.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Spectrum Cyclone', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Spectrum-Cyclone.jpg', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'Sunix TP2', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Sunix-TP2-iconpacks.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Tartarus', cat: 'featured,geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Tartarus-Sunix-cc.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Tartarus Old', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Tartarusold.jpg', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'The Golden', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/TheGolden.png', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'The Grief', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/THE-GRIEF.png', bg: 'linear-gradient(135deg, #1a1e3a, #0b0d14)' },
    { title: 'The Ultimate Phase', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/TheUltimatePhase.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Wasureta', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Wasureta01.png', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Zodiac', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/ZODIAC-sunix.png', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'GD Grief', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/gd-grief.png', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'GD River', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/gd-river.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Aftermath', cat: 'geometry-dash,thumbnails', img: '/images/GD%20thumbnails/Aftermath.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Waterfall', cat: 'featured,geometry-dash,thumbnails', img: '/images/GD%20thumbnails/WATERFALL-THUMBNAIL.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },

    { title: 'Violet Evergarden', cat: 'featured,headers', img: '/images/Headers/violet-evergarden-header.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: '86 Header', cat: 'headers', img: '/images/Headers/86.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Alezitah', cat: 'headers', img: '/images/Headers/ALEZITAH.png', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Danganronpa Phobos', cat: 'headers', img: '/images/Headers/Danganronpa-Phobos.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Gravity Falls', cat: 'headers', img: '/images/Headers/Gravity-Falls.jpg', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Arknights', cat: 'headers', img: '/images/Headers/Arknights.jpg', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Genshin Impact', cat: 'headers', img: '/images/Headers/Genshin-Impact.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Hu Tao', cat: 'headers', img: '/images/Headers/HuTao.jpg', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'Lynarmint Oshi No Ko', cat: 'headers', img: '/images/Headers/Lynarmint-OshiNoKo.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Necrum', cat: 'headers', img: '/images/Headers/Necrum-HEADER.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Rimuru Tempest', cat: 'headers', img: '/images/Headers/Rimuru%20Tempest.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Selene Mirai Nikki', cat: 'headers', img: '/images/Headers/Selene-MiraiNikki.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Silexx', cat: 'featured,headers', img: '/images/Headers/Silexx-t.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Steins Gate', cat: 'headers', img: '/images/Headers/Steins;Gate.webp', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'Frostpunk Mystic', cat: 'headers', img: '/images/Headers/frostpunk-dual-mysticGFX.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'The Ahiyu', cat: 'headers', img: '/images/Headers/The-Ahiyu.jpg', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'Vrapur DUAL Danganronpa', cat: 'headers', img: '/images/Headers/Vrapur-DUAL-Danganronpa.webp', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Yoru', cat: 'headers', img: '/images/Headers/yoru-header.jpg', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: '144p Header', cat: 'headers', img: '/images/Headers/144p-header.jpg', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'Call Of The Night', cat: 'headers', img: '/images/Headers/Call-Of-The-Night.jpg', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Ganyu Header', cat: 'headers', img: '/images/Headers/Ganyu.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Happy Sugar Life', cat: 'headers', img: '/images/Headers/Happy-Sugar-Life.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },

    { title: 'Chisato Banner', cat: 'featured,banners', img: '/images/Banners/Chisato-Banner-CC-2.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Chizuru Banner', cat: 'banners', img: '/images/Banners/Chizuru-Banner.png', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Ryexus Banner', cat: 'banners', img: '/images/Banners/Ryexus-Banner.jpg', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'FoxBro Banner', cat: 'banners', img: '/images/Banners/FoxBro-Bannerjpg.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'GD Avi', cat: 'pfps', img: '/images/AVIS/GDavi1.jpg', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Steins PFP', cat: 'pfps', img: '/images/AVIS/Steins;PFP.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Oshi No Ko Avi', cat: 'pfps', img: '/images/AVIS/oshinoko.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Sakura Avi', cat: 'pfps', img: '/images/AVIS/SakuraAVI.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Chisato Avi', cat: 'featured,pfps', img: '/images/AVIS/ChisatoAVI.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Siesta Avi', cat: 'pfps', img: '/images/AVIS/Siesta-The-Detective-Is-Dead.webp', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Recoil Chisato Avi', cat: 'pfps', img: '/images/AVIS/Recoil-Chisato-AVI.webp', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },

    { title: 'Kroh Banner', cat: 'banners', img: '/images/Banners/Kroh-2.png', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'Kroh Banner 1', cat: 'banners', img: '/images/Banners/Kroh-1.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'ByJosh Banner', cat: 'featured,banners', img: '/images/Banners/ByJosh-Banner.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Mitaka Asa', cat: 'banners', img: '/images/Banners/Mitaka-Asa.png', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'SpaceUK Banner', cat: 'banners', img: '/images/Banners/SpaceUK-banner.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Ganyu Banner', cat: 'banners', img: '/images/Banners/ganyu-banner.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Evernight Finished', cat: 'banners', img: '/images/Banners/evernight-finished.png', bg: 'linear-gradient(135deg, #2d1b4e, #1a1e3a)' },
    { title: 'Andere Banner', cat: 'banners', img: '/images/Banners/Andere-Banner.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Changli Wuthering Waves', cat: 'banners', img: '/images/Banners/Changli-Wuthering-Waves.jpg', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' },
    { title: 'Chiaki Nanami', cat: 'banners', img: '/images/Banners/Chiaki-Nanami-Banner.jpg', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },
    { title: 'Mushoku Tensei', cat: 'banners', img: '/images/Banners/Mushoku-Tensei.jpg', bg: 'linear-gradient(135deg, #6b3a2a, #1a1e3a)' },
    { title: 'One Punch Saitama', cat: 'banners', img: '/images/Banners/One-Punch-Saitama.jpg', bg: 'linear-gradient(135deg, #1a237e, #0b0d14)' },
    { title: 'Sunix Banner', cat: 'banners', img: '/images/Banners/Sunix-Banner-Oficial-Channel-2-K.png', bg: 'linear-gradient(135deg, #2c3e7a, #1a1e3a)' },
    { title: 'Shikimori San', cat: 'banners', img: '/images/Banners/kawaii-dake-ja-nai-shikimori-san.png', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },

    { title: 'Pury Team', cat: 'discord-banners', img: '/images/Discord%20Banners/PURY-TEAM.png', bg: 'linear-gradient(135deg, #ff758c, #1a1e3a)' },

    { title: 'Calex', cat: 'anime-backgrounds', img: '/images/Anime-Backgrounds/CALEXBG.png', bg: 'linear-gradient(135deg, #4fc3f7, #1a1e3a)' }
  ];

  const getCategoryLabel = (cat) => {
    if (cat.includes('thumbnails')) return '<span class="lang-en">Thumbnail Design</span><span class="lang-es">Diseño de Miniaturas</span>';
    if (cat.includes('headers')) return '<span class="lang-en">Header Design</span><span class="lang-es">Diseño de Header</span>';
    if (cat.includes('discord-banners')) return '<span class="lang-en">Discord Banner</span><span class="lang-es">Banner de Discord</span>';
    if (cat.includes('banners')) return '<span class="lang-en">Banner Design</span><span class="lang-es">Diseño de Banner</span>';
    if (cat.includes('pfps')) return '<span class="lang-en">Avatar / PFP</span><span class="lang-es">Avatar / PFP</span>';
    if (cat.includes('anime-backgrounds')) return '<span class="lang-en">Anime Background</span><span class="lang-es">Fondo de Anime</span>';
    return '<span class="lang-en">Digital Art</span><span class="lang-es">Arte Digital</span>';
  };

  section.innerHTML = `
    <div class="projects__container">
      <div class="section__header fade-up">
        <span class="section__tag"><span class="lang-en">Work</span><span class="lang-es">Trabajo</span></span>
        <h2 class="section__title"><span class="lang-en">Featured <span class="text-gradient">projects</span></span><span class="lang-es">Proyectos <span class="text-gradient">destacados</span></span></h2>
      </div>
      <div class="projects__filters fade-up">
        <button class="filter-btn filter-btn--active" data-filter="featured"><span class="lang-en">Featured</span><span class="lang-es">Destacados</span></button>
        <button class="filter-btn" data-filter="all"><span class="lang-en">All</span><span class="lang-es">Todos</span></button>
        <button class="filter-btn" data-filter="geometry-dash">Geometry Dash</button>
        <button class="filter-btn" data-filter="thumbnails"><span class="lang-en">Thumbnails</span><span class="lang-es">Miniaturas</span></button>
        <button class="filter-btn" data-filter="discord-banners">Discord Banners</button>
        <button class="filter-btn" data-filter="anime-backgrounds"><span class="lang-en">Anime Backgrounds</span><span class="lang-es">Fondos de Anime</span></button>
        <button class="filter-btn" data-filter="pfps">AVIs/pfps</button>
        <button class="filter-btn" data-filter="banners">Banners</button>
        <button class="filter-btn" data-filter="headers">Headers</button>
      </div>
      <div class="projects__grid">
        ${data
          .map(
            (p) => `
          <div class="project-card card-spawn" data-categories="${p.cat}">
            <div class="project-card__image" style="background:${p.bg}">
              <img src="${p.img}" alt="${p.title}" decoding="async"
                   onerror="this.closest('.project-card').style.display='none'">
            </div>
            <div class="project-card__overlay">
              <h3 class="project-card__title">${p.title}</h3>
              <p class="project-card__category">${getCategoryLabel(p.cat)}</p>
              <span class="project-card__link"><span class="lang-en">View Full Size</span><span class="lang-es">Ver en Grande</span> →</span>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;

  const btns = section.querySelectorAll('.filter-btn');
  const cards = section.querySelectorAll('.project-card');

  // Register each card with the scroll observer for spawn-on-scroll
  // and stagger their delay so they pop in one-by-one
  if (scrollObserver) {
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${(i % 6) * 60}ms`; // max 6 in a row, 60ms apart
      scrollObserver.observe(card);
    });
  }

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const closeLb = document.getElementById('lightbox-close');

  if (lightbox && lbImg && closeLb) {
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const imgPath = card.querySelector('img').src;
        lbImg.src = imgPath;
        lightbox.classList.add('active');
      });
    });

    closeLb.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) lightbox.classList.remove('active');
    });
  }

  btns.forEach((btn) =>
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      btns.forEach((b) => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      cards.forEach((card) => {
        const cats = card.dataset.categories.split(',');
        const show = f === 'all' || cats.includes(f);
        if (show) {
          card.style.position = '';
          card.style.visibility = '';
          card.style.height = '';
          card.style.overflow = '';
          card.style.margin = '';
          // trigger reflow
          void card.offsetWidth;
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.position = 'absolute';
              card.style.visibility = 'hidden';
              card.style.height = '0';
              card.style.overflow = 'hidden';
              card.style.margin = '0';
            }
          }, 300);
        }
      });
    })
  );

  const featuredBtn = section.querySelector('[data-filter="featured"]');
  if (featuredBtn) {
    // Initial setup to only show featured projects — use visibility so images still load
    cards.forEach((card) => {
      const cats = card.dataset.categories.split(',');
      if (!cats.includes('featured')) {
        card.style.position = 'absolute';
        card.style.visibility = 'hidden';
        card.style.height = '0';
        card.style.overflow = 'hidden';
        card.style.margin = '0';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
      }
    });
  }

  // --- 3D Tilt Effect (Desktop Only) ---
  if (window.matchMedia("(pointer: fine)").matches) {
    cards.forEach((card) => {
      let ticking = false;
      card.addEventListener('mousemove', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
            const rotateY = ((x - centerX) / centerX) * 5;
            
            // Only apply tilt if the card is fully visible (opacity 1)
            if (card.style.opacity !== '0') {
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      });

      card.addEventListener('mouseleave', () => {
        if (card.style.opacity !== '0') {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        }
        // Small delay to let it animate back before removing the inline transform
        setTimeout(() => {
          if (card.style.opacity !== '0' && !card.matches(':hover')) {
            card.style.transform = 'scale(1)'; // reset to standard
          }
        }, 300);
      });
    });
  }
}
