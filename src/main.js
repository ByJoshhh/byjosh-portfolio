/**
 * Entry point — imports styles and initialises every module.
 */
import './style.css';

import { initNavbar } from './components/navbar.js';
import { initFooter } from './components/footer.js';
import { initParticles } from './components/particles.js';
import { initSakura } from './components/sakura.js';
import { initCursor } from './components/cursor.js';

import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initProjects } from './sections/projects.js';
import { initServices } from './sections/services.js';
import { initPricing } from './sections/pricing.js';
import { initReviews } from './sections/reviews.js';
import { initFaq } from './sections/faq.js';
import { initContact } from './sections/contact.js';

import { initAnimations, initSmoothScroll } from './utils/animations.js';
import { animateCounters } from './utils/counter.js';
import { initMusicPlayer } from './components/musicPlayer.js';

// Force manual scroll restoration so browsers never load offset/scrolled down
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// --- Preloader Logic ---
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const text = document.getElementById('preloader-text');
  
  if (!preloader || !bar || !text) return;

  let progress = 0;
  // Fake progress up to 90%
  const fakeLoader = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 90) progress = 90;
    
    bar.style.width = `${progress}%`;
    text.innerText = `${Math.floor(progress)}%`;
  }, 150);

  const finishLoading = () => {
    clearInterval(fakeLoader);
    bar.style.width = '100%';
    text.innerText = '100%';
    
    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.add('loaded');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Start intersection animations and counters
      initAnimations();
      animateCounters();
    }, 250);
  };

  // When all images and resources actually finish loading
  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading, { once: true });
  }

  // Safety fallback for ultra-fast reloads or hanging network assets
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      finishLoading();
    }
  }, 2000);
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  initPreloader();
  // 5 — Prevent Image Theft
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.project-card') || e.target.closest('.lightbox')) {
      e.preventDefault();
    }
  });
  
  // 1 — Components
  initNavbar();
  initFooter();
  initParticles();
  initSakura();
  initCursor();
  initMusicPlayer();

  // 2 — Sections (order matters for DOM population)
  initHero();
  initAbout();
  initProjects();
  initServices();
  initPricing();
  initReviews();
  initFaq();
  initContact();

  // 3 — Modals & URL Listeners (loaded on demand to keep initial load lightweight)
  const search = window.location.search;
  const hash = window.location.hash;

  if (search.includes('review') || hash.includes('review')) {
    import('./components/reviewModal.js').then((m) => m.initReviewModal());
  }

  if (search.includes('admin') || hash.includes('admin')) {
    import('./components/adminModal.js').then((m) => m.initAdminModal());
  } else {
    let adminLoading = false;
    const loadAdmin = () => {
      if (adminLoading) return;
      adminLoading = true;
      import('./components/adminModal.js').then((m) => {
        m.initAdminModal();
        m.openAdminModal();
      }).catch((e) => {
        adminLoading = false;
        console.error('Failed to load admin modal:', e);
      });
    };
    document.getElementById('footer-admin-trigger')?.addEventListener('click', (e) => {
      e.preventDefault();
      loadAdmin();
    });
    window.addEventListener('keydown', (e) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        loadAdmin();
      }
    });
    window.addEventListener('popstate', () => {
      if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
        loadAdmin();
      }
    });
  }

  // 4 — Utilities
  initSmoothScroll();
});
