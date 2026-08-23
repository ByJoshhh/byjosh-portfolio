/**
 * Music Player — floating widget (bottom-right) with waveform visualizer.
 * Uses Web Audio API AnalyserNode to drive a smooth sine-wave canvas animation.
 */
export function initMusicPlayer() {
  // ── Build DOM ──────────────────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'music-player';
  widget.innerHTML = `
    <div class="mp-inner">
      <button class="mp-btn" id="mp-playbtn" aria-label="Play / Pause music">
        <svg class="mp-icon mp-icon--play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="mp-icon mp-icon--pause" viewBox="0 0 24 24" fill="currentColor" style="display:none">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      <div class="mp-viz-wrap">
        <canvas id="mp-canvas" width="120" height="36"></canvas>
        <div class="mp-track">wiv — i love u</div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── Audio setup ────────────────────────────────────────────────────────────
  const audio = new Audio('/wiv-i-love-u.mp3');
  audio.loop = true;
  audio.volume = 0.45;
  audio.preload = 'none'; // don't fetch until user presses play

  let ctx = null;
  let analyser = null;
  let source = null;
  let rafId = null;
  let playing = false;

  const canvas = document.getElementById('mp-canvas');
  const canvasCtx = canvas.getContext('2d');
  const playBtn = document.getElementById('mp-playbtn');
  const iconPlay = playBtn.querySelector('.mp-icon--play');
  const iconPause = playBtn.querySelector('.mp-icon--pause');

  // ── Web Audio initialisation (deferred until first play) ──────────────────
  function initAudioCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;          // 128 usable bins
    analyser.smoothingTimeConstant = 0.82;
    source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
  }

  // ── Waveform drawing loop ──────────────────────────────────────────────────
  function drawWave() {
    rafId = requestAnimationFrame(drawWave);

    const W = canvas.width;
    const H = canvas.height;
    canvasCtx.clearRect(0, 0, W, H);

    if (!analyser) {
      // idle state — draw a flat dim line
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, H / 2);
      canvasCtx.lineTo(W, H / 2);
      canvasCtx.strokeStyle = 'rgba(74,222,128,0.15)';
      canvasCtx.lineWidth = 1.5;
      canvasCtx.stroke();
      return;
    }

    const bufLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);
    analyser.getByteTimeDomainData(dataArr);

    // gradient stroke
    const grad = canvasCtx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0,   'rgba(74,222,128,0.3)');
    grad.addColorStop(0.5, 'rgba(74,222,128,1)');
    grad.addColorStop(1,   'rgba(74,222,128,0.3)');

    canvasCtx.beginPath();
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = grad;
    canvasCtx.shadowColor = '#4ade80';
    canvasCtx.shadowBlur = playing ? 8 : 0;

    const sliceW = W / bufLen;
    let x = 0;

    for (let i = 0; i < bufLen; i++) {
      const v = dataArr[i] / 128.0;        // 0 → 2
      const y = (v * H) / 2;

      if (i === 0) canvasCtx.moveTo(x, y);
      else         canvasCtx.lineTo(x, y);

      x += sliceW;
    }

    canvasCtx.lineTo(W, H / 2);
    canvasCtx.stroke();
  }

  // ── Play / Pause toggle ────────────────────────────────────────────────────
  async function togglePlay() {
    initAudioCtx();

    if (ctx.state === 'suspended') await ctx.resume();

    if (playing) {
      audio.pause();
      playing = false;
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
      widget.classList.remove('mp--playing');
    } else {
      await audio.play();
      playing = true;
      iconPlay.style.display  = 'none';
      iconPause.style.display = '';
      widget.classList.add('mp--playing');
    }
  }

  playBtn.addEventListener('click', togglePlay);

  // ── Start idle animation immediately ──────────────────────────────────────
  drawWave();

  // ── Cleanup on page unload ─────────────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    audio.pause();
    if (ctx) ctx.close();
  });
}
