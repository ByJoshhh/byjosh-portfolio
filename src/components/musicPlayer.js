/**
 * Music Player — floating widget (bottom-right) with waveform visualizer.
 *
 * Extra immersion features:
 *  • One-time tooltip hint that fades in/out on load
 *  • Attention-pulse animation (3 bounces) before user interacts
 *  • Animated equalizer bars (3 bars) in the button while playing
 *  • Ambient background glow that breathes with the audio amplitude
 *  • Volume fade-in on first play (soft intro)
 *  • Idle waveform animates as a gentle sine even when paused
 */
export function initMusicPlayer() {
  // ── Build DOM ──────────────────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'music-player';
  widget.innerHTML = `
    <div class="mp-tooltip" id="mp-tooltip">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;color:#4ade80;margin-top:1px">
        <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z"/>
      </svg>
      Background music available
    </div>
    <div class="mp-glow" id="mp-glow"></div>
    <div class="mp-inner">
      <button class="mp-btn" id="mp-playbtn" aria-label="Play / Pause music">
        <!-- Play icon -->
        <svg class="mp-icon mp-icon--play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <!-- Equalizer bars (shown while playing) -->
        <div class="mp-eq" id="mp-eq" style="display:none">
          <span class="mp-eq-bar"></span>
          <span class="mp-eq-bar"></span>
          <span class="mp-eq-bar"></span>
        </div>
      </button>
      <div class="mp-viz-wrap">
        <canvas id="mp-canvas" width="120" height="36"></canvas>
        <div class="mp-track">
          <span class="mp-track-dot" id="mp-dot"></span>
          <span class="mp-track-name">wiv — i love u</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── Audio setup ────────────────────────────────────────────────────────────
  const audio = new Audio('/wiv-i-love-u.mp3');
  audio.loop    = true;
  audio.volume  = 0;          // start at 0, fade in on first play
  audio.preload = 'none';

  let ctx      = null;
  let analyser = null;
  let source   = null;
  let rafId    = null;
  let playing  = false;
  let idleT    = 0;           // idle animation clock

  const canvas    = document.getElementById('mp-canvas');
  const canvasCtx = canvas.getContext('2d');
  const playBtn   = document.getElementById('mp-playbtn');
  const iconPlay  = playBtn.querySelector('.mp-icon--play');
  const iconEq    = document.getElementById('mp-eq');
  const glowEl    = document.getElementById('mp-glow');
  const dotEl     = document.getElementById('mp-dot');
  const tooltip   = document.getElementById('mp-tooltip');

  // ── One-time tooltip hint — appears once and stays visible until user plays ─
  setTimeout(() => {
    tooltip.classList.add('mp-tooltip--visible');
  }, 2000);

  // ── Attention pulse (3 bounces, then stops) ────────────────────────────────
  setTimeout(() => {
    widget.classList.add('mp--attention');
    widget.addEventListener('animationend', () => {
      widget.classList.remove('mp--attention');
    }, { once: true });
  }, 2200);

  // ── Web Audio init (deferred until first play) ────────────────────────────
  function initAudioCtx() {
    if (ctx) return;
    ctx      = new (window.AudioContext || window.webkitAudioContext)();
    analyser = ctx.createAnalyser();
    analyser.fftSize               = 256;
    analyser.smoothingTimeConstant = 0.84;
    source   = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
  }

  // ── Volume fade helper ─────────────────────────────────────────────────────
  function fadeVolume(from, to, durationMs) {
    const steps    = 30;
    const stepTime = durationMs / steps;
    const delta    = (to - from) / steps;
    let   current  = from;
    const tid = setInterval(() => {
      current = Math.min(Math.max(current + delta, 0), 1);
      audio.volume = Math.round(current * 100) / 100;
      if ((delta > 0 && current >= to) || (delta < 0 && current <= to)) {
        clearInterval(tid);
      }
    }, stepTime);
  }

  // ── Get current audio amplitude (0–1) ─────────────────────────────────────
  function getAmplitude() {
    if (!analyser || !playing) return 0;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);
    const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
    return avg / 255;
  }

  // ── Waveform drawing loop ──────────────────────────────────────────────────
  let lastFrameTime = 0;
  const IDLE_FPS = 1000 / 24;   // 24fps when paused
  const PLAY_FPS = 1000 / 60;   // 60fps when playing

  function drawWave(timestamp = 0) {
    rafId = requestAnimationFrame(drawWave);

    // Throttle: 60fps while playing, 24fps while idle
    const targetInterval = playing ? PLAY_FPS : IDLE_FPS;
    if (timestamp - lastFrameTime < targetInterval) return;
    lastFrameTime = timestamp;

    const W = canvas.width;
    const H = canvas.height;
    canvasCtx.clearRect(0, 0, W, H);

    // ── Ambient glow driven by amplitude ──────────────────────────────────
    const amp = getAmplitude();
    if (playing) {
      const glow = 20 + amp * 60;  // 20–80px blur radius
      glowEl.style.opacity = 0.35 + amp * 0.5;
      glowEl.style.filter  = `blur(${glow}px)`;
    } else {
      glowEl.style.opacity = 0;
    }

    // ── Wave data ──────────────────────────────────────────────────────────
    let dataArr;
    if (analyser) {
      dataArr = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(dataArr);
    }

    // gradient stroke
    const alpha = playing ? 1 : 0.35;
    const grad  = canvasCtx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0,   `rgba(74,222,128,${0.3 * alpha})`);
    grad.addColorStop(0.5, `rgba(74,222,128,${alpha})`);
    grad.addColorStop(1,   `rgba(74,222,128,${0.3 * alpha})`);

    canvasCtx.beginPath();
    canvasCtx.lineWidth   = playing ? 2.5 : 1.5;
    canvasCtx.strokeStyle = grad;
    canvasCtx.shadowColor = '#4ade80';
    canvasCtx.shadowBlur  = playing ? (6 + amp * 12) : 0;

    const sliceW = W / (analyser ? analyser.frequencyBinCount : 128);
    let x = 0;

    if (analyser && playing) {
      // Real waveform
      for (let i = 0; i < dataArr.length; i++) {
        const v = dataArr[i] / 128.0;
        const y = (v * H) / 2;
        i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
        x += sliceW;
      }
    } else {
      // Gentle idle sine animation
      idleT += 0.03;
      const bins = 128;
      const sw   = W / bins;
      for (let i = 0; i < bins; i++) {
        const phase = (i / bins) * Math.PI * 4;
        const amp2  = playing ? 0 : 4;     // flat when paused but audio ctx exists
        const y     = H / 2 + Math.sin(phase + idleT) * amp2;
        i === 0 ? canvasCtx.moveTo(i * sw, y) : canvasCtx.lineTo(i * sw, y);
      }
    }

    canvasCtx.lineTo(W, H / 2);
    canvasCtx.stroke();
  }

  // ── Play / Pause toggle ────────────────────────────────────────────────────
  async function togglePlay() {
    initAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    if (playing) {
      fadeVolume(audio.volume, 0, 500);
      setTimeout(() => audio.pause(), 520);
      playing = false;
      iconPlay.style.display = '';
      iconEq.style.display   = 'none';
      widget.classList.remove('mp--playing');
      dotEl.classList.remove('mp-dot--active');
    } else {
      audio.volume = 0;
      await audio.play();
      fadeVolume(0, 0.45, 800);   // soft fade-in
      playing = true;
      iconPlay.style.display = 'none';
      iconEq.style.display   = 'flex';
      widget.classList.add('mp--playing');
      dotEl.classList.add('mp-dot--active');
    }
  }

  playBtn.addEventListener('click', togglePlay);

  // ── Start draw loop ────────────────────────────────────────────────────────
  drawWave();

  // ── Cleanup ───────────────────────────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    audio.pause();
    if (ctx) ctx.close();
  });
}
