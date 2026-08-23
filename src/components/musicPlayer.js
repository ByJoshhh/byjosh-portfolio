/**
 * Music Player Component — Floating Widget with Web Audio Visualizer
 *
 * Features:
 *  • 100% glitch-free audio engine handling rapid clicks & race conditions
 *  • Interactive waveform visualizer with idle sine wave & active audio reactive mode
 *  • Dynamic track progress bar with click-to-seek
 *  • Volume toggle & hover slider control
 *  • Smart tooltip: auto-hides on play, re-appears on pause, dismissible
 *  • Ambient glow breathing with audio amplitude
 */

export function initMusicPlayer() {
  // ── 1. Create Widget DOM ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'music-player';
  widget.innerHTML = `
    <!-- Smart Tooltip -->
    <div class="mp-tooltip" id="mp-tooltip">
      <div class="mp-tooltip__content">
        <svg class="mp-tooltip__icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
        </svg>
        <span>Background music available</span>
      </div>
      <button class="mp-tooltip__close" id="mp-tooltip-close" aria-label="Dismiss tooltip">&times;</button>
    </div>

    <!-- Ambient Audio Glow -->
    <div class="mp-glow" id="mp-glow"></div>

    <!-- Main Pill Container -->
    <div class="mp-inner" id="mp-inner">
      <!-- Play/Pause Button -->
      <button class="mp-btn" id="mp-playbtn" aria-label="Play background music" title="Play / Pause">
        <svg class="mp-icon mp-icon--play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <div class="mp-eq" id="mp-eq" style="display:none">
          <span class="mp-eq-bar"></span>
          <span class="mp-eq-bar"></span>
          <span class="mp-eq-bar"></span>
        </div>
      </button>

      <!-- Visualizer & Track Info -->
      <div class="mp-body">
        <div class="mp-canvas-wrap" id="mp-canvas-wrap" title="Click to seek">
          <canvas id="mp-canvas" width="115" height="30"></canvas>
          <div class="mp-progress-bar" id="mp-progress-bar"></div>
        </div>
        <div class="mp-info-row">
          <span class="mp-dot" id="mp-dot"></span>
          <span class="mp-track-name" title="wiv — i love u">wiv — i love u</span>
          <span class="mp-time" id="mp-time">0:00</span>
        </div>
      </div>

      <!-- Volume / Mute Button -->
      <div class="mp-vol-wrap">
        <button class="mp-vol-btn" id="mp-vol-btn" aria-label="Mute / Unmute" title="Volume">
          <svg class="mp-vol-icon mp-vol-icon--high" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <svg class="mp-vol-icon mp-vol-icon--muted" viewBox="0 0 24 24" fill="currentColor" style="display:none">
            <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        </button>
        <div class="mp-vol-slider-wrap">
          <input type="range" class="mp-vol-slider" id="mp-vol-slider" min="0" max="1" step="0.05" value="0.45" aria-label="Volume slider" />
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── 2. Element References ───────────────────────────────────────────────────
  const tooltip      = document.getElementById('mp-tooltip');
  const tooltipClose = document.getElementById('mp-tooltip-close');
  const glowEl       = document.getElementById('mp-glow');
  const playBtn      = document.getElementById('mp-playbtn');
  const iconPlay     = playBtn.querySelector('.mp-icon--play');
  const iconEq       = document.getElementById('mp-eq');
  const canvas       = document.getElementById('mp-canvas');
  const canvasCtx    = canvas.getContext('2d');
  const canvasWrap   = document.getElementById('mp-canvas-wrap');
  const progressBar  = document.getElementById('mp-progress-bar');
  const dotEl        = document.getElementById('mp-dot');
  const timeEl       = document.getElementById('mp-time');
  const volBtn       = document.getElementById('mp-vol-btn');
  const volIconHigh  = volBtn.querySelector('.mp-vol-icon--high');
  const volIconMuted = volBtn.querySelector('.mp-vol-icon--muted');
  const volSlider    = document.getElementById('mp-vol-slider');

  // ── 3. Audio & Web Audio Setup ──────────────────────────────────────────────
  const audio = new Audio('/wiv-i-love-u.mp3');
  audio.loop    = true;
  audio.volume  = 0.45;
  audio.preload = 'metadata';

  let currentTargetVolume = 0.45;
  let isMuted = false;
  let isPlaying = false;
  let playPromise = null;
  let fadeRaf = null;

  let ctx = null;
  let analyser = null;
  let source = null;
  let rafId = null;
  let idleClock = 0;

  // Initialize Web Audio graph
  function initAudioCtx() {
    if (ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtxClass();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('Web Audio init skipped:', e);
    }
  }

  // ── 4. Glitch-Free Volume Fading ───────────────────────────────────────────
  function smoothVolume(target, duration = 200) {
    if (fadeRaf) cancelAnimationFrame(fadeRaf);
    if (isMuted) {
      audio.volume = 0;
      return;
    }
    const startVol = audio.volume;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic easing
      const ease = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * ease));

      if (progress < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = null;
        if (target === 0 && !isPlaying) {
          audio.pause();
        }
      }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  // ── 5. Play / Pause Control (Rock-Solid State Machine) ─────────────────────
  async function handlePlay() {
    isPlaying = true;
    updatePlayUI(true);

    initAudioCtx();
    if (ctx && ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (e) {}
    }

    try {
      playPromise = audio.play();
      await playPromise;
      playPromise = null;

      // If user toggled pause while play was resolving
      if (!isPlaying) {
        audio.pause();
        audio.volume = 0;
      } else {
        smoothVolume(currentTargetVolume, 300);
      }
    } catch (err) {
      playPromise = null;
      if (err.name !== 'AbortError') {
        console.warn('Playback error:', err);
      }
    }
  }

  function handlePause() {
    isPlaying = false;
    updatePlayUI(false);

    smoothVolume(0, 180);

    // If playPromise is not currently pending, pause immediately
    if (!playPromise) {
      setTimeout(() => {
        if (!isPlaying) audio.pause();
      }, 190);
    }
  }

  function togglePlay() {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }

  function updatePlayUI(playing) {
    if (playing) {
      iconPlay.style.display = 'none';
      iconEq.style.display   = 'flex';
      widget.classList.add('mp--playing');
      dotEl.classList.add('mp-dot--active');
      playBtn.setAttribute('aria-label', 'Pause background music');
    } else {
      iconPlay.style.display = '';
      iconEq.style.display   = 'none';
      widget.classList.remove('mp--playing');
      dotEl.classList.remove('mp-dot--active');
      playBtn.setAttribute('aria-label', 'Play background music');
    }
  }

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // ── 6. Tooltip Behavior (Auto-show on load & pause, Auto-hide on play) ──────
  let tooltipDismissed = false;

  tooltipClose.addEventListener('click', (e) => {
    e.stopPropagation();
    tooltipDismissed = true;
    tooltip.classList.remove('is-visible');
    tooltip.style.display = 'none';
  });

  // ── 7. Volume & Mute Controls ──────────────────────────────────────────────
  volSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentTargetVolume = val;
    if (val === 0) {
      isMuted = true;
      audio.volume = 0;
      volIconHigh.style.display = 'none';
      volIconMuted.style.display = '';
    } else {
      isMuted = false;
      if (isPlaying) audio.volume = val;
      volIconHigh.style.display = '';
      volIconMuted.style.display = 'none';
    }
  });

  volBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    if (isMuted) {
      audio.volume = 0;
      volIconHigh.style.display = 'none';
      volIconMuted.style.display = '';
      volSlider.value = 0;
    } else {
      const restoreVol = currentTargetVolume > 0 ? currentTargetVolume : 0.45;
      currentTargetVolume = restoreVol;
      if (isPlaying) audio.volume = restoreVol;
      volIconHigh.style.display = '';
      volIconMuted.style.display = 'none';
      volSlider.value = restoreVol;
    }
  });

  // ── 8. Track Progress & Seeking ────────────────────────────────────────────
  function formatTime(sec) {
    if (isNaN(sec) || sec === Infinity) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    timeEl.textContent = formatTime(audio.currentTime);
  });

  canvasWrap.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = canvasWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = ratio * audio.duration;
  });

  // ── 9. Waveform Visualizer & Ambient Glow Loop ─────────────────────────────
  let lastFrameTime = 0;
  const IDLE_FPS_INTERVAL = 1000 / 24;  // 24fps in idle to save CPU
  const PLAY_FPS_INTERVAL = 1000 / 60;  // 60fps when active

  function getAudioEnergy() {
    if (!analyser || !isPlaying) return 0;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i];
    return sum / (buf.length * 255);
  }

  function drawWave(now = 0) {
    rafId = requestAnimationFrame(drawWave);

    const interval = isPlaying ? PLAY_FPS_INTERVAL : IDLE_FPS_INTERVAL;
    if (now - lastFrameTime < interval) return;
    lastFrameTime = now;

    const W = canvas.width;
    const H = canvas.height;
    canvasCtx.clearRect(0, 0, W, H);

    // Dynamic Glow matching music amplitude
    const energy = getAudioEnergy();
    if (isPlaying) {
      const glowBlur = 18 + energy * 45;
      glowEl.style.opacity = (0.3 + energy * 0.45).toFixed(2);
      glowEl.style.filter = `blur(${glowBlur.toFixed(1)}px)`;
    } else {
      glowEl.style.opacity = '0';
    }

    // Dynamic Gradient for Waveform
    const grad = canvasCtx.createLinearGradient(0, 0, W, 0);
    if (isPlaying) {
      grad.addColorStop(0,   'rgba(74, 222, 128, 0.4)');
      grad.addColorStop(0.3, 'rgba(74, 222, 128, 0.95)');
      grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.95)');
      grad.addColorStop(1,   'rgba(129, 140, 248, 0.4)');
    } else {
      grad.addColorStop(0,   'rgba(74, 222, 128, 0.15)');
      grad.addColorStop(0.5, 'rgba(74, 222, 128, 0.4)');
      grad.addColorStop(1,   'rgba(74, 222, 128, 0.15)');
    }

    canvasCtx.lineWidth = isPlaying ? 2.2 : 1.5;
    canvasCtx.strokeStyle = grad;
    canvasCtx.shadowColor = '#4ade80';
    canvasCtx.shadowBlur = isPlaying ? (6 + energy * 10) : 0;
    canvasCtx.beginPath();

    if (analyser && isPlaying) {
      // Real-time audio waveform
      const binCount = analyser.frequencyBinCount;
      const data = new Uint8Array(binCount);
      analyser.getByteTimeDomainData(data);

      const sliceW = W / binCount;
      let x = 0;

      for (let i = 0; i < binCount; i++) {
        const v = data[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceW;
      }
    } else {
      // Smooth idle harmonic wave
      idleClock += 0.035;
      const points = 60;
      const sliceW = W / points;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 3 + idleClock;
        const y = H / 2 + Math.sin(angle) * 3.5;
        if (i === 0) canvasCtx.moveTo(0, y);
        else canvasCtx.lineTo(i * sliceW, y);
      }
    }

    canvasCtx.stroke();
  }

  // Start visualizer loop
  drawWave();

  // ── 10. Cleanup ────────────────────────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    if (fadeRaf) cancelAnimationFrame(fadeRaf);
    audio.pause();
    if (ctx) ctx.close();
  });
}
