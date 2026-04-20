'use strict';

// ── QR Gift Mode: hide dino scene immediately before anything runs ──
if (window.QR_GIFT_MODE) {
  (function () {
    const dino = document.getElementById('scene-dino');
    if (dino) { dino.style.display = 'none'; dino.style.pointerEvents = 'none'; }
    document.body.classList.remove('dino-active');
  })();
}

// =============================================
// SWIPER FULLPAGE — Init (runs after DOM ready)
// =============================================
let swiper; // global reference used by triggerWarp

function initSwiper() {
  swiper = new Swiper('#fullpage-swiper', {
    direction: 'vertical',
    speed: 900,
    effect: 'slide',

    // Mousewheel with edge sensitivity
    mousewheel: {
      enabled: true,
      thresholdDelta: 30,
      sensitivity: 1,
      releaseOnEdges: false,
    },

    // Keyboard navigation
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    // Touch / swipe
    touchAngle: 45,
    longSwipesMs: 200,
    longSwipesRatio: 0.1,
    touchStartPreventDefault: false,

    pagination: false,
    navigation: false,

    on: {
      init(sw) {
        updateNavDots(sw.activeIndex);
        updateProgressBar(sw.activeIndex, sw.slides.length);
        revealSlideElements(sw.slides[sw.activeIndex]);
      },
      slideChange(sw) {
        updateNavDots(sw.activeIndex);
        updateProgressBar(sw.activeIndex, sw.slides.length);
        revealSlideElements(sw.slides[sw.activeIndex]);

        // Hide petal canvas on galaxy slide (it would overlay Three.js)
        const petalCanvas = document.getElementById('petal-canvas');
        if (petalCanvas) petalCanvas.style.opacity = sw.activeIndex === 2 ? '0' : '';

        // Galaxy slide (index 2) — lazy init + pause/resume Three.js
        if (sw.activeIndex === 2) {
          initGalaxyScene();
          if (typeof _galaxyStart === 'function') _galaxyStart();
        } else {
          if (typeof _galaxyStop === 'function') _galaxyStop();
        }

        // Garden slide (index 3) — lazy init
        if (sw.activeIndex === 3) initGarden();

        // Finale — check via data-scene-index (finale = scene 10)
        const activeSlide = sw.slides[sw.activeIndex];
        const sceneIdx = activeSlide ? parseInt(activeSlide.dataset.sceneIndex || 0) : 0;
        if (sceneIdx === 10 && !fwRunning) {
          startFireworks();
        }
      },
    },
  });

  // Handle mousewheel for internally-scrollable slides
  document.querySelectorAll('.slide-scrollable').forEach(slide => {
    slide.addEventListener('wheel', (e) => {
      const atTop = slide.scrollTop <= 1;
      const atBottom = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
      const goingUp = e.deltaY < 0;
      const goingDown = e.deltaY > 0;

      if ((goingUp && atTop) || (goingDown && atBottom)) {
        // At the edge — let Swiper handle slide change
        return;
      }
      // Not at edge — stop event so slide scrolls internally
      e.stopPropagation();
    }, { passive: true });
  });
}

// Update progress bar based on slide index
function updateProgressBar(idx, total) {
  const pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
}

// Update sidebar nav dots
function updateNavDots(activeIdx) {
  // Read data-scene-index from the active swiper slide to find correct dot
  const slides = document.querySelectorAll('#fullpage-swiper .swiper-slide');
  const activeSlide = slides[activeIdx];
  const activeSceneIdx = activeSlide ? parseInt(activeSlide.dataset.sceneIndex || 0) : activeIdx + 1;

  document.querySelectorAll('.nav-dot').forEach(d => {
    const sceneIdx = parseInt(d.dataset.scene);
    if (sceneIdx === 0) return; // dino dot — skip
    d.classList.toggle('active', sceneIdx === activeSceneIdx);
  });
}

// Trigger reveal animations inside a newly-active slide
function revealSlideElements(slideEl) {
  if (!slideEl) return;
  slideEl.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// Sidebar nav dot click handlers
function initNavDots() {
  document.querySelectorAll('.nav-dot').forEach(d => {
    d.addEventListener('click', () => {
      const sceneIdx = parseInt(d.dataset.scene);
      if (sceneIdx === 0) {
        location.reload();
        return;
      }
      if (swiper) swiper.slideTo(sceneIdx - 1);
    });
  });
}

// Slide arrow buttons
function initArrowButtons() {
  const prevBtn = document.getElementById('slide-prev-btn');
  const nextBtn = document.getElementById('slide-next-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => swiper && swiper.slidePrev());
  if (nextBtn) nextBtn.addEventListener('click', () => swiper && swiper.slideNext());
}

// =============================================
// CUSTOM CURSOR
// =============================================
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  const t = document.createElement('div');
  t.className = 'cursor-trail';
  t.style.left = e.clientX + 'px';
  t.style.top = e.clientY + 'px';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 600);
});

// =============================================
// PETAL CANVAS (global floating petals)
// =============================================
(function () {
  const canvas = document.getElementById('petal-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 30; i++) {
    petals.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFB3C6';
      ctx.fill();
      ctx.restore();
      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;
      if (p.y > innerHeight + 20) { p.y = -20; p.x = Math.random() * innerWidth; }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// =============================================
// CONFETTI
// =============================================
const confCanvas = document.getElementById('confetti-canvas');
const confCtx = confCanvas.getContext('2d');
let confParticles = [];
let confRunning = false;

function launchConfetti() {
  confCanvas.style.display = 'block';
  confCanvas.width = innerWidth;
  confCanvas.height = innerHeight;
  confParticles = [];
  for (let i = 0; i < 120; i++) {
    confParticles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight - innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      color: ['#FFB3C6', '#FF8FAB', '#F7D794', '#E8637A', '#fff'][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
    });
  }
  confRunning = true;
  animConf();
  setTimeout(() => { confRunning = false; confCanvas.style.display = 'none'; }, 4000);
}

function animConf() {
  if (!confRunning) return;
  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  confParticles.forEach(p => {
    confCtx.save();
    confCtx.translate(p.x, p.y);
    confCtx.rotate(p.rot);
    confCtx.fillStyle = p.color;
    confCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    confCtx.restore();
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpeed;
  });
  requestAnimationFrame(animConf);
}

// =============================================
// SCENE 0 — DINO GAME
// =============================================
(function () {
  // Skip dino entirely in QR gift mode
  if (window.QR_GIFT_MODE) return;

  const canvas = document.getElementById('dino-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const GROUND = H - 20;
  let score = 0, hiScore = 0, speed = 4, frame = 0;
  let gameState = 'idle'; // idle, running, dead, milestone
  let dinoY = GROUND, dinoVy = 0, jumping = false;
  let obstacles = [], clouds = [], milestoneTriggered = false;
  let cakeX = -1, cakeShowing = false;
  const DINO_X = 80, DINO_W = 36, DINO_H = 42;
  const GROUND_Y = GROUND;

  function resetGame() {
    score = 0; speed = 4; frame = 0;
    dinoY = GROUND_Y; dinoVy = 0; jumping = false;
    obstacles = []; milestoneTriggered = false;
    cakeX = -1; cakeShowing = false;
    gameState = 'running';
    document.getElementById('dino-msg').textContent = '';
    loop();
  }

  function jump() {
    if (gameState === 'idle') { resetGame(); return; }
    if (gameState === 'dead') { setTimeout(resetGame, 300); return; }
    if (gameState === 'milestone' && cakeShowing) return;
    if (!jumping && dinoY >= GROUND_Y) {
      dinoVy = -14; jumping = true;
    }
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      // Only jump if dino screen is active
      if (document.getElementById('scene-dino').style.display !== 'none') {
        e.preventDefault();
        jump();
      }
    }
  });
  canvas.addEventListener('click', jump);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); });

  function drawDino(y, isDead) {
    ctx.fillStyle = '#535353';
    ctx.fillRect(DINO_X, y - DINO_H, DINO_W, DINO_H - 10);
    ctx.fillRect(DINO_X + 16, y - DINO_H - 12, 20, 16);
    ctx.fillStyle = isDead ? '#e33' : '#fff';
    ctx.fillRect(DINO_X + 30, y - DINO_H - 8, 4, 4);
    ctx.fillStyle = '#535353';
    const legOffset = (frame % 12 < 6 && !isDead) ? 0 : 6;
    ctx.fillRect(DINO_X + 4, y - 12, 8, 12 - legOffset);
    ctx.fillRect(DINO_X + 16, y - 12, 8, 12 + legOffset - 6);
  }

  function drawCactus(x, y) {
    ctx.fillStyle = '#535353';
    ctx.fillRect(x, y - 50, 12, 50);
    ctx.fillRect(x - 12, y - 32, 12, 8);
    ctx.fillRect(x + 12, y - 40, 12, 8);
  }

  function drawCake(x, y) {
    ctx.fillStyle = '#FFB3C6';
    ctx.fillRect(x, y - 40, 50, 40);
    ctx.fillStyle = '#FF8FAB';
    ctx.fillRect(x, y - 54, 50, 16);
    ctx.fillStyle = '#FFF8F9';
    ctx.font = 'bold 14px Space Mono';
    ctx.fillText('22', x + 15, y - 40);
    if (cakeShowing) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#FF8FAB';
        ctx.fillRect(x + 8 + i * 14, y - 68, 5, 14);
        ctx.fillStyle = '#FFD600';
        ctx.beginPath();
        ctx.arc(x + 10 + i * 14, y - 70, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawCloud(x, y) {
    ctx.fillStyle = 'rgba(180,180,180,0.4)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 6, 18, 0, Math.PI * 2);
    ctx.arc(x + 36, y, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  function spawnObstacle() {
    obstacles.push({ x: W + 20, type: 'cactus' });
  }

  function fmtScore(n) { return String(Math.floor(n)).padStart(5, '0'); }

  function checkCollision(ox, ow, oh, oy) {
    const dx = Math.abs((DINO_X + DINO_W / 2) - (ox + ow / 2));
    const dy = Math.abs((dinoY - DINO_H / 2) - (oy - oh / 2));
    return dx < (DINO_W / 2 + ow / 2 - 6) && dy < (DINO_H / 2 + oh / 2 - 6);
  }

  let animId;
  function loop() {
    if (gameState !== 'running' && gameState !== 'milestone') return;
    cancelAnimationFrame(animId);
    frame++;

    dinoVy += 0.7;
    dinoY += dinoVy;
    if (dinoY >= GROUND_Y) { dinoY = GROUND_Y; dinoVy = 0; jumping = false; }

    if (gameState === 'running') {
      score += 0.1 * (speed / 4);
      speed = 4 + Math.floor(score / 50) * 0.4;
    }

    // Milestone at 105 (01/05)
    if (!milestoneTriggered && Math.floor(score) >= 105) {
      milestoneTriggered = true;
      gameState = 'milestone';
      cakeX = W + 20;
      cakeShowing = true;
      document.getElementById('dino-msg').textContent = '✨ Thổi nến đi em... 🕯️  [Click vào bánh]';
    }

    if (gameState === 'running') {
      const lastX = obstacles.length ? obstacles[obstacles.length - 1].x : 0;
      if (obstacles.length === 0 || (W - lastX > 180 + Math.random() * 160)) {
        spawnObstacle();
      }
    }

    if (frame % 80 === 0) clouds.push({ x: W + 50, y: 30 + Math.random() * 40 });
    clouds.forEach(c => c.x -= speed * 0.4);
    clouds = clouds.filter(c => c.x > -100);

    obstacles.forEach(o => { o.x -= speed; });

    if (gameState === 'milestone' && cakeX > 0) {
      cakeX -= 1;
    }

    if (gameState === 'running') {
      for (const o of obstacles) {
        if (o.x < DINO_X + DINO_W - 10 && o.x + 26 > DINO_X + 10 && dinoY > GROUND_Y - 50) {
          gameState = 'dead';
          if (score > hiScore) { hiScore = score; }
          document.getElementById('dino-hi').textContent = fmtScore(hiScore);
          document.getElementById('dino-msg').textContent = 'Gần rồi... thử lại nhé em 💕  [SPACE / TAP]';
          drawFrame();
          return;
        }
      }
    }

    obstacles = obstacles.filter(o => o.x > -60);
    drawFrame();
    animId = requestAnimationFrame(loop);
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 2);
    ctx.lineTo(W, GROUND_Y + 2);
    ctx.stroke();

    clouds.forEach(c => drawCloud(c.x, c.y));
    obstacles.forEach(o => drawCactus(o.x, GROUND_Y));

    if (cakeShowing && cakeX > 0) {
      drawCake(cakeX, GROUND_Y);
      canvas.onclick = (e) => {
        if (gameState !== 'milestone') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * (H / rect.height);
        if (cx > cakeX && cx < cakeX + 50 && cy > GROUND_Y - 55 && cy < GROUND_Y) {
          triggerWarp();
        }
      };
    }

    drawDino(dinoY, gameState === 'dead');
    document.getElementById('dino-score-display').textContent = fmtScore(score);
  }

  // Initial draw
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#535353';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 2);
  ctx.lineTo(W, GROUND_Y + 2);
  ctx.stroke();
  drawDino(GROUND_Y, false);
  drawFrame();

  // WARP — transition from Dino to Scene 1 (first Swiper slide)
  function triggerWarp() {
    cancelAnimationFrame(animId);
    const warpOverlay = document.getElementById('warp-overlay');
    const warpCanvas = document.getElementById('warp-canvas');
    warpCanvas.width = innerWidth;
    warpCanvas.height = innerHeight;
    const wc = warpCanvas.getContext('2d');
    warpOverlay.style.pointerEvents = 'all';
    let warpProgress = 0;

    function warpAnim() {
      warpProgress++;
      const warpOpacity = Math.min(1, warpProgress / 20);
      warpOverlay.style.opacity = warpOpacity;
      wc.fillStyle = `rgba(15,10,20,0.1)`;
      wc.fillRect(0, 0, warpCanvas.width, warpCanvas.height);
      const cx = warpCanvas.width / 2, cy = warpCanvas.height / 2;
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const len = 40 + Math.random() * 200 + warpProgress * 8;
        const startR = 10 + Math.random() * 30;
        wc.strokeStyle = `rgba(255,179,198,${0.4 + Math.random() * 0.4})`;
        wc.lineWidth = 1 + Math.random() * 2;
        wc.beginPath();
        wc.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
        wc.lineTo(cx + Math.cos(angle) * (startR + len), cy + Math.sin(angle) * (startR + len));
        wc.stroke();
      }
      if (warpProgress < 60) {
        requestAnimationFrame(warpAnim);
      } else {
        warpOverlay.style.opacity = 1;
        setTimeout(() => {
          // Hide dino scene
          const dinoScene = document.getElementById('scene-dino');
          dinoScene.style.opacity = '0';
          dinoScene.style.pointerEvents = 'none';
          document.body.classList.remove('dino-active');

          setTimeout(() => {
            dinoScene.style.display = 'none';
            warpOverlay.style.transition = 'opacity 1s';
            warpOverlay.style.opacity = '0';
            setTimeout(() => { warpOverlay.style.pointerEvents = 'none'; }, 1000);

            // Navigate Swiper to slide 0 (Hero)
            if (swiper) swiper.slideTo(0, 0);
            launchConfetti();
          }, 500);
        }, 400);
      }
    }
    requestAnimationFrame(warpAnim);
  }
})();

// =============================================
// SCENE 1 — CANDLES
// =============================================
const NUM_CANDLES = 22;
let blownCount = 0;
(function initCandles() {
  const row = document.getElementById('candles-row');
  row.innerHTML = '';
  blownCount = 0;
  for (let i = 0; i < NUM_CANDLES; i++) {
    const item = document.createElement('div');
    item.className = 'candle-item';
    item.innerHTML = `<span class="candle-flame">🔥</span><div class="candle-body"></div>`;
    item.onclick = () => blowCandle(item);
    row.appendChild(item);
  }
})();

function blowCandle(item) {
  const flame = item.querySelector('.candle-flame');
  if (flame.classList.contains('out')) return;
  flame.classList.add('out');
  blownCount++;
  if (blownCount === NUM_CANDLES) allCandlesBlown();
}

function blowAllCandles() {
  document.querySelectorAll('.candle-flame').forEach(f => f.classList.add('out'));
  blownCount = NUM_CANDLES;
  allCandlesBlown();
}

function allCandlesBlown() {
  launchConfetti();
  setTimeout(() => {
    document.getElementById('blow-btn').textContent = '🎊 Happy Birthday Thảo! 🎊';
    document.getElementById('blow-btn').style.background = 'var(--pink-rose)';
    document.getElementById('blow-btn').style.color = 'white';
  }, 400);
}

// =============================================
// SCENE 2 — TIMELINE
// =============================================
let tlIndex = 0;
const tlCards = document.querySelectorAll('.timeline-card');
const tlTrack = document.getElementById('timeline-track');
const tlProg = document.getElementById('tl-progress');

tlCards.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'tl-dot' + (i === 0 ? ' active' : '');
  tlProg.appendChild(d);
});

function moveTimeline(dir) {
  tlIndex = Math.max(0, Math.min(tlCards.length - 1, tlIndex + dir));
  const cardW = tlCards[0].offsetWidth + 40;
  tlTrack.style.transform = `translateX(-${tlIndex * cardW}px)`;
  document.querySelectorAll('.tl-dot').forEach((d, i) => d.classList.toggle('active', i === tlIndex));
}

let tStart = 0;
tlTrack.addEventListener('touchstart', e => tStart = e.touches[0].clientX);
tlTrack.addEventListener('touchend', e => {
  const diff = tStart - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) moveTimeline(diff > 0 ? 1 : -1);
});

// =============================================
// SCENE 3 — GIFT VAULT
// =============================================
function checkGifts() {
  const now = new Date();
  const gifts = [
    { id: 1, h: 8, m: 0 },
    { id: 2, h: 12, m: 30 },
    { id: 3, h: 20, m: 0 },
  ];
  gifts.forEach(g => {
    const unlockTime = new Date(now);
    unlockTime.setHours(g.h, g.m, 0, 0);
    const isUnlocked = now >= unlockTime;
    const box = document.getElementById(`gift-${g.id}`);
    const cdEl = document.getElementById(`gift-cd-${g.id}`);
    const lockEl = document.getElementById(`gift-lock-${g.id}`);

    if (isUnlocked) {
      if (!box.classList.contains('unlocked')) {
        box.classList.remove('locked');
        box.classList.add('unlocked', 'gift-open-anim');
        if (lockEl) lockEl.textContent = '🎁';
        if (cdEl) cdEl.textContent = '';
        const content = document.getElementById(`gift-content-${g.id}`);
        if (content) content.style.display = 'block';
      }
    } else {
      box.classList.add('locked');
      const diff = unlockTime - now;
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      if (cdEl) cdEl.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }
  });
}
checkGifts();
setInterval(checkGifts, 1000);

// =============================================
// SCENE 4 — MINI GAMES
// =============================================

function switchGame(name) {
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('game-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'puzzle') initPuzzle();
}

// --- QUIZ ---
const quizData = [
  {
    q: 'Lần đầu tiên anh để ý em là khi nào?',
    opts: ['Ngay ngày đầu về Technopark', 'Sau 1 tuần làm việc chung', 'Khi em mang cà phê qua', 'Khi em hỏi mượn sạc'],
    ans: 0
  },
  {
    q: 'Món quà đầu tiên anh tặng em là gì?',
    opts: ['Hoa hồng Eden đỏ', '6 con Loopy màu hồng', 'Cà phê sáng yêu thích', 'Sticker cute dễ thương'],
    ans: 1
  },
  {
    q: 'Bài hát của chúng mình là?',
    opts: ['Perfect - Ed Sheeran', 'A Thousand Years - Christina Perri', 'Nothing - Bruno Major', 'Câu cả B và C'],
    ans: 3
  },
  {
    q: 'Em ngồi cạnh anh vì lý do gì?',
    opts: ['Vũ trụ sắp xếp 🔮', 'Team em chuyển chỗ', 'Ghế bên kia đã hỏng', 'Để ý anh lâu rồi 😏'],
    ans: 1
  },
  {
    q: 'Điều anh trân trọng nhất ở em là gì?',
    opts: ['Nụ cười của em', 'Sự bao dung của em', 'Cá tính của em', 'Tất cả những điều trên 🩷'],
    ans: 3
  },
];
let quizIdx = 0, quizScore = 0, quizAnswered = false;

function initQuiz() {
  quizIdx = 0; quizScore = 0; quizAnswered = false;
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  renderQuiz();
}

function renderQuiz() {
  const q = quizData[quizIdx];
  document.getElementById('quiz-prog').style.width = ((quizIdx / quizData.length) * 100) + '%';
  document.getElementById('quiz-question').textContent = `${quizIdx + 1}. ${q.q}`;
  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = o;
    btn.onclick = () => answerQuiz(i, btn);
    opts.appendChild(btn);
  });
  quizAnswered = false;
}

function answerQuiz(i, btn) {
  if (quizAnswered) return;
  quizAnswered = true;
  const q = quizData[quizIdx];
  const allBtns = document.querySelectorAll('.quiz-opt');
  allBtns[q.ans].classList.add('correct');
  if (i !== q.ans) btn.classList.add('wrong');
  else quizScore++;
  setTimeout(() => {
    quizIdx++;
    if (quizIdx < quizData.length) renderQuiz();
    else showQuizResult();
  }, 1000);
}

function showQuizResult() {
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('quiz-final-score').textContent = `${quizScore}/${quizData.length}`;
  const msgs = [
    'Ơ... em quên anh rồi à 😤 (Đùa thôi, anh thương em 🩷)',
    'Gần đúng rồi, từ từ hiểu anh thêm nhé~',
    'Ổn lắm rồi em! Nhưng vẫn còn nhiều thứ để khám phá 🌸',
    'Gần hoàn hảo rồi! Em giỏi quá 🌷',
    'Em giỏi quá! (Hoặc anh dễ đoán quá... 🤔) 💕',
  ];
  document.getElementById('quiz-result-msg').textContent = msgs[Math.min(quizScore, 4)];
}

initQuiz();

// --- CATCH PETALS ---
let catchRunning = false, catchScore = 0, catchTimer = 30, catchInterval;
const catchCanvas = document.getElementById('catch-canvas');
const catchCtx = catchCanvas.getContext('2d');
catchCanvas.width = Math.min(500, innerWidth - 40);
catchCanvas.height = 320;
let basket = { x: catchCanvas.width / 2, w: 70, h: 30 };
let catchPetals = [], catchBadLeaves = [];

catchCanvas.addEventListener('mousemove', e => {
  const rect = catchCanvas.getBoundingClientRect();
  basket.x = (e.clientX - rect.left) * (catchCanvas.width / rect.width);
});
catchCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = catchCanvas.getBoundingClientRect();
  basket.x = (e.touches[0].clientX - rect.left) * (catchCanvas.width / rect.width);
}, { passive: false });

function startCatchGame() {
  catchScore = 0; catchTimer = 30; catchPetals = []; catchBadLeaves = [];
  document.getElementById('catch-score').textContent = '0';
  document.getElementById('catch-timer').textContent = '30';
  document.getElementById('catch-result').textContent = '';
  document.getElementById('catch-start-btn').textContent = '⏸ Đang chơi...';
  document.getElementById('catch-start-btn').disabled = true;
  catchRunning = true;
  clearInterval(catchInterval);
  catchInterval = setInterval(() => {
    catchTimer--;
    document.getElementById('catch-timer').textContent = catchTimer;
    if (catchTimer <= 0) endCatchGame();
  }, 1000);
  animCatch();
}

function endCatchGame() {
  catchRunning = false;
  clearInterval(catchInterval);
  document.getElementById('catch-start-btn').textContent = 'Chơi lại 🌸';
  document.getElementById('catch-start-btn').disabled = false;
  const msgs = [
    'Thôi được, anh chịu hứng bù cho em 💕',
    'Ổn lắm rồi em~ 🌷',
    'Em khéo tay thế! Anh thương em 🌸',
  ];
  const idx = catchScore < 10 ? 0 : catchScore < 20 ? 1 : 2;
  document.getElementById('catch-result').textContent = msgs[idx];
}

function animCatch() {
  if (!catchRunning) return;
  catchCtx.clearRect(0, 0, catchCanvas.width, catchCanvas.height);
  catchCtx.fillStyle = 'rgba(30,16,40,1)';
  catchCtx.fillRect(0, 0, catchCanvas.width, catchCanvas.height);

  if (Math.random() < 0.06) {
    catchPetals.push({ x: Math.random() * catchCanvas.width, y: -20, speed: 1.5 + Math.random() * 2, rot: Math.random() * Math.PI * 2, rotS: (Math.random() - 0.5) * 0.05 });
  }
  if (Math.random() < 0.025) {
    catchBadLeaves.push({ x: Math.random() * catchCanvas.width, y: -20, speed: 2 + Math.random() * 2 });
  }

  catchPetals.forEach(p => {
    catchCtx.save();
    catchCtx.translate(p.x, p.y);
    catchCtx.rotate(p.rot);
    catchCtx.fillStyle = '#FFB3C6';
    catchCtx.beginPath();
    catchCtx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    catchCtx.fill();
    catchCtx.restore();
    p.y += p.speed;
    p.rot += p.rotS;
    if (p.y > catchCanvas.height - 50 && p.y < catchCanvas.height - 20 &&
      p.x > basket.x - basket.w / 2 && p.x < basket.x + basket.w / 2 && !p.caught) {
      p.caught = true;
      catchScore++;
      document.getElementById('catch-score').textContent = catchScore;
    }
  });
  catchPetals = catchPetals.filter(p => p.y < catchCanvas.height + 30 && !p.caught);

  catchBadLeaves.forEach(l => {
    catchCtx.fillStyle = '#5a8a4a';
    catchCtx.beginPath();
    catchCtx.ellipse(l.x, l.y, 12, 6, 0.4, 0, Math.PI * 2);
    catchCtx.fill();
    l.y += l.speed;
    if (l.y > catchCanvas.height - 50 && l.y < catchCanvas.height - 10 &&
      l.x > basket.x - basket.w / 2 && l.x < basket.x + basket.w / 2 && !l.hit) {
      l.hit = true;
      catchScore = Math.max(0, catchScore - 1);
      document.getElementById('catch-score').textContent = catchScore;
    }
  });
  catchBadLeaves = catchBadLeaves.filter(l => l.y < catchCanvas.height + 30 && !l.hit);

  // Draw basket (heart shape)
  catchCtx.fillStyle = '#FF8FAB';
  catchCtx.beginPath();
  const bx = basket.x, by = catchCanvas.height - 30;
  catchCtx.moveTo(bx, by + 15);
  catchCtx.bezierCurveTo(bx - basket.w / 2, by, bx - basket.w / 2, by - 20, bx, by - 10);
  catchCtx.bezierCurveTo(bx + basket.w / 2, by - 20, bx + basket.w / 2, by, bx, by + 15);
  catchCtx.fill();

  requestAnimationFrame(animCatch);
}

// --- PUZZLE ---
const PUZZLE_EMOJIS = ['🌹', '🩷', '🧸', '🌸', '✨', '💌', '🎂', '🌃', '🎀', '🌙'];
let puzzleOrder = [], puzzleSolved = [];

function initPuzzle() {
  const grid = document.getElementById('puzzle-grid');
  grid.innerHTML = '';
  document.getElementById('puzzle-msg').classList.remove('show');
  let arr = [...Array(9).keys()];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  puzzleOrder = arr;
  puzzleSolved = new Array(9).fill(false);
  let dragSrc = null;

  arr.forEach((val, pos) => {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.textContent = PUZZLE_EMOJIS[val];
    piece.dataset.val = val;
    piece.dataset.pos = pos;
    piece.draggable = true;

    piece.addEventListener('dragstart', e => { dragSrc = piece; piece.classList.add('dragging'); });
    piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
    piece.addEventListener('dragover', e => e.preventDefault());
    piece.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === piece) return;
      const tmp = dragSrc.textContent;
      const tmpV = dragSrc.dataset.val;
      dragSrc.textContent = piece.textContent;
      dragSrc.dataset.val = piece.dataset.val;
      piece.textContent = tmp;
      piece.dataset.val = tmpV;
      checkPuzzle();
    });

    let touchStartX, touchStartY;
    piece.addEventListener('touchstart', e => { dragSrc = piece; touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
    piece.addEventListener('touchend', e => {
      const el = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      if (el && el.classList.contains('puzzle-piece') && el !== dragSrc) {
        const tmp = dragSrc.textContent, tmpV = dragSrc.dataset.val;
        dragSrc.textContent = el.textContent; dragSrc.dataset.val = el.dataset.val;
        el.textContent = tmp; el.dataset.val = tmpV;
        checkPuzzle();
      }
    });

    grid.appendChild(piece);
  });
}

function checkPuzzle() {
  const pieces = document.querySelectorAll('.puzzle-piece');
  let allCorrect = true;
  pieces.forEach((p, i) => {
    const correct = parseInt(p.dataset.val) === i;
    p.classList.toggle('correct', correct);
    if (!correct) allCorrect = false;
  });
  if (allCorrect) {
    document.getElementById('puzzle-msg').classList.add('show');
    launchConfetti();
  }
}

initPuzzle();

// =============================================
// SCENE 5 — LOVE LETTER
// =============================================
const letterText = `Gửi em,
Người anh thương,

Chúc mừng sinh nhật em ạ !!

Trước tiên thì cảm ơn em vì đã đến, đã bước vào cuộc đời anh, đã bao dung và dành thời gian, tình cảm cho anh.

Ở cạnh em, anh luôn cảm thấy anh được là chính mình, an tâm rằng mọi chuyện sẽ ổn chỉ cần em còn ở bên.

Sinh nhật năm nay của em đặc biệt lắm, vì đây là lần đầu tiên anh được ở cạnh em đón dịp này. Hmmm rất hy vọng sau này chúng ta sẽ còn thật nhiều lần thổi nến cùng nhau nữa ạ — và mỗi lần trôi qua đó chúng ta đều yêu nhau hơn một chút. Nhiều cũng được :>

Thật sự ấy, không biết từ bao giờ, anh cảm thấy rằng mình đang trân trọng một người đến thế.

Mong em một năm mới ngập tràn niềm vui, luôn vững vàng, mạnh mẽ như hiện tại và đạt được mọi điều em mong muốn.

Chúc mừng sinh nhật em,
Tình yêu của anh. ❤️`;

let letterOpened = false;
function openLetter() {
  if (letterOpened) return;
  letterOpened = true;
  document.getElementById('envelope-flap').classList.add('open');
  document.getElementById('envelope-seal').style.display = 'none';
  document.getElementById('letter-hint').style.display = 'none';
  setTimeout(() => {
    const content = document.getElementById('letter-content');
    content.style.display = 'block';
    setTimeout(() => content.classList.add('visible'), 50);
    typeText(document.getElementById('letter-text'), letterText, 18);
  }, 900);
}

function typeText(el, text, speed) {
  let i = 0;
  el.innerHTML = '';
  function type() {
    if (i < text.length) {
      el.innerHTML = text.substring(0, i + 1).replace(/\n/g, '<br>');
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// =============================================
// SCENE 6 — PLAYLIST
// =============================================
const waveformEl = document.getElementById('waveform');
for (let i = 0; i < 24; i++) {
  const bar = document.createElement('div');
  bar.className = 'wave-bar';
  bar.style.animationDelay = (i * 0.05) + 's';
  bar.style.height = (4 + Math.random() * 10) + 'px';
  waveformEl.appendChild(bar);
}

const trackLyrics = [
  '"I don\'t need nothing, when I\'m with you..." 🎵',
  '"I have loved you for a thousand years..." 🎵',
];
let currentTrack = -1;

function playTrack(idx) {
  currentTrack = idx;
  document.querySelectorAll('.track-item').forEach((t, i) => t.classList.toggle('playing', i === idx));
  document.getElementById('vinyl-disc').classList.add('spinning');
  document.querySelectorAll('.wave-bar').forEach(b => b.classList.add('animating'));
  const lyricEl = document.getElementById('track-lyric');
  lyricEl.classList.remove('show');
  setTimeout(() => {
    lyricEl.textContent = trackLyrics[idx];
    lyricEl.classList.add('show');
  }, 500);
}

// =============================================
// SCENE 7 — COUNTDOWN
// =============================================
function updateCountdowns() {
  const now = new Date();

  const nextBday = new Date(2026, 4, 1, 0, 0, 0);
  const diff1 = nextBday - now;
  const d1 = Math.floor(diff1 / 86400000);
  const h1 = Math.floor((diff1 % 86400000) / 3600000);
  const m1 = Math.floor((diff1 % 3600000) / 60000);
  const s1 = Math.floor((diff1 % 60000) / 1000);
  document.getElementById('cd-next-bday').innerHTML = cdHTML(d1, h1, m1, s1);

  const since = new Date(2024, 9, 20, 0, 0, 0);
  const diff2 = now - since;
  const d2 = Math.floor(diff2 / 86400000);
  const h2 = Math.floor((diff2 % 86400000) / 3600000);
  const m2 = Math.floor((diff2 % 3600000) / 60000);
  const s2 = Math.floor((diff2 % 60000) / 1000);
  document.getElementById('cd-together').innerHTML = cdHTML(d2, h2, m2, s2);
}

function cdHTML(d, h, m, s) {
  return `
    <div class="countdown-unit"><span class="countdown-val">${String(d).padStart(3, '0')}</span><span class="countdown-unit-label">NGÀY</span></div>
    <div class="countdown-sep">:</div>
    <div class="countdown-unit"><span class="countdown-val">${String(h).padStart(2, '0')}</span><span class="countdown-unit-label">GIỜ</span></div>
    <div class="countdown-sep">:</div>
    <div class="countdown-unit"><span class="countdown-val">${String(m).padStart(2, '0')}</span><span class="countdown-unit-label">PHÚT</span></div>
    <div class="countdown-sep">:</div>
    <div class="countdown-unit"><span class="countdown-val">${String(s).padStart(2, '0')}</span><span class="countdown-unit-label">GIÂY</span></div>
  `;
}
updateCountdowns();
setInterval(updateCountdowns, 1000);

// Wish board
const wishColors = ['#FFF9C4', '#FFD6E0', '#D4F1F4', '#E8D5F5'];
const wishRots = ['-3deg', '-1deg', '2deg', '1deg', '-2deg'];
let wishCount = 0;

function addWish() {
  const input = document.getElementById('wish-input');
  const text = input.value.trim();
  if (!text || wishCount >= 5) return;
  const note = document.createElement('div');
  note.className = 'wish-note';
  note.style.background = wishColors[wishCount % wishColors.length];
  note.style.setProperty('--rot', wishRots[wishCount % wishRots.length]);
  note.textContent = text;
  document.getElementById('wish-notes').appendChild(note);
  input.value = '';
  wishCount++;
  try {
    const wishes = JSON.parse(localStorage.getItem('thao_wishes') || '[]');
    wishes.push(text);
    localStorage.setItem('thao_wishes', JSON.stringify(wishes));
  } catch (e) { }
}

// Load saved wishes
try {
  const saved = JSON.parse(localStorage.getItem('thao_wishes') || '[]');
  saved.forEach(w => {
    const input = document.getElementById('wish-input');
    input.value = w;
    addWish();
  });
  document.getElementById('wish-input').value = '';
} catch (e) { }

// =============================================
// SCENE 8 — FIREWORKS
// =============================================
const fwCanvas = document.getElementById('firework-canvas');
const fwCtx = fwCanvas.getContext('2d');
let fwParticles = [];
let fwRunning = false;

function startFireworks() {
  fwCanvas.width = fwCanvas.offsetWidth;
  fwCanvas.height = fwCanvas.offsetHeight;
  fwRunning = true;
  fwLoop();
}

function launchFirework() {
  const x = Math.random() * fwCanvas.width;
  const y = Math.random() * fwCanvas.height * 0.6 + 50;
  const colors = ['#FFB3C6', '#FF8FAB', '#F7D794', '#E8637A', '#fff', '#FFD6E0'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function fwLoop() {
  if (!fwRunning) return;
  fwCtx.fillStyle = 'rgba(15,10,20,0.18)';
  fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
  if (Math.random() < 0.04) launchFirework();
  fwParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.06;
    p.life -= p.decay;
    fwCtx.globalAlpha = Math.max(0, p.life);
    fwCtx.fillStyle = p.color;
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fill();
  });
  fwCtx.globalAlpha = 1;
  fwParticles = fwParticles.filter(p => p.life > 0);
  requestAnimationFrame(fwLoop);
}

// Easter egg — click stars 10 times
let starClicks = 0;
document.getElementById('finale-stars').addEventListener('click', () => {
  starClicks++;
  if (starClicks >= 10) {
    document.getElementById('loopy-easter').style.display = 'block';
    starClicks = 0;
  }
});

// =============================================
// STAR MEMORIES — Data Array
// =============================================
// ✏️  HƯỚNG DẪN THAY NỘI DUNG (dễ dàng chỉnh sửa):
//
// Mỗi object trong mảng tương ứng 1 ngôi sao đặc biệt.
// Các trường quan trọng cần thay:
//
//   title  : Tiêu đề kỷ niệm (hiển thị trong modal)
//   date   : Thời gian      (ví dụ: 'Tháng 12, 2024')
//   story  : Đoạn text kể chuyện
//   image  : Đường dẫn ảnh (null = placeholder tự động)
//           Ví dụ: './images/ten-anh.jpg'
//
// Các trường nâng cao (tuỳ chỉnh vị trí/màu sắc ngôi sao):
//   color     : Màu lõi sao  (hex number, ví dụ: 0xFF8FAB)
//   glowColor : Màu hào quang
//   size      : Kích thước (0.3 ~ 0.6 tương ứng nhỏ → lớn)
//   position  : Vị trí [x, y, z] trong không gian 3D
//               x: âm = trái, dương = phải
//               y: âm = dưới, dương = trên
//               z: âm = xa hơn
// =============================================
const STAR_MEMORIES = [

  // ── Ngôi sao 1 ──────────────────────────────
  {
    id: 1,
    label: '🏢 Technopark',        // ← Text tooltip khi hover
    emoji: '🏢',                   // ← Emoji hiển thị trong modal
    color: 0xFFB3C6,
    glowColor: 0xFF8FAB,
    size: 0.38,
    position: [-3.5, 2.0, -4],
    title: 'Ngày anh về Technopark',
    date: 'Tháng 10, 2024',
    story: 'Anh chuyển văn phòng về tòa nhà Technopark Hà Nội, tầng 8A. Nhìn ra cửa sổ là cả thành phố — nhưng thứ anh chú ý nhất lại là em.',
    image: null,
    // ↑ Thay null bằng: './images/technopark.jpg'
  },

  // ── Ngôi sao 2 ──────────────────────────────
  {
    id: 2,
    label: '🪑 Ngồi cạnh anh',
    emoji: '🪑',
    color: 0xD4B3F5,
    glowColor: 0xC9A0DC,
    size: 0.34,
    position: [3.2, 2.4, -5],
    title: 'Em ngồi cạnh anh',
    date: 'Một ngày đặc biệt',
    story: 'Rồi một ngày, team em chuyển chỗ. Em qua ngồi cạnh chỗ anh. Anh không biết đó là ngẫu nhiên hay vũ trụ đã sắp xếp — nhưng anh thích kết quả đó lắm 🪐',
    image: null,
    // ↑ Thay null bằng: './images/ngoi-canh.jpg'
  },

  // ── Ngôi sao 3 ──────────────────────────────
  {
    id: 3,
    label: '🌃 Đưa em về',
    emoji: '🌃',
    color: 0xF7D794,
    glowColor: 0xF4956A,
    size: 0.40,
    position: [-1.8, -2.0, -3.5],
    title: 'Ngày đầu anh đưa em về',
    date: 'Ngày đầu tiên',
    story: 'Và tất cả bắt đầu từ ngày hôm đó — ngày đầu tiên anh đưa em về. Đường phố Hà Nội đêm đó đẹp lắm... hay vì có em ở cạnh nhỉ? 🌙',
    image: null,
    // ↑ Thay null bằng: './images/dem-ha-noi.jpg'
  },

  // ── Ngôi sao 4 ──────────────────────────────
  {
    id: 4,
    label: '🧸 6 bé Loopy',
    emoji: '🧸',
    color: 0xFF9AB8,
    glowColor: 0xFF6B9D,
    size: 0.36,
    position: [2.8, -1.6, -4.5],
    title: 'Lần đầu tặng 6 bé Loopy',
    date: 'Món quà đầu tiên',
    story: 'Anh tặng em 6 con Loopy màu hồng — nhỏ thôi, nhưng anh nhớ mãi ánh mắt của em lúc nhận. Chắc anh đã thích em từ rất lâu rồi 🩷',
    image: null,
    // ↑ Thay null bằng: './images/loopy.jpg'
  },

  // ── Ngôi sao 5 — NGÔI SAO TRUNG TÂM (lớn nhất) ──
  {
    id: 5,
    label: '🌹 Sinh nhật 22',
    emoji: '🌹',
    color: 0xCF4670,
    glowColor: 0xFF6B9D,
    size: 0.55,                    // ← Lớn nhất = ngôi sao quan trọng nhất
    position: [0.3, 0.4, -2.5],   // ← Gần camera nhất = dễ thấy
    title: '✨ Happy Birthday, Thảo',
    date: '01 · 05 · 2025',
    story: 'Hôm nay, lần đầu tiên anh được ở bên cạnh em đón sinh nhật. Mong sẽ còn thật nhiều lần như thế này — và mỗi lần trôi qua, chúng ta lại yêu nhau hơn một chút 🩷',
    image: null,
    // ↑ Thay null bằng: './images/birthday.jpg'
  },

  // ── Thêm ngôi sao mới (tuỳ chọn) ─────────────
  // Bỏ comment block dưới để thêm kỷ niệm mới:
  /*
  {
    id: 6,
    label: '☕ Cà phê đầu tiên', // Tooltip hover
    emoji: '☕',
    color: 0xF4A261,
    glowColor: 0xE76F51,
    size: 0.32,
    position: [-2.5, 0.5, -5.5],
    title: 'Buổi cà phê đầu tiên',
    date: 'Tháng 11, 2024',
    story: 'Lần đầu tiên hai đứa cùng uống cà phê, nói chuyện cả tiếng mà như mới bắt đầu...',
    image: null, // hoặc './images/cafe.jpg'
  },
  */
];

// =============================================
// VƯỜN HOA TÌNH YÊU — Garden Scene
// =============================================

// ✏️  THAY ĐỔI CÁC LÝ DO YÊU THẢO TẠI ĐÂY:
// Mỗi lần treồng hoa sẽ hiện ra một lý do ngẫu nhiên
const LOVE_REASONS = [
  '💕 Em hay cười khi thấy mèo',
  '🌟 Ánh mắt của em luôn ấm áp',
  '🌸 Em dễ thương theo cách riêng của em',
  '🎵 Em hát nhạc nhạt mà vẫn cute',
  '☕ Em hay uống trà sữa buổi chiều',
  '🧸 Em thích gấu bông từ nhỏ đến lớn',
  '💌 Cách em nhắn tin rất dễ thương',
  '🌙 Em cuộn tròn khi ngủ rất ngoan',
  '✨ Em hay cười ngại khi bị khen',
  '🩷 Em ôm anh rất chặt',
  '🌺 Mùi tóc của em anh thích lắm',
  '🎠 Em hay buộc tóc hai bên trông cute',
  '🐣 Em hay làm mặt ngáo khi mất ngủ',
  '💫 Em hiểu ý anh mà không cần anh nói',
  '🍀 Có em là anh thấy mình may mắn lắm',
];
// ✏️  Bảng màu cánh hoa (tùy chỉnh hoặc thêm màu mới)
const FLOWER_PALETTES = [
  { petals: '#FFB3C6', center: '#FF8FAB' },   // hồng phấn
  { petals: '#FFD6A5', center: '#FFAA5E' },   // cam đào
  { petals: '#D4B3F5', center: '#A87CE8' },   // tím lavender
  { petals: '#FFF3B0', center: '#F9C846' },   // vàng chanh
  { petals: '#B5EAD7', center: '#52B788' },   // xanh bạc hà
  { petals: '#FFDDE1', center: '#CF4670' },   // hồng đậm
  { petals: '#C8E6C9', center: '#43A047' },   // xanh lá
  { petals: '#FCE4EC', center: '#E91E63' },   // hồng rực
];

let _gardenInited = false;
let _gardenReasonIdx = 0;
let _gardenFlowerCount = 0;
const GARDEN_MAX = 50;

function initGarden() {
  if (_gardenInited) return;
  _gardenInited = true;
  const field = document.getElementById('garden-field');
  if (!field) return;
  field.addEventListener('click', (e) => {
    // Ignore clicks directly on flower heads (handled separately)
    if (e.target.closest('.flower-head') || e.target.closest('.gd-controls')) return;
    const rect = field.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    spawnFlower(xPct);
  });
}

function waterGarden() {
  const x = 5 + Math.random() * 90;
  spawnFlower(x);
  // Button pulse
  const btn = document.getElementById('water-btn');
  if (btn) {
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => { btn.style.transform = ''; }, 180);
  }
}

function spawnFlower(xPct) {
  if (_gardenFlowerCount >= GARDEN_MAX) { showGardenFull(); return; }
  const field = document.getElementById('garden-field');
  if (!field) return;

  const palette   = FLOWER_PALETTES[_gardenFlowerCount % FLOWER_PALETTES.length];
  const reason    = LOVE_REASONS[_gardenReasonIdx % LOVE_REASONS.length];
  const stemH     = 55 + Math.floor(Math.random() * 85);          // 55–140 px
  const scale     = +(0.72 + Math.random() * 0.52).toFixed(2);     // 0.72–1.24
  const bobDur    = +(2.4 + Math.random() * 1.8).toFixed(1);       // 2.4–4.2 s
  const xClamped  = Math.max(4, Math.min(96, xPct));
  _gardenReasonIdx++;

  const HEAD_SIZE = 50;

  // ── Wrapper ────────────────────────────────────────────
  const flower = document.createElement('div');
  flower.className = 'flower';
  flower.style.left   = xClamped + '%';
  flower.style.height = (stemH + HEAD_SIZE + 70) + 'px';
  flower.style.zIndex = 200 - stemH;   // shorter flowers in front

  // ── Stem ───────────────────────────────────────────────
  const stem = document.createElement('div');
  stem.className = 'flower-stem';

  // ── Head ───────────────────────────────────────────────
  const head = document.createElement('div');
  head.className = 'flower-head';
  head.style.cssText = `bottom:${stemH}px; --s:${scale}; --bob-dur:${bobDur}s;`;

  for (let i = 0; i < 6; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.background = palette.petals;
    petal.style.transform  = `rotate(${i * 60}deg)`;
    head.appendChild(petal);
  }
  const center = document.createElement('div');
  center.className = 'flower-center';
  center.style.background = palette.center;
  center.textContent = '✶';
  head.appendChild(center);

  // ── Tooltip bubble ─────────────────────────────────────
  const bubble = document.createElement('div');
  bubble.className = 'flower-bubble';
  bubble.style.bottom = (stemH + Math.round(HEAD_SIZE * scale * 0.9) + 12) + 'px';
  bubble.textContent  = reason;

  // ── Assemble ───────────────────────────────────────────
  flower.appendChild(stem);
  flower.appendChild(head);
  flower.appendChild(bubble);
  field.appendChild(flower);

  // ── Animate ────────────────────────────────────────────
  // Double rAF so the element is painted before transition fires
  requestAnimationFrame(() => requestAnimationFrame(() => {
    stem.style.height = stemH + 'px';

    // Bloom after stem is ~70% grown
    const bloomDelay = Math.round(stemH * 5.5); // ~300–770 ms
    setTimeout(() => {
      head.style.transition = `transform .5s cubic-bezier(.34,1.56,.64,1), opacity .35s ease`;
      head.style.transform  = `translateX(-50%) scale(${scale})`;
      head.style.opacity    = '1';

      // After bloom transition ends, hand off to CSS bob animation
      head.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;
        head.style.transition = 'none';
        head.style.setProperty('--s', scale);
        head.classList.add('bobbing');
      }, { once: true });
    }, bloomDelay);
  }));

  // ── Hover / click events ───────────────────────────────
  head.addEventListener('mouseenter', () => bubble.classList.add('visible'));
  head.addEventListener('mouseleave', () => bubble.classList.remove('visible'));
  head.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other open bubbles first
    document.querySelectorAll('.flower-bubble.visible').forEach(b => {
      if (b !== bubble) b.classList.remove('visible');
    });
    bubble.classList.toggle('visible');
  });

  _gardenFlowerCount++;
  updateGardenCount();
}

function updateGardenCount() {
  const el = document.getElementById('gd-count');
  if (el) el.textContent = _gardenFlowerCount > 0
    ? `🌸 ${_gardenFlowerCount} bông hoa`
    : '';
}

function showGardenFull() {
  if (document.querySelector('.gd-full-msg')) return;
  const field = document.getElementById('garden-field');
  if (!field) return;
  const msg = document.createElement('p');
  msg.className = 'gd-full-msg';
  msg.textContent = '🌺 Vườn hoa đầy rồi! Đẹp quá!';
  field.appendChild(msg);
}

function saveGarden() {
  if (typeof html2canvas === 'undefined') {
    alert('⚠️ html2canvas chưa tải. Thử reload trang rồi chụp lại nhé!');
    return;
  }
  const el  = document.getElementById('scene-garden');
  const btn = document.getElementById('save-btn');
  if (!el) return;

  // Show ALL bubbles for the snapshot
  const allBubbles = el.querySelectorAll('.flower-bubble');
  allBubbles.forEach(b => b.classList.add('visible'));

  if (btn) { btn.textContent = '⏳ Đang xử lý...'; btn.disabled = true; }

  html2canvas(el, {
    useCORS: true,
    allowTaint: true,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    logging: false,
    backgroundColor: null,
  }).then(canvas => {
    // Restore bubble states
    allBubbles.forEach(b => b.classList.remove('visible'));
    if (btn) { btn.textContent = '✅ Đã lưu!'; btn.disabled = false; }
    setTimeout(() => { if (btn) btn.textContent = '📷 Lưu vườn hoa'; }, 2200);

    const link = document.createElement('a');
    link.download = 'vuon-hoa-tinh-yeu-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch((err) => {
    console.error('[Garden] html2canvas error:', err);
    allBubbles.forEach(b => b.classList.remove('visible'));
    if (btn) { btn.textContent = '📷 Lưu vườn hoa'; btn.disabled = false; }
  });
}

// =============================================
// GALAXY SCENE — Three.js
// =============================================
let _galaxyInited = false;
let _galaxyRunning = false;
let _galaxyAnimId = null;
let _galaxyStart = null;
let _galaxyStop = null;

function initGalaxyScene() {
  if (_galaxyInited) return;

  console.log('[Galaxy] initGalaxyScene called. THREE available:', typeof THREE !== 'undefined');

  // THREE chưa load được → show lỗi nhỏ
  if (typeof THREE === 'undefined') {
    const hint = document.querySelector('.galaxy-hint');
    if (hint) hint.textContent = '⚠ Không kết nối được mạng để tải Three.js. Thử reload lại trang nhé!';
    return;
  }

  _galaxyInited = true;
  console.log('[Galaxy] THREE version:', THREE.REVISION);

  // Defer a tick so the slide is fully painted → container có dimensions
  setTimeout(() => _buildGalaxy(), 80);
}

function _buildGalaxy() {
  const container = document.getElementById('galaxy-canvas-container');
  if (!container) { console.error('[Galaxy] container not found!'); return; }

  const camW = container.offsetWidth  || container.clientWidth  || innerWidth;
  const camH = container.offsetHeight || container.clientHeight || innerHeight;
  console.log('[Galaxy] _buildGalaxy: container size =', camW, 'x', camH);

  // ─── Scene ───────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020110);

  // ─── Camera ─────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(60, camW / camH, 0.1, 300);
  camera.position.set(0, 0, 5);
  camera.rotation.order = 'YXZ';

  // ─── Renderer ───────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(camW, camH);
  renderer.setClearColor(0x020110, 1);
  container.appendChild(renderer.domElement);

  // Force canvas to fill container via inline style (override CSS)
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  // ─── Resize handler ─────────────────────────────────
  const onResize = () => {
    const w = container.offsetWidth  || innerWidth;
    const h = container.offsetHeight || innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ─── Ambient light ──────────────────────────────────
  scene.add(new THREE.AmbientLight(0x111133, 6));

  // ─── Background stars (Points) ──────────────────────
  // Dùng size lớn hơn + nhiều sao hơn để thấy rõ
  const BG_COUNT = 6000;
  const bgPos = new Float32Array(BG_COUNT * 3);
  for (let i = 0; i < BG_COUNT; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 20 + Math.random() * 60;
    bgPos[i3]     = r * Math.sin(phi) * Math.cos(theta);
    bgPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    bgPos[i3 + 2] = r * Math.cos(phi);
  }
  const bgGeo   = new THREE.BufferGeometry();
  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  const bgStars = new THREE.Points(bgGeo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,              // ← tăng từ 0.07 → 0.18 để nhìn rõ hơn
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
  }));
  scene.add(bgStars);

  // Thêm một lớp sao nhỏ hơn gần hơn (tạo độ sâu)
  const MID_COUNT = 2000;
  const midPos = new Float32Array(MID_COUNT * 3);
  for (let i = 0; i < MID_COUNT; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 8 + Math.random() * 14;
    midPos[i3]     = r * Math.sin(phi) * Math.cos(theta);
    midPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    midPos[i3 + 2] = r * Math.cos(phi);
  }
  const midGeo = new THREE.BufferGeometry();
  midGeo.setAttribute('position', new THREE.BufferAttribute(midPos, 3));
  scene.add(new THREE.Points(midGeo, new THREE.PointsMaterial({
    color: 0xffd6ff,
    size: 0.10,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })));

  // ─── Nebula dust (màu sắc) ──────────────────────────
  const addNebula = (color, count, rMin, rMax, opacity) => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = rMin + Math.random() * (rMax - rMin);
      pos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color, size: 0.28, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));
  };
  addNebula(0xFF8FAB, 600, 8,  20, 0.35); // hồng
  addNebula(0x8866EE, 400, 12, 25, 0.25); // tím
  addNebula(0xF7D794, 250, 16, 28, 0.20); // vàng

  // ─── Special Memory Stars ───────────────────────────
  // Ngôi sao đặc biệt — kích thước và vị trí được tối ưu để dễ thấy
  const specialStars = [];
  STAR_MEMORIES.forEach((mem) => {
    // Lấy position từ data, nhưng nhân scale để điều chỉnh
    const [px, py, pz] = mem.position;

    // Core sphere — MeshBasicMaterial luôn sáng, không phụ thuộc ánh sáng
    const coreMat = new THREE.MeshBasicMaterial({ color: mem.color });
    const coreSize = mem.size * 0.75;  // ← size vừa phải
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(coreSize, 24, 24),
      coreMat
    );
    core.position.set(px * 0.7, py * 0.7, pz * 0.75); // ← giữ khoảng cách tự nhiên

    // Vòng hào quang 1 — glow vừa
    const haloMat = new THREE.MeshBasicMaterial({
      color: mem.glowColor,
      transparent: true, opacity: 0.30,
      blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(coreSize * 2.4, 12, 12),
      haloMat
    );
    halo.position.copy(core.position);
    scene.add(halo);

    // Vòng hào quang 2 — glow rộng
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: mem.glowColor,
      transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.BackSide,
    });
    const halo2 = new THREE.Mesh(
      new THREE.SphereGeometry(coreSize * 4.5, 8, 8),
      halo2Mat
    );
    halo2.position.copy(core.position);
    scene.add(halo2);

    // Point light — toả sáng ra xung quanh
    const light = new THREE.PointLight(mem.glowColor, 3.0, 10);
    light.position.copy(core.position);
    scene.add(light);

    core.userData = {
      memory: mem, coreMat, haloMat, halo2Mat, light, halo, halo2,
      isHovered: false,
      basePhase: Math.random() * Math.PI * 2,
    };
    scene.add(core);
    specialStars.push(core);
  });

  // ─── Raycaster (hover & click) ──────────────────────
  const raycaster = new THREE.Raycaster();
  // Tăng threshold để dễ click (click vùng hào quang cũng mở modal)
  raycaster.params.Points = { threshold: 0.5 };
  const mouse = new THREE.Vector2(9999, 9999);
  let hoveredStar = null;

  const slideEl = document.getElementById('slide-galaxy');
  const tooltip  = document.getElementById('galaxy-tooltip');

  // ─── Mouse parallax state ───────────────────────────
  let mouseNX = 0, mouseNY = 0;
  let currentRotX = 0, currentRotY = 0;
  const PARALLAX = 0.10;

  const onMouseMove = (e) => {
    const rect = slideEl.getBoundingClientRect();
    mouseNX = (e.clientX - rect.left) / rect.width  - 0.5;
    mouseNY = (e.clientY - rect.top)  / rect.height - 0.5;
    mouse.x =  mouseNX * 2;
    mouse.y = -mouseNY * 2;
    if (tooltip && hoveredStar) {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 30) + 'px';
    }
  };

  const onClick = (e) => {
    const rect = slideEl.getBoundingClientRect();
    const clickMouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
      -((e.clientY - rect.top)  / rect.height - 0.5) * 2
    );
    raycaster.setFromCamera(clickMouse, camera);
    // Raycast cả core + halo (passed as array)
    const allMeshes = [];
    specialStars.forEach(s => {
      allMeshes.push(s);
      allMeshes.push(s.userData.halo);
      allMeshes.push(s.userData.halo2);
    });
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
      // Tìm star tương ứng (dù click vào halo thì cũng mở đúng star)
      const hitObj = hits[0].object;
      const star = specialStars.find(s =>
        s === hitObj || s.userData.halo === hitObj || s.userData.halo2 === hitObj
      );
      if (star) openStarModal(star.userData.memory);
    }
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    const rect = slideEl.getBoundingClientRect();
    mouseNX = (t.clientX - rect.left) / rect.width  - 0.5;
    mouseNY = (t.clientY - rect.top)  / rect.height - 0.5;
    mouse.x =  mouseNX * 2;
    mouse.y = -mouseNY * 2;
  };

  const onTouchEnd = () => {
    const allMeshes = [];
    specialStars.forEach(s => { allMeshes.push(s, s.userData.halo, s.userData.halo2); });
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const star = specialStars.find(s =>
        s === hitObj || s.userData.halo === hitObj || s.userData.halo2 === hitObj
      );
      if (star) openStarModal(star.userData.memory);
    }
  };

  slideEl.addEventListener('mousemove', onMouseMove);
  slideEl.addEventListener('click', onClick);
  slideEl.addEventListener('touchstart', onTouchStart, { passive: true });
  slideEl.addEventListener('touchend', onTouchEnd);

  // ─── Animation loop ─────────────────────────────────
  const clock = new THREE.Clock();

  const animate = () => {
    if (!_galaxyRunning) return;
    _galaxyAnimId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Parallax camera nhẹ theo chuột
    currentRotY += (mouseNX * PARALLAX - currentRotY) * 0.04;
    currentRotX += (-mouseNY * PARALLAX - currentRotX) * 0.04;
    camera.rotation.y = currentRotY;
    camera.rotation.x = currentRotX;

    // Xoay nhẹ background star field
    bgStars.rotation.y = t * 0.006;
    bgStars.rotation.x = t * 0.002;

    // Hover detection
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(specialStars);
    const newHit = hits.length > 0 ? hits[0].object : null;

    if (newHit !== hoveredStar) {
      if (hoveredStar) {
        hoveredStar.userData.isHovered = false;
        slideEl.style.cursor = 'default';
        if (tooltip) tooltip.classList.remove('visible');
      }
      hoveredStar = newHit;
      if (hoveredStar) {
        hoveredStar.userData.isHovered = true;
        slideEl.style.cursor = 'pointer';
        if (tooltip) {
          tooltip.textContent = hoveredStar.userData.memory.label;
          tooltip.classList.add('visible');
        }
      }
    }

    // Animate special stars: pulsate + hover glow
    specialStars.forEach((star) => {
      const ph    = star.userData.basePhase;
      const pulse = Math.sin(t * 1.2 + ph) * 0.12 + 0.90;
      const hov   = star.userData.isHovered;

      star.scale.setScalar(hov ? 1.4 : pulse);
      star.userData.halo.scale.setScalar(hov ? 1.7 : pulse);
      star.userData.halo2.scale.setScalar(hov ? 2.0 : pulse * 1.06);

      star.userData.haloMat.opacity  = hov ? 0.50 : 0.25 + Math.sin(t * 1.1 + ph) * 0.07;
      star.userData.halo2Mat.opacity = hov ? 0.20 : 0.10 + Math.sin(t + ph) * 0.04;
      star.userData.light.intensity  = hov ? 6.0  : 3.0 + Math.sin(t * 1.2 + ph) * 0.8;
    });

    renderer.render(scene, camera);
  };

  // Expose controls
  _galaxyStart = () => {
    if (_galaxyRunning) return;
    _galaxyRunning = true;
    clock.start();
    animate();
  };

  _galaxyStop = () => {
    _galaxyRunning = false;
    if (_galaxyAnimId) cancelAnimationFrame(_galaxyAnimId);
    _galaxyAnimId = null;
    slideEl.style.cursor = 'default';
  };

  // Auto-start khi init xong
  _galaxyStart();
}


// =============================================
// STAR MODAL — Open / Close
// =============================================
function openStarModal(memory) {
  const overlay = document.getElementById('star-modal');
  if (!overlay) return;

  const img         = document.getElementById('star-modal-img');
  const placeholder = document.getElementById('star-modal-placeholder');
  const phEmoji     = placeholder ? placeholder.querySelector('.star-modal-placeholder-emoji') : null;

  if (memory.image) {
    if (img) { img.src = memory.image; img.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (img) img.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      const hex = '#' + memory.color.toString(16).padStart(6, '0');
      placeholder.style.background =
        `linear-gradient(135deg, #0a0520 0%, ${hex}22 50%, #0a0520 100%)`;
      if (phEmoji) phEmoji.textContent = memory.emoji;
    }
  }

  document.getElementById('star-modal-emoji').textContent  = memory.emoji;
  document.getElementById('star-modal-date').textContent   = memory.date;
  document.getElementById('star-modal-title').textContent  = memory.title;
  document.getElementById('star-modal-story').textContent  = memory.story;

  overlay.classList.add('open');
  if (swiper) swiper.mousewheel.disable();
}

function closeStarModal() {
  const overlay = document.getElementById('star-modal');
  if (overlay) overlay.classList.remove('open');
  if (swiper) swiper.mousewheel.enable();
}

// Close modal on ESC key or backdrop click
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeStarModal();
});

// Close when clicking outside the glass panel (on the backdrop)
function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('star-modal')) {
    closeStarModal();
  }
}

// =============================================
// INIT — Start everything
// =============================================
document.body.classList.add('dino-active');

// In QR Gift Mode: skip dino, go straight to swiper
if (window.QR_GIFT_MODE) {
  document.body.classList.remove('dino-active');
  const dino = document.getElementById('scene-dino');
  if (dino) dino.style.display = 'none';
}

initNavDots();
initArrowButtons();
initSwiper();

// After swiper init: activate QR gift chamber if needed
if (window.QR_GIFT_MODE && typeof window.initGiftChamber === 'function') {
  window.initGiftChamber(swiper);
}

// Reveal elements in initial active slide after swiper init
setTimeout(() => {
  if (swiper && swiper.slides[swiper.activeIndex]) {
    revealSlideElements(swiper.slides[swiper.activeIndex]);
  }
}, 100);

// Skip dino button (dev helper — hidden in QR mode)
if (!window.QR_GIFT_MODE) {
  const skipLink = document.createElement('div');
  skipLink.innerHTML = '<span style="position:fixed;bottom:16px;right:16px;z-index:11000;font-size:11px;color:#888;cursor:pointer;font-family:monospace;letter-spacing:1px;background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:20px" onclick="document.getElementById(\'scene-dino\').style.display=\'none\';document.body.classList.remove(\'dino-active\');">skip →</span>';
  document.body.appendChild(skipLink);
}

console.log('🌸 Happy Birthday Thảo! Made with love by Đạt 🩷');
