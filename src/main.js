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
import { initFaq } from './sections/faq.js';
import { initContact } from './sections/contact.js';

import { initAnimations, initSmoothScroll } from './utils/animations.js';
import { animateCounters } from './utils/counter.js';

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

  // When all images and resources actually finish loading
  window.addEventListener('load', () => {
    clearInterval(fakeLoader);
    bar.style.width = '100%';
    text.innerText = '100%';
    
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 400); // small delay to let user see 100%
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  // 1 — Components
  initNavbar();
  initFooter();
  initParticles();
  initSakura();
  initCursor();

  // 2 — Sections (order matters for DOM population)
  initHero();
  initAbout();
  initProjects();
  initServices();
  initPricing();
  initFaq();
  initContact();

  // 3 — Utilities (must run after sections are rendered)
  initAnimations();
  initSmoothScroll();
  animateCounters();
});
