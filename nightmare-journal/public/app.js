// Nightmare Journal - Haunted Twilight Edition
document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // Core State
  // =========================================================================
  let savedDreams = [];
  let currentDreamId = null;
  let currentGentleStory = '';
  let isScenePaused = false;
  let isReducedMotion = false;

  // Halloween State
  let isSoundActive = false;
  let isFlashlightActive = false;
  let isScaresActive = true;
  let audioCtx = null;
  let masterGain = null;
  let droneGain = null;
  let windGain = null;
  let heartbeatTimer = null;
  let currentBpm = 54;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocity = 0;
  let shadowFigureSide = 'left';

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const dreamTitleInput = document.getElementById('dream-title');
  const dreamDateInput = document.getElementById('dream-date');
  const dreamContentInput = document.getElementById('dream-content');

  const transformBtn = document.getElementById('transform-btn');
  const saveDreamBtn = document.getElementById('save-dream-btn');
  const sampleStoryBtn = document.getElementById('sample-story-btn');
  const clearBtn = document.getElementById('clear-btn');
  const newDreamBtn = document.getElementById('new-dream-btn');
  const retryTransformBtn = document.getElementById('retry-transform-btn');

  const storyPlaceholder = document.getElementById('story-placeholder');
  const storyLoading = document.getElementById('story-loading');
  const storyError = document.getElementById('story-error');
  const errorMessage = document.getElementById('error-message');
  const storyOutput = document.getElementById('story-output');
  const storyText = document.getElementById('story-text');
  const storyActionsHeader = document.getElementById('story-actions-header');
  const copyStoryBtn = document.getElementById('copy-story-btn');
  const saveAllBtn = document.getElementById('save-all-btn');

  // Animated Scene Controls (The Glowing Door)
  const gentleSceneContainer = document.getElementById('gentle-scene-container');
  const sceneTogglePlay = document.getElementById('scene-toggle-play');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const playPauseLabel = document.getElementById('play-pause-label');
  const sceneToggleMotion = document.getElementById('scene-toggle-motion');
  const motionIcon = document.getElementById('motion-icon');
  const motionLabel = document.getElementById('motion-label');

  const dreamsList = document.getElementById('dreams-list');
  const dreamsCount = document.getElementById('dreams-count');
  const searchInput = document.getElementById('search-input');
  const noDreamsMsg = document.getElementById('no-dreams-msg');

  const ollamaBadge = document.getElementById('ollama-badge');
  const ollamaStatusText = document.getElementById('ollama-status-text');
  const refreshOllamaBtn = document.getElementById('refresh-ollama-btn');
  const ollamaNotice = document.getElementById('ollama-notice');
  const toast = document.getElementById('toast');

  // Halloween Elements
  const enterNightmareBtn = document.getElementById('enter-nightmare-btn');
  const nightmareBtnText = document.getElementById('nightmare-btn-text');
  const toggleSoundBtn = document.getElementById('toggle-sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const toggleFlashlightBtn = document.getElementById('toggle-flashlight-btn');
  const flashlightIcon = document.getElementById('flashlight-icon');
  const flashlightLabel = document.getElementById('flashlight-label');
  const toggleScaresBtn = document.getElementById('toggle-scares-btn');
  const scaresIcon = document.getElementById('scares-icon');
  const scaresLabel = document.getElementById('scares-label');
  const flashlightLayer = document.getElementById('flashlight-layer');
  const creepySubtitle = document.getElementById('creepy-subtitle');
  const shadowFigure = document.getElementById('shadow-figure');
  const eyeLeft = document.getElementById('eye-left');
  const eyeRight = document.getElementById('eye-right');
  const pupilLeft = document.getElementById('pupil-left');
  const pupilRight = document.getElementById('pupil-right');
  const jumpscareOverlay = document.getElementById('jumpscare-overlay');
  const fogCanvas = document.getElementById('fog-canvas');
  const ghostsContainer = document.getElementById('ghosts-container');
  const batsContainer = document.getElementById('bats-container');
  const spidersContainer = document.getElementById('spiders-container');

  // =========================================================================
  // Initialize
  // =========================================================================
  initDateInput();
  initSceneAccessibility();
  checkOllamaStatus();
  loadSavedDreams();
  initFogCanvas();
  spawnHalloweenCreatures();
  startAtmosphericTimers();

  // =========================================================================
  // Event Listeners
  // =========================================================================
  transformBtn.addEventListener('click', handleTransform);
  retryTransformBtn.addEventListener('click', handleTransform);
  saveDreamBtn.addEventListener('click', () => handleSave(false));
  saveAllBtn.addEventListener('click', () => handleSave(true));
  if (sampleStoryBtn) sampleStoryBtn.addEventListener('click', loadGlowingDoorSample);
  clearBtn.addEventListener('click', resetEditor);
  newDreamBtn.addEventListener('click', resetEditor);
  copyStoryBtn.addEventListener('click', copyStoryToClipboard);
  refreshOllamaBtn.addEventListener('click', checkOllamaStatus);
  searchInput.addEventListener('input', renderDreamsList);

  if (sceneTogglePlay) sceneTogglePlay.addEventListener('click', toggleScenePlayPause);
  if (sceneToggleMotion) sceneToggleMotion.addEventListener('click', toggleReducedMotion);

  // Halloween Toggles & Triggers
  if (enterNightmareBtn) enterNightmareBtn.addEventListener('click', handleEnterNightmare);
  if (toggleSoundBtn) toggleSoundBtn.addEventListener('click', toggleSound);
  if (toggleFlashlightBtn) toggleFlashlightBtn.addEventListener('click', toggleFlashlight);
  if (toggleScaresBtn) toggleScaresBtn.addEventListener('click', toggleScares);

  // Mouse Tracking: Flashlight, Corner Eyes, Peripheral Shadow & Heartbeat
  window.addEventListener('mousemove', handleGlobalMouseMove);

  // Interactive Button Hover Whispers & Shudder
  setupButtonAudioWhispers();

  function initDateInput() {
    const today = new Date().toISOString().split('T')[0];
    dreamDateInput.value = today;
  }

  function initSceneAccessibility() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      isScaresActive = false;
      if (scaresLabel) scaresLabel.textContent = 'Scares: Off';
    }
  }

  // =========================================================================
  // 1. Web Audio API Engine (100% Offline Synthesized Halloween Ambiance)
  // =========================================================================
  function initAudioEngine() {
    if (audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();

      // Master Gain
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low Ambient Drone (Detuned Dark Sawtooths)
      const droneOsc1 = audioCtx.createOscillator();
      const droneOsc2 = audioCtx.createOscillator();
      droneOsc1.type = 'sawtooth';
      droneOsc2.type = 'sawtooth';
      droneOsc1.frequency.value = 46.0;
      droneOsc2.frequency.value = 49.2; // ~3.2Hz beating frequency for ominous hum

      const droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 110;
      droneFilter.Q.value = 3.5;

      droneGain = audioCtx.createGain();
      droneGain.gain.value = 0.16;

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      // Distant Howling Wind (Filtered Noise Generator with LFO)
      const bufferLength = audioCtx.sampleRate * 3.0;
      const noiseBuffer = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferLength; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.96900 * b2 + white * 0.153;
        data[i] = (b0 + b1 + b2 + white * 0.5) * 0.11;
      }

      const windSource = audioCtx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 420;
      windFilter.Q.value = 3.2;

      // Wind LFO sweeps frequency
      const windLfo = audioCtx.createOscillator();
      windLfo.frequency.value = 0.07;
      const windLfoGain = audioCtx.createGain();
      windLfoGain.gain.value = 260;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      windGain = audioCtx.createGain();
      windGain.gain.value = 0.22;

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      windSource.start();

      // Start Heartbeat Loop
      scheduleHeartbeatLoop();
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  function handleEnterNightmare() {
    initAudioEngine();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    setSoundState(true);
    setFlashlightState(true);

    if (enterNightmareBtn) {
      enterNightmareBtn.classList.add('active');
      nightmareBtnText.textContent = '🩸 In the Nightmare';
    }

    playSpookySwell();
    triggerScreenFlicker();
    showToast('The Nightmare surrounds you... 🕯️', 'error');
  }

  function toggleSound() {
    initAudioEngine();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    setSoundState(!isSoundActive);
  }

  function setSoundState(active) {
    isSoundActive = active;
    if (masterGain && audioCtx) {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.linearRampToValueAtTime(isSoundActive ? 0.85 : 0, now + 0.5);
    }
    if (soundIcon && soundLabel) {
      soundIcon.textContent = isSoundActive ? '🔊' : '🔇';
      soundLabel.textContent = isSoundActive ? 'Audio: Active' : 'Audio: Muted';
    }
    if (toggleSoundBtn) {
      toggleSoundBtn.classList.toggle('active', isSoundActive);
    }
  }

  function toggleFlashlight() {
    setFlashlightState(!isFlashlightActive);
  }

  function setFlashlightState(active) {
    isFlashlightActive = active;
    if (flashlightLayer) {
      flashlightLayer.classList.toggle('hidden', !isFlashlightActive);
    }
    if (flashlightIcon && flashlightLabel) {
      flashlightIcon.textContent = isFlashlightActive ? '🔦' : '🕯️';
      flashlightLabel.textContent = isFlashlightActive ? 'Flashlight: On' : 'Flashlight: Off';
    }
    if (toggleFlashlightBtn) {
      toggleFlashlightBtn.classList.toggle('active', isFlashlightActive);
    }
  }

  function toggleScares() {
    isScaresActive = !isScaresActive;
    if (scaresLabel) {
      scaresLabel.textContent = isScaresActive ? 'Scares: On' : 'Scares: Off';
    }
    if (toggleScaresBtn) {
      toggleScaresBtn.classList.toggle('active', isScaresActive);
    }
    showToast(isScaresActive ? 'Subtle scares enabled 👻' : 'Scares disabled 🕊️', 'success');
  }

  // Heartbeat Synthesizer (Speed accelerates as mouse moves around!)
  function scheduleHeartbeatLoop() {
    if (!audioCtx) return;

    function beat() {
      if (isSoundActive && masterGain.gain.value > 0.05) {
        playHeartbeatSound();
      }

      // Smooth decay of mouse speed -> BPM
      if (mouseVelocity > 2) {
        currentBpm = Math.min(130, currentBpm + mouseVelocity * 0.4);
        mouseVelocity *= 0.82;
      } else {
        currentBpm = Math.max(52, currentBpm - 0.7);
      }

      const intervalMs = (60 / currentBpm) * 1000;
      heartbeatTimer = setTimeout(beat, intervalMs);
    }

    beat();
  }

  function playHeartbeatSound() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // Thump 1 ("Lub")
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(68, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.1);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.45, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Thump 2 ("Dub") 140ms later
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(58, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(26, now + 0.22);

      gain2.gain.setValueAtTime(0, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.155);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.25);
    } catch (e) {}
  }

  function playSpookySwell() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(65, now + 2.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(650, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(120, now + 2.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch (e) {}
  }

  function playSpookyWhisper() {
    if (!audioCtx || !isSoundActive) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      osc.frequency.linearRampToValueAtTime(260 + Math.random() * 60, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  function playJumpScareSound() {
    if (!audioCtx || !isSoundActive) return;
    try {
      const now = audioCtx.currentTime;
      // Dissonant sharp chord + gasp
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      osc2.frequency.setValueAtTime(466.16, now); // Minor second dissonance
      osc2.frequency.exponentialRampToValueAtTime(116, now + 0.2);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch (e) {}
  }

  function setupButtonAudioWhispers() {
    const clickableElements = document.querySelectorAll('.btn, .btn-secondary, .btn-primary, .btn-magic, .spooky-ctrl-btn, .dream-item');
    clickableElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        playSpookyWhisper();
      });
    });
  }

  // =========================================================================
  // 2. Mouse Tracking: Flashlight, Corner Demon Eyes, Peripheral Shadow & Heartbeat
  // =========================================================================
  function handleGlobalMouseMove(e) {
    const mx = e.clientX;
    const my = e.clientY;

    // A. Flashlight Coordinate Updates
    if (flashlightLayer) {
      flashlightLayer.style.setProperty('--mouse-x', `${mx}px`);
      flashlightLayer.style.setProperty('--mouse-y', `${my}px`);
    }

    // B. Mouse Speed for Heartbeat Acceleration
    const dist = Math.hypot(mx - lastMouseX, my - lastMouseY);
    mouseVelocity = Math.min(25, mouseVelocity + dist * 0.12);
    lastMouseX = mx;
    lastMouseY = my;

    // C. Corner Glowing Demon Eyes Look at Cursor
    if (eyeLeft && pupilLeft && pupilRight) {
      const rect = eyeLeft.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const angle = Math.atan2(my - eyeCenterY, mx - eyeCenterX);
      const pupilDist = Math.min(4.5, Math.hypot(mx - eyeCenterX, my - eyeCenterY) / 60);

      const px = Math.cos(angle) * pupilDist;
      const py = Math.sin(angle) * pupilDist;
      pupilLeft.style.transform = `translate(${px}px, ${py}px)`;
      pupilRight.style.transform = `translate(${px}px, ${py}px)`;
    }

    // D. Shadowy Peripheral Figure (Vanishes when cursor looks toward it)
    if (shadowFigure && !shadowFigure.classList.contains('hidden')) {
      if (shadowFigureSide === 'left' && mx < 260) {
        shadowFigure.classList.add('vanish');
        playSpookyWhisper();
      } else if (shadowFigureSide === 'right' && (window.innerWidth - mx) < 260) {
        shadowFigure.classList.add('vanish');
        playSpookyWhisper();
      }
    }
  }

  // =========================================================================
  // 3. Faint Drifting Mist / Fog Canvas
  // =========================================================================
  function initFogCanvas() {
    if (!fogCanvas) return;
    const ctx = fogCanvas.getContext('2d');
    let width = (fogCanvas.width = window.innerWidth);
    let height = (fogCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = fogCanvas.width = window.innerWidth;
      height = fogCanvas.height = window.innerHeight;
    });

    const clouds = [];
    const cloudCount = 14;
    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 130 + Math.random() * 160,
        vx: 0.18 + Math.random() * 0.32,
        vy: (Math.random() - 0.5) * 0.08,
        alpha: 0.035 + Math.random() * 0.045
      });
    }

    function renderFog() {
      if (isReducedMotion) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += c.vx;
        c.y += c.vy;

        if (c.x - c.radius > width) c.x = -c.radius;
        if (c.y - c.radius > height) c.y = -c.radius;
        if (c.y + c.radius < 0) c.y = height + c.radius;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        grad.addColorStop(0, `rgba(180, 190, 210, ${c.alpha})`);
        grad.addColorStop(0.5, `rgba(150, 160, 180, ${c.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(150, 160, 180, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(renderFog);
    }

    renderFog();
  }

  // =========================================================================
  // 4. Ghosts, Bats & Spiders Generator
  // =========================================================================
  function spawnHalloweenCreatures() {
    // 3 Floating Translucent Ghosts
    if (ghostsContainer) {
      const ghostConfigs = [
        { top: '18%', duration: '22s', delay: '0s', size: 68 },
        { top: '48%', duration: '30s', delay: '7s', size: 82 },
        { top: '74%', duration: '26s', delay: '14s', size: 58 }
      ];

      ghostConfigs.forEach(cfg => {
        const g = document.createElement('div');
        g.className = 'floating-ghost';
        g.style.top = cfg.top;
        g.style.animationDuration = cfg.duration;
        g.style.animationDelay = cfg.delay;
        g.style.width = `${cfg.size}px`;
        g.style.height = `${cfg.size * 1.25}px`;

        g.innerHTML = `
          <svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                <stop offset="65%" stop-color="#93c5fd" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M30,5 C15,5 8,22 8,42 C8,58 12,65 18,60 C24,55 26,68 32,60 C38,54 44,68 48,60 C52,54 52,38 52,42 C52,22 45,5 30,5 Z" fill="url(#ghostGrad)" />
            <ellipse cx="22" cy="28" rx="3.5" ry="5.5" fill="#030712" />
            <ellipse cx="38" cy="28" rx="3.5" ry="5.5" fill="#030712" />
            <ellipse cx="30" cy="40" rx="4.5" ry="7" fill="#030712" />
          </svg>
        `;
        ghostsContainer.appendChild(g);
      });
    }

    // Dropping Spiders
    if (spidersContainer) {
      const spiderPositions = ['14%', '42%', '78%'];
      spiderPositions.forEach((leftPos, idx) => {
        const s = document.createElement('div');
        s.className = 'dropping-spider';
        s.style.left = leftPos;
        s.style.animationDelay = `${idx * 4.5}s`;
        s.style.animationDuration = `${11 + idx * 3}s`;

        s.innerHTML = `
          <svg viewBox="0 0 32 160" width="32" height="160" xmlns="http://www.w3.org/2000/svg">
            <!-- Silk Thread -->
            <line x1="16" y1="0" x2="16" y2="128" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
            <!-- Spider Body -->
            <g transform="translate(16, 138)">
              <!-- Legs -->
              <path d="M-4,-2 C-12,-8 -14,-14 -10,-18" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <path d="M-5,1 C-14,0 -16,-6 -14,-10" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <path d="M-4,4 C-14,6 -15,12 -12,16" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <path d="M4,-2 C12,-8 14,-14 10,-18" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <path d="M5,1 C14,0 16,-6 14,-10" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <path d="M4,4 C14,6 15,12 12,16" stroke="#1f0307" stroke-width="1.2" fill="none" />
              <!-- Abdomen & Head -->
              <ellipse cx="0" cy="5" rx="5.5" ry="7" fill="#140204" stroke="#7f1d1d" stroke-width="0.8" />
              <circle cx="0" cy="-3" r="3.5" fill="#1e0508" />
              <!-- Red Skull Mark on Back -->
              <circle cx="-1.5" cy="4" r="0.8" fill="#ff2222" />
              <circle cx="1.5" cy="4" r="0.8" fill="#ff2222" />
            </g>
          </svg>
        `;
        spidersContainer.appendChild(s);
      });
    }

    // Flying Bats
    if (batsContainer) {
      const spawnBat = () => {
        if (isReducedMotion) return;
        const bat = document.createElement('div');
        bat.className = 'flying-bat';
        bat.style.top = `${15 + Math.random() * 55}%`;
        bat.style.animationDuration = `${9 + Math.random() * 6}s`;

        bat.innerHTML = `
          <svg viewBox="0 0 44 26" xmlns="http://www.w3.org/2000/svg">
            <path d="M22,12 C18,7 10,4 2,10 C4,16 12,16 16,22 C18,17 20,15 22,16 C24,15 26,17 28,22 C32,16 40,16 42,10 C34,4 26,7 22,12 Z" fill="#09020b" stroke="#3b070d" stroke-width="0.8" />
            <circle cx="20.5" cy="13" r="0.8" fill="#ef4444" />
            <circle cx="23.5" cy="13" r="0.8" fill="#ef4444" />
          </svg>
        `;

        batsContainer.appendChild(bat);
        bat.addEventListener('animationend', () => bat.remove());
      };

      setInterval(spawnBat, 16000);
      setTimeout(spawnBat, 3500);
    }
  }

  // =========================================================================
  // 5. Scares & Atmospheric Timers (Glitching Text, Flickers, Peripheral Shadow)
  // =========================================================================
  function startAtmosphericTimers() {
    // A. Peripheral Shadowy Figure (Appears at edge, vanishes on mouse look)
    setInterval(() => {
      if (!shadowFigure || isReducedMotion) return;
      shadowFigureSide = Math.random() > 0.5 ? 'right' : 'left';
      shadowFigure.className = `shadow-figure ${shadowFigureSide === 'right' ? 'at-right' : ''}`;
      shadowFigure.classList.remove('hidden', 'vanish');

      // Auto fade after 7s if unnoticed
      setTimeout(() => {
        if (shadowFigure) shadowFigure.classList.add('vanish');
      }, 7000);
    }, 28000);

    // B. Flickering Lights (Brownouts)
    setInterval(() => {
      if (isReducedMotion) return;
      triggerScreenFlicker();
    }, 22000);

    // C. Creepy Text Glitches
    const eeriePhrases = [
      "BEHIND YOU...",
      "WAKE UP...",
      "IT'S WATCHING YOU...",
      "DON'T TURN AROUND...",
      "THE SHADOWS ARE HUNGRY...",
      "CAN YOU HEAR THEM?"
    ];

    setInterval(() => {
      if (!creepySubtitle || isReducedMotion) return;
      const originalText = "Transform terrifying nightmares into gentle, peaceful stories with local AI";
      const randomPhrase = eeriePhrases[Math.floor(Math.random() * eeriePhrases.length)];

      creepySubtitle.textContent = randomPhrase;
      creepySubtitle.classList.add('glitched');

      setTimeout(() => {
        creepySubtitle.textContent = originalText;
        creepySubtitle.classList.remove('glitched');
      }, 1600);
    }, 26000);

    // D. Subtle Jump-Scare (Rare: > 75s, under 0.3s duration!)
    setInterval(() => {
      if (!isScaresActive || isReducedMotion) return;
      triggerJumpScare();
    }, 85000);
  }

  function triggerScreenFlicker() {
    document.body.classList.add('screen-flicker');
    setTimeout(() => {
      document.body.classList.remove('screen-flicker');
    }, 280);
  }

  function triggerJumpScare() {
    if (!jumpscareOverlay || isReducedMotion) return;

    // Render grotesque face SVG inside jumpscare overlay
    jumpscareOverlay.innerHTML = `
      <div class="jumpscare-face">
        <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="150" cy="180" rx="120" ry="155" fill="#040106" stroke="#b91c1c" stroke-width="4" />
          <!-- Sunken Hollow Eyes with Piercing Blood Red Glare -->
          <ellipse cx="105" cy="140" rx="28" ry="36" fill="#000000" stroke="#ff0000" stroke-width="3" />
          <ellipse cx="195" cy="140" rx="28" ry="36" fill="#000000" stroke="#ff0000" stroke-width="3" />
          <circle cx="105" cy="140" r="9" fill="#ff1a1a" />
          <circle cx="195" cy="140" r="9" fill="#ff1a1a" />
          <circle cx="103" cy="138" r="3" fill="#ffffff" />
          <circle cx="193" cy="138" r="3" fill="#ffffff" />
          <!-- Hollow Agonized Screaming Mouth -->
          <ellipse cx="150" cy="265" rx="42" ry="62" fill="#000000" stroke="#7f1d1d" stroke-width="5" />
          <path d="M118,245 Q150,230 182,245" stroke="#ef4444" stroke-width="3" fill="none" />
          <polygon points="125,235 130,245 135,235" fill="#ffffff" />
          <polygon points="140,232 145,244 150,232" fill="#ffffff" />
          <polygon points="155,232 160,244 165,232" fill="#ffffff" />
          <polygon points="170,235 175,245 180,235" fill="#ffffff" />
        </svg>
      </div>
    `;

    jumpscareOverlay.classList.remove('hidden');
    playJumpScareSound();

    // Must be under 0.3s! Flash duration: 220ms
    setTimeout(() => {
      jumpscareOverlay.classList.add('hidden');
      jumpscareOverlay.innerHTML = '';
    }, 220);
  }

  // =========================================================================
  // 6. Existing Core Features: Saving, Transforming & Managing Dreams
  // =========================================================================

  // Animated Scene: Play / Pause Control
  function toggleScenePlayPause() {
    isScenePaused = !isScenePaused;
    if (gentleSceneContainer) {
      gentleSceneContainer.classList.toggle('is-paused', isScenePaused);
    }
    if (playPauseIcon && playPauseLabel) {
      playPauseIcon.textContent = isScenePaused ? '▶' : '⏸';
      playPauseLabel.textContent = isScenePaused ? 'Play' : 'Pause';
    }
    showToast(isScenePaused ? 'Animation paused ⏸' : 'Animation playing ▶', 'success');
  }

  // Animated Scene: Reduced Motion Accessibility Toggle
  function toggleReducedMotion() {
    setReducedMotion(!isReducedMotion);
    showToast(isReducedMotion ? 'Reduced motion enabled ♿' : 'Reduced motion disabled', 'success');
  }

  function setReducedMotion(enable) {
    isReducedMotion = enable;
    if (gentleSceneContainer) {
      gentleSceneContainer.classList.toggle('reduced-motion', isReducedMotion);
    }
    if (motionLabel) {
      motionLabel.textContent = isReducedMotion ? 'Reduced Motion: On' : 'Reduced Motion: Off';
    }
    if (isReducedMotion) {
      isScaresActive = false;
      if (scaresLabel) scaresLabel.textContent = 'Scares: Off';
    }
  }

  // Trigger Owl Entrance Animation on New Story
  function triggerOwlAppearance() {
    const owl = document.getElementById('scene-owl');
    if (!owl || isReducedMotion) return;
    owl.style.animation = 'none';
    void owl.offsetWidth; // Force DOM reflow
    owl.style.animation = '';
  }

  // Sample: The Glowing Door Story Preset
  function loadGlowingDoorSample() {
    dreamTitleInput.value = 'The Glowing Door in the Misty Woods';
    initDateInput();
    dreamContentInput.value =
      'I was wandering through a dense, foggy forest at night. The mist was cold and disorienting, and strange shadows flickered behind the trees. Just as I felt completely lost and anxious, I noticed a gentle amber glow shining between the mossy roots of an ancient tree. Carved right into the trunk was a small arched wooden door radiating cozy golden light...';

    currentGentleStory =
      'As the cold mist brushed against the mossy ground, the eerie quiet of the forest transformed into a soft, sheltering stillness. Deep in the heart of the woods, nestled in the welcoming trunk of an ancient oak, a little arched door shone with the warm, reassuring amber glow of a cheerful hearth.\n\nOn a sturdy branch overhead, a friendly little owl with luminous golden eyes blinked softly and gave a quiet, comforting hoot of welcome. All the chill and shadows dissolved in the gentle light spilling onto the forest floor, guiding you into a peaceful, enchanted sanctuary where you could finally rest safely and warmly.';

    storyText.textContent = currentGentleStory;
    storyPlaceholder.classList.add('hidden');
    storyLoading.classList.add('hidden');
    storyError.classList.add('hidden');
    storyOutput.classList.remove('hidden');
    storyActionsHeader.style.display = 'flex';

    triggerOwlAppearance();
    showToast('Loaded "Glowing Door" sample story & animated scene! ✨', 'success');
  }

  // Toast Notification
  let toastTimeout;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }

  // Ollama Status Check
  async function checkOllamaStatus() {
    ollamaBadge.className = 'status-badge status-checking';
    ollamaStatusText.textContent = 'Checking Ollama...';

    try {
      const res = await fetch('/api/ollama-status');
      const data = await res.json();

      if (data.online) {
        if (data.modelFound) {
          ollamaBadge.className = 'status-badge status-online';
          ollamaStatusText.textContent = 'Ollama & gemma4:e2b Ready';
          ollamaNotice.classList.add('hidden');
        } else {
          ollamaBadge.className = 'status-badge status-offline';
          ollamaStatusText.textContent = 'Ollama Online (Model missing)';
          ollamaNotice.innerHTML = `⚠️ Ollama is online, but <code>gemma4:e2b</code> was not found. Run <code>ollama pull gemma4:e2b</code> in your terminal.`;
          ollamaNotice.classList.remove('hidden');
        }
      } else {
        ollamaBadge.className = 'status-badge status-offline';
        ollamaStatusText.textContent = 'Ollama Offline';
        ollamaNotice.innerHTML = `⚠️ <strong>Ollama is not running</strong> at <code>http://localhost:11434</code>. Start Ollama and run <code>ollama run gemma4:e2b</code>.`;
        ollamaNotice.classList.remove('hidden');
      }
    } catch (err) {
      ollamaBadge.className = 'status-badge status-offline';
      ollamaStatusText.textContent = 'Ollama Offline';
      ollamaNotice.classList.remove('hidden');
    }
  }

  // Load Saved Dreams from Backend
  async function loadSavedDreams() {
    try {
      const res = await fetch('/api/dreams');
      if (!res.ok) throw new Error('Failed to load dreams');
      savedDreams = await res.json();
      renderDreamsList();
    } catch (err) {
      console.error(err);
      showToast('Could not load saved dreams', 'error');
    }
  }

  // Render Saved Dreams in Sidebar
  function renderDreamsList() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = savedDreams.filter(d => {
      const title = (d.title || '').toLowerCase();
      const dream = (d.dream || '').toLowerCase();
      const story = (d.gentleStory || '').toLowerCase();
      return title.includes(query) || dream.includes(query) || story.includes(query);
    });

    dreamsCount.textContent = savedDreams.length;
    dreamsList.innerHTML = '';

    if (filtered.length === 0) {
      noDreamsMsg.classList.remove('hidden');
      if (query) {
        noDreamsMsg.querySelector('p').textContent = 'No matching dreams found.';
        noDreamsMsg.querySelector('.subtext').textContent = 'Try another search term.';
      } else {
        noDreamsMsg.querySelector('p').textContent = 'No saved dreams yet.';
        noDreamsMsg.querySelector('.subtext').textContent = 'Type a dream and click "Save Dream" to store it here.';
      }
      return;
    }

    noDreamsMsg.classList.add('hidden');

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = `dream-item ${item.id === currentDreamId ? 'active' : ''}`;
      el.dataset.id = item.id;

      const dateStr = item.date ? item.date.split('T')[0] : 'No date';
      const hasStory = Boolean(item.gentleStory && item.gentleStory.trim());

      el.innerHTML = `
        <div class="dream-item-top">
          <div class="dream-item-title" title="${escapeHtml(item.title || 'Untitled')}">${escapeHtml(item.title || 'Untitled')}</div>
          <span class="dream-item-date">${escapeHtml(dateStr)}</span>
        </div>
        <div class="dream-item-snippet">${escapeHtml(item.dream || '')}</div>
        <div class="dream-item-footer">
          ${hasStory ? '<span class="tag-gentle">✨ Gentle Story</span>' : '<span class="tag-plain">📝 Dream only</span>'}
          <button class="btn-delete-item" title="Delete this dream">🗑️</button>
        </div>
      `;

      el.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-item')) return;
        selectDream(item);
      });

      const deleteBtn = el.querySelector('.btn-delete-item');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDelete(item.id, item.title);
      });

      dreamsList.appendChild(el);
    });

    setupButtonAudioWhispers();
  }

  // Select and Populate Dream
  function selectDream(item) {
    currentDreamId = item.id;
    dreamTitleInput.value = item.title || '';
    dreamDateInput.value = item.date ? item.date.split('T')[0] : '';
    dreamContentInput.value = item.dream || '';

    currentGentleStory = item.gentleStory || '';
    if (currentGentleStory) {
      storyText.textContent = currentGentleStory;
      storyPlaceholder.classList.add('hidden');
      storyLoading.classList.add('hidden');
      storyError.classList.add('hidden');
      storyOutput.classList.remove('hidden');
      storyActionsHeader.style.display = 'flex';
      triggerOwlAppearance();
    } else {
      storyPlaceholder.classList.remove('hidden');
      storyLoading.classList.add('hidden');
      storyError.classList.add('hidden');
      storyOutput.classList.add('hidden');
      storyActionsHeader.style.display = 'none';
    }

    renderDreamsList();
  }

  // Save Dream (Create or Update)
  async function handleSave(includeStory = false) {
    const dream = dreamContentInput.value.trim();
    if (!dream) {
      showToast('Please type your dream before saving.', 'error');
      dreamContentInput.focus();
      return;
    }

    let title = dreamTitleInput.value.trim();
    if (!title) {
      const dateVal = dreamDateInput.value || 'Recent';
      title = `Nightmare on ${dateVal}`;
      dreamTitleInput.value = title;
    }

    const payload = {
      title,
      date: dreamDateInput.value || new Date().toISOString().split('T')[0],
      dream,
      gentleStory: currentGentleStory || ''
    };

    try {
      saveDreamBtn.disabled = true;
      saveAllBtn.disabled = true;

      const url = currentDreamId ? `/api/dreams/${currentDreamId}` : '/api/dreams';
      const method = currentDreamId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save dream');
      }

      currentDreamId = data.entry.id;
      showToast('Bound to this computer forever 📜🩸', 'success');

      await loadSavedDreams();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving dream', 'error');
    } finally {
      saveDreamBtn.disabled = false;
      saveAllBtn.disabled = false;
    }
  }

  // Delete Dream
  async function handleDelete(id, title) {
    const confirmed = confirm(`Are you sure you want to banish "${title || 'this dream'}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/dreams/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Dream banished to the void 💀', 'success');
      if (currentDreamId === id) {
        resetEditor();
      }
      await loadSavedDreams();
    } catch (err) {
      showToast(err.message || 'Error deleting dream', 'error');
    }
  }

  // Transform with Local Ollama gemma4:e2b
  async function handleTransform() {
    const dream = dreamContentInput.value.trim();
    if (!dream) {
      showToast('Please type a dream to transform.', 'error');
      dreamContentInput.focus();
      return;
    }

    transformBtn.disabled = true;
    retryTransformBtn.disabled = true;
    storyPlaceholder.classList.add('hidden');
    storyError.classList.add('hidden');
    storyOutput.classList.add('hidden');
    storyActionsHeader.style.display = 'none';
    storyLoading.classList.remove('hidden');

    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to transform dream with local Ollama.');
      }

      currentGentleStory = data.story;
      storyText.textContent = currentGentleStory;

      storyLoading.classList.add('hidden');
      storyOutput.classList.remove('hidden');
      storyActionsHeader.style.display = 'flex';
      triggerOwlAppearance();

      showToast('Transformed into a gentle story! ✨', 'success');

      if (currentDreamId) {
        await handleSave(true);
      }
    } catch (err) {
      console.error(err);
      storyLoading.classList.add('hidden');
      errorMessage.textContent = err.message || 'An error occurred while communicating with Ollama.';
      storyError.classList.remove('hidden');
      showToast('Could not transform dream', 'error');
      checkOllamaStatus();
    } finally {
      transformBtn.disabled = false;
      retryTransformBtn.disabled = false;
    }
  }

  // Reset Editor
  function resetEditor() {
    currentDreamId = null;
    currentGentleStory = '';
    dreamTitleInput.value = '';
    initDateInput();
    dreamContentInput.value = '';

    storyPlaceholder.classList.remove('hidden');
    storyLoading.classList.add('hidden');
    storyError.classList.add('hidden');
    storyOutput.classList.add('hidden');
    storyActionsHeader.style.display = 'none';

    renderDreamsList();
    dreamContentInput.focus();
  }

  // Copy Story to Clipboard
  function copyStoryToClipboard() {
    if (!currentGentleStory) return;
    navigator.clipboard.writeText(currentGentleStory)
      .then(() => showToast('Gentle story copied to clipboard! 📋', 'success'))
      .catch(() => showToast('Failed to copy story', 'error'));
  }

  // Utility: Escape HTML
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
