/* platformer.js — Full standalone platformer game logic */
/* Depends on: platformer.css + HTML structure in birthday_thao.html   */

(function () {
  'use strict';

  // ── Canvas & Ctx ──────────────────────────────────────────────
  const canvas  = document.getElementById('platformer-canvas');
  const ctx     = canvas.getContext('2d');

  // Game logical resolution (pixel-art style)
  const GW = 800, GH = 340;
  canvas.width  = GW;
  canvas.height = GH;

  // ── Firework canvas (inside slide) ───────────────────────────
  const fwCanvas = document.getElementById('plat-firework-canvas');
  const fwCtx    = fwCanvas.getContext('2d');
  let fwParticles = [], fwRunning = false;

  function resizeFwCanvas() {
    const slide = document.getElementById('slide-platformer');
    fwCanvas.width  = slide.offsetWidth  || window.innerWidth;
    fwCanvas.height = slide.offsetHeight || window.innerHeight;
  }

  // ── Constants ─────────────────────────────────────────────────
  const GRAVITY      = 0.55;
  const JUMP_FORCE   = -13;
  const PLAYER_W     = 28;
  const PLAYER_H     = 36;
  const GROUND_Y     = GH - 48; // pixel-art ground line
  const SCROLL_SPEED = 2.6;
  const LEVEL_LENGTH = 9000; // total world px

  // Colors
  const COL = {
    sky1:      '#1a0533',
    sky2:      '#0d1b4a',
    ground:    '#3d1f6e',
    groundTop: '#6a35b8',
    platform:  '#4a2080',
    platTop:   '#8855cc',
    player:    '#ff85b8',
    playerOut: '#cc3377',
    playerHair:'#3d0022',
    playerEye: '#ffffff',
    boy:       '#5599ff',
    boyOut:    '#2255cc',
    boyHair:   '#1a1a4a',
    boyFlower: '#ff9900',
    obsDeadline: '#e63946',
    obsMoney:    '#f4a261',
    obsRain:     '#457b9d',
    textWhite:   '#ffffff',
    shadow:      'rgba(0,0,0,0.4)',
    star:        '#d4b8ff',
  };

  // ── State ─────────────────────────────────────────────────────
  let gameState = 'idle'; // idle | running | dead | win
  let cameraX   = 0;
  let lives     = 3;
  let frameCount = 0;
  let animId;

  // ── Player ────────────────────────────────────────────────────
  const player = {
    x: 80, y: GROUND_Y - PLAYER_H,
    vx: 0, vy: 0,
    onGround: false,
    facingRight: true,
    walkFrame: 0,
    deathAnim: 0,
  };

  // ── Keys ──────────────────────────────────────────────────────
  const keys = { left: false, right: false, jump: false };
  let jumpPressed = false;

  // ── World generation ─────────────────────────────────────────
  let platforms = [];
  let obstacles = [];
  let stars     = [];
  let bgClouds  = [];

  const OBSTACLE_DEFS = [
    { label: 'Deadline',         col: COL.obsDeadline, outCol: '#991e28' },
    { label: 'Cơm áo gạo tiền', col: COL.obsMoney,    outCol: '#b06020' },
    { label: 'Mưa nắng',        col: COL.obsRain,      outCol: '#1a4a6e' },
  ];

  function buildLevel() {
    platforms = [];
    obstacles = [];
    stars     = [];
    bgClouds  = [];

    // ── Ground (one long slab) ──
    platforms.push({ x: 0, y: GROUND_Y, w: LEVEL_LENGTH, h: GH - GROUND_Y, type: 'ground' });

    // ── Gap zones + elevated platforms ──
    const platData = [
      { x: 900,  y: GROUND_Y - 70,  w: 130 },
      { x: 1150, y: GROUND_Y - 120, w: 120 },
      { x: 1420, y: GROUND_Y - 70,  w: 150 },
      { x: 1750, y: GROUND_Y - 100, w: 110 },
      { x: 2050, y: GROUND_Y - 70,  w: 140 },
      { x: 2350, y: GROUND_Y - 130, w: 120 },
      { x: 2700, y: GROUND_Y - 80,  w: 130 },
      { x: 3050, y: GROUND_Y - 60,  w: 160 },
      { x: 3350, y: GROUND_Y - 110, w: 120 },
      { x: 3650, y: GROUND_Y - 80,  w: 130 },
    ];
    platData.forEach(p => platforms.push({ ...p, h: 18, type: 'platform' }));

    // ── Obstacles (on ground) ──
    const obsPositions = [
      350, 580, 780, 1050, 1300, 1600, 1880, 2150,
      2400, 2650, 2900, 3100, 3350, 3600, 3850,
    ];
    obsPositions.forEach((x, i) => {
      const def = OBSTACLE_DEFS[i % OBSTACLE_DEFS.length];
      const w = 52, h = 52;
      obstacles.push({
        x, y: GROUND_Y - h, w, h,
        label:  def.label,
        col:    def.col,
        outCol: def.outCol,
      });
    });

    // ── Stars (bg decoration) ──
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * LEVEL_LENGTH,
        y: Math.random() * (GROUND_Y - 60),
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // ── Background clouds ──
    for (let i = 0; i < 18; i++) {
      bgClouds.push({
        x: Math.random() * LEVEL_LENGTH,
        y: 30 + Math.random() * 80,
        w: 60 + Math.random() * 80,
        alpha: 0.04 + Math.random() * 0.07,
      });
    }
  }

  // Boy NPC (end flag)
  const boy = { x: LEVEL_LENGTH - 120, y: GROUND_Y - 56, w: 30, h: 56, waveFrame: 0 };

  // ── Reset ─────────────────────────────────────────────────────
  function resetPlayer() {
    player.x  = 80;
    player.y  = GROUND_Y - PLAYER_H;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.facingRight = true;
    player.walkFrame = 0;
    player.deathAnim = 0;
    cameraX = 0;
  }

  function startGame() {
    buildLevel();
    resetPlayer();
    lives = 3;
    gameState = 'running';
    frameCount = 0;
    fwRunning = false;
    updateHUD();

    // Hide overlay
    const overlay = document.getElementById('plat-start-overlay');
    overlay.classList.add('hidden');

    // Hide win modal
    const winModal = document.getElementById('plat-win-modal');
    winModal.classList.remove('active');

    cancelAnimationFrame(animId);
    loop();
  }

  function die() {
    lives--;
    updateHUD();
    gameState = 'dead';
    player.deathAnim = 0;

    setTimeout(() => {
      if (lives <= 0) {
        // Game over — show overlay again
        const overlay = document.getElementById('plat-start-overlay');
        const msg = document.querySelector('.plat-gameover-msg');
        msg.style.display = 'block';
        overlay.classList.remove('hidden');
        gameState = 'idle';
      } else {
        resetPlayer();
        gameState = 'running';
        cancelAnimationFrame(animId);
        loop();
      }
    }, 900);
  }

  function triggerWin() {
    gameState = 'win';
    cancelAnimationFrame(animId);

    // Start fireworks
    fwRunning = true;
    resizeFwCanvas();
    launchPlatFireworks();

    // Show win modal after short delay
    setTimeout(() => {
      document.getElementById('plat-win-modal').classList.add('active');
    }, 800);
  }

  // ── Fireworks ────────────────────────────────────────────────
  function launchPlatFireworks() {
    if (!fwRunning) return;
    // Spawn burst every 400ms
    spawnFwBurst();
    setTimeout(() => { if (fwRunning) spawnFwBurst(); }, 300);
    setTimeout(() => { if (fwRunning) spawnFwBurst(); }, 600);
    // Loop
    function fwLoop() {
      if (!fwRunning) return;
      fwCtx.fillStyle = 'rgba(5,0,20,0.18)';
      fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
      fwParticles = fwParticles.filter(p => p.life > 0);
      fwParticles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.life--;
        const a = p.life / p.maxLife;
        fwCtx.globalAlpha = a;
        fwCtx.fillStyle = p.col;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fwCtx.fill();
      });
      fwCtx.globalAlpha = 1;
      if (Math.random() < 0.06) spawnFwBurst();
      requestAnimationFrame(fwLoop);
    }
    fwLoop();
  }

  function spawnFwBurst() {
    const x = 80 + Math.random() * (fwCanvas.width - 160);
    const y = 60 + Math.random() * (fwCanvas.height * 0.55);
    const cols = ['#ff85b8','#c97bff','#ffdd57','#5ce1ff','#ff6b6b','#7cffc4','#ffb3c6'];
    const col = cols[Math.floor(Math.random() * cols.length)];
    for (let i = 0; i < 55; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 1.5 + Math.random() * 4.5;
      const life   = 45 + Math.floor(Math.random() * 40);
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  1.2 + Math.random() * 2.5,
        col,
        life,
        maxLife: life,
      });
    }
  }

  // ── HUD Update ────────────────────────────────────────────────
  function updateHUD() {
    const livesEl = document.querySelector('.plat-hud-lives');
    if (!livesEl) return;
    livesEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.textContent = i < lives ? '🩷' : '🖤';
      livesEl.appendChild(heart);
    }
  }

  // ── Collision helpers ─────────────────────────────────────────
  function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ── Physics update ───────────────────────────────────────────
  function updatePlayer() {
    if (gameState !== 'running') return;

    // Horizontal
    const speed = 3.8;
    if (keys.right) { player.vx = speed; player.facingRight = true; }
    else if (keys.left) { player.vx = -speed; player.facingRight = false; }
    else { player.vx *= 0.6; }

    // Jump
    if (keys.jump && player.onGround) {
      player.vy    = JUMP_FORCE;
      player.onGround = false;
    }
    keys.jump = false; // consume

    // Gravity
    player.vy += GRAVITY;

    // Tentative positions
    let nx = player.x + player.vx;
    let ny = player.y + player.vy;

    player.onGround = false;

    // Platform collisions
    for (const plat of platforms) {
      // Landing from above
      if (
        player.vx >= -speed && // not moving through wall weirdly
        player.x + PLAYER_W > plat.x &&
        player.x < plat.x + plat.w &&
        ny + PLAYER_H >= plat.y &&
        ny + PLAYER_H <= plat.y + plat.h + 12 &&
        player.vy >= 0
      ) {
        ny = plat.y - PLAYER_H;
        player.vy = 0;
        player.onGround = true;
      }
    }

    // Clamp left
    if (nx < 0) nx = 0;

    // Camera follows
    const camTarget = nx - GW * 0.3;
    cameraX = Math.max(0, Math.min(LEVEL_LENGTH - GW, camTarget));

    player.x = nx;
    player.y = ny;

    // Walk frame
    if (Math.abs(player.vx) > 0.5) player.walkFrame++;

    // Fell off screen
    if (player.y > GH + 60) die();

    // Obstacle collision
    for (const obs of obstacles) {
      if (rectOverlap(player.x + 4, player.y + 4, PLAYER_W - 8, PLAYER_H - 8, obs.x, obs.y, obs.w, obs.h)) {
        die();
        return;
      }
    }

    // Boy collision (win)
    if (rectOverlap(player.x + 2, player.y + 2, PLAYER_W - 4, PLAYER_H - 4, boy.x, boy.y, boy.w, boy.h)) {
      triggerWin();
    }
  }

  // ── Draw helpers ──────────────────────────────────────────────

  function drawBg() {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GH);
    grad.addColorStop(0,   '#1a0533');
    grad.addColorStop(0.6, '#2d0b4e');
    grad.addColorStop(1,   '#0d1b4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GW, GH);
  }

  function drawStars() {
    const t = frameCount * 0.02;
    for (const s of stars) {
      const sx = s.x - cameraX;
      if (sx < -10 || sx > GW + 10) continue;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(t + s.twinkleOffset));
      ctx.globalAlpha = a;
      ctx.fillStyle = COL.star;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawClouds() {
    for (const c of bgClouds) {
      const cx = c.x - cameraX * 0.2; // parallax
      if (cx + c.w < 0 || cx > GW) continue;
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, c.y, c.w, c.w * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlatforms() {
    for (const p of platforms) {
      const px = p.x - cameraX;
      if (px + p.w < 0 || px > GW) continue;
      if (p.type === 'ground') {
        // Ground fill
        ctx.fillStyle = COL.ground;
        ctx.fillRect(px, p.y, p.w, p.h);
        // Top strip
        ctx.fillStyle = COL.groundTop;
        ctx.fillRect(px, p.y, p.w, 6);
        // Pixel dots
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        for (let i = 0; i < p.w; i += 20) {
          ctx.fillRect(px + i, p.y + 10, 8, 3);
        }
      } else {
        // Floating platform
        ctx.fillStyle = COL.platform;
        ctx.fillRect(px, p.y, p.w, p.h);
        ctx.fillStyle = COL.platTop;
        ctx.fillRect(px, p.y, p.w, 4);
        // little shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px, p.y + p.h, p.w, 4);
      }
    }
  }

  function drawObstacle(obs) {
    const ox = obs.x - cameraX;
    if (ox + obs.w < -10 || ox > GW + 10) return;

    // Bounce animation
    const bounce = Math.sin(frameCount * 0.07 + obs.x) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ox + obs.w / 2, obs.y + obs.h + 2 - bounce, obs.w * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Block body
    ctx.fillStyle = obs.col;
    ctx.fillRect(ox, obs.y - bounce, obs.w, obs.h);

    // Outline
    ctx.strokeStyle = obs.outCol;
    ctx.lineWidth = 3;
    ctx.strokeRect(ox + 1.5, obs.y + 1.5 - bounce, obs.w - 3, obs.h - 3);

    // Danger glow
    ctx.shadowColor = obs.col;
    ctx.shadowBlur  = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(ox + 3, obs.y + 3 - bounce, obs.w - 6, obs.h - 6);
    ctx.shadowBlur  = 0;

    // Text label — wrapped
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 4;
    ctx.font = 'bold 8px "Space Mono", monospace';
    ctx.textAlign = 'center';
    const words = obs.label.split(' ');
    const lineH = 11;
    const startY = obs.y - bounce + obs.h / 2 - (words.length - 1) * lineH / 2 + 3;
    words.forEach((w, i) => {
      ctx.fillText(w, ox + obs.w / 2, startY + i * lineH);
    });
    ctx.restore();
  }

  // Pixel-art girl character
  function drawPlayer() {
    const px = player.x - cameraX;
    const py = player.y;

    if (gameState === 'dead') {
      // Spin death anim
      player.deathAnim++;
      ctx.save();
      ctx.translate(px + PLAYER_W / 2, py + PLAYER_H / 2);
      ctx.rotate(player.deathAnim * 0.15);
      ctx.globalAlpha = Math.max(0, 1 - player.deathAnim / 35);
      drawGirlPixels(0 - PLAYER_W / 2, 0 - PLAYER_H / 2);
      ctx.restore();
      return;
    }

    ctx.save();
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.translate(-GW, 0);
      drawGirlPixels(GW - px - PLAYER_W, py);
    } else {
      drawGirlPixels(px, py);
    }
    ctx.restore();
  }

  function drawGirlPixels(x, y) {
    const w = PLAYER_W, h = PLAYER_H;
    // Body
    ctx.fillStyle = COL.player;
    ctx.fillRect(x + 4, y + 14, w - 8, h - 14);
    // Outline body
    ctx.strokeStyle = COL.playerOut;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 14, w - 8, h - 14);

    // Skirt flare
    ctx.fillStyle = '#ff6da7';
    ctx.fillRect(x + 2, y + h - 14, w - 4, 8);
    ctx.strokeStyle = '#cc2255';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + h - 14, w - 4, 8);

    // Head
    ctx.fillStyle = COL.player;
    ctx.fillRect(x + 5, y, w - 10, 16);
    ctx.strokeStyle = COL.playerOut;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y, w - 10, 16);

    // Hair
    ctx.fillStyle = COL.playerHair;
    ctx.fillRect(x + 4, y, w - 8, 6);
    // Side hair
    ctx.fillRect(x + 3, y + 4, 4, 10);
    ctx.fillRect(x + w - 7, y + 4, 4, 10);

    // Eyes
    ctx.fillStyle = COL.playerEye;
    ctx.fillRect(x + 8, y + 7, 4, 4);
    ctx.fillRect(x + 16, y + 7, 4, 4);
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(x + 9, y + 8, 2, 2);
    ctx.fillRect(x + 17, y + 8, 2, 2);

    // Blush
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ff4499';
    ctx.fillRect(x + 6, y + 11, 3, 2);
    ctx.fillRect(x + 19, y + 11, 3, 2);
    ctx.globalAlpha = 1;

    // Legs — animated when walking
    const legAlt = Math.floor(player.walkFrame / 5) % 2;
    ctx.fillStyle = '#cc3377';
    ctx.fillRect(x + 6,  y + h - 8, 7, legAlt === 0 ? 9 : 6);
    ctx.fillRect(x + 15, y + h - 8, 7, legAlt === 0 ? 6 : 9);
    // Shoes
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(x + 5,  y + h - (legAlt === 0 ? 0 : 3), 9, 3);
    ctx.fillRect(x + 14, y + h - (legAlt === 0 ? 3 : 0), 9, 3);
  }

  // Pixel-art boy NPC holding flowers
  function drawBoy() {
    const bx = boy.x - cameraX;
    if (bx + boy.w < -40 || bx > GW + 40) return;

    boy.waveFrame++;
    const waveOffset = Math.sin(boy.waveFrame * 0.08) * 5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(bx + 15, boy.y + boy.h + 2, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#2233aa';
    ctx.fillRect(bx + 4, boy.y + boy.h - 14, 8, 14);
    ctx.fillRect(bx + 18, boy.y + boy.h - 14, 8, 14);
    // Shoes
    ctx.fillStyle = '#111';
    ctx.fillRect(bx + 3,  boy.y + boy.h - 2, 10, 4);
    ctx.fillRect(bx + 17, boy.y + boy.h - 2, 10, 4);

    // Body / shirt
    ctx.fillStyle = COL.boy;
    ctx.fillRect(bx + 3, boy.y + 14, 24, boy.h - 28);
    ctx.strokeStyle = COL.boyOut;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 3, boy.y + 14, 24, boy.h - 28);

    // Head
    ctx.fillStyle = '#f5c5a0';
    ctx.fillRect(bx + 5, boy.y, 20, 16);
    ctx.strokeStyle = '#c8956e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 5, boy.y, 20, 16);

    // Hair
    ctx.fillStyle = COL.boyHair;
    ctx.fillRect(bx + 4, boy.y, 22, 7);
    ctx.fillRect(bx + 3, boy.y + 4, 4, 6);

    // Eyes
    ctx.fillStyle = '#111';
    ctx.fillRect(bx + 8, boy.y + 8, 3, 3);
    ctx.fillRect(bx + 18, boy.y + 8, 3, 3);

    // Smile
    ctx.strokeStyle = '#c8956e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx + 15, boy.y + 13, 4, 0, Math.PI);
    ctx.stroke();

    // Arm holding flowers (waving)
    ctx.fillStyle = '#5599ff';
    ctx.fillRect(bx - 5 + waveOffset, boy.y + 16, 10, 6);

    // Flower bouquet
    const fx = bx - 12 + waveOffset;
    const fy = boy.y + 4;
    // Stems
    ctx.strokeStyle = '#2d6a2d';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(fx + 8 + i * 4, fy + 22);
      ctx.lineTo(fx + 6 + i * 4, fy + 10);
      ctx.stroke();
    }
    // Flowers
    const flowerCols = ['#ff4499', '#ff9900', '#ff85b8'];
    flowerCols.forEach((fc, i) => {
      const ox = fx + 6 + i * 4;
      const oy = fy + 6 + (i % 2) * (-3);
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        ctx.fillStyle = fc;
        ctx.beginPath();
        ctx.ellipse(ox + Math.cos(angle) * 4, oy + Math.sin(angle) * 4, 3, 2, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Heart float above boy
    const heartAlpha = 0.5 + 0.5 * Math.sin(boy.waveFrame * 0.07);
    ctx.globalAlpha = heartAlpha;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🩷', bx + 15, boy.y - 10 + Math.sin(boy.waveFrame * 0.05) * 4);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // "Đích đến" arrow + label
    ctx.save();
    ctx.fillStyle = '#ffdd57';
    ctx.shadowColor = '#ffdd57';
    ctx.shadowBlur = 8;
    ctx.font = 'bold 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 ĐÍCH', bx + 15, boy.y - 22);
    ctx.restore();
  }

  // Distance marker (progress bar in-game)
  function drawProgressBar() {
    const maxX = LEVEL_LENGTH - 200;
    const pct  = Math.min(1, player.x / maxX);
    const barW = GW - 40;
    const barX = 20;
    const barY = 8;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(barX, barY, barW, 6);

    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0,   '#c97bff');
    grad.addColorStop(0.5, '#ff85b8');
    grad.addColorStop(1,   '#ffdd57');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * pct, 6);

    // Marker
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🏃‍♀️', barX + barW * pct - 6, barY - 1);
  }

  // ── Main loop ─────────────────────────────────────────────────
  function loop() {
    frameCount++;
    updatePlayer();

    // ── Draw ──
    drawBg();
    drawStars();
    drawClouds();
    drawPlatforms();
    obstacles.forEach(o => drawObstacle(o));
    drawBoy();

    if (gameState !== 'idle') {
      drawPlayer();
      drawProgressBar();
    }

    if (gameState === 'running' || gameState === 'dead') {
      animId = requestAnimationFrame(loop);
    }
  }

  // ── Keyboard controls ─────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (gameState !== 'running') return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') keys.left  = true;
    if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !jumpPressed) {
      jumpPressed  = true;
      keys.jump    = true;
    }
    // Prevent page scroll when game is running
    if (['ArrowUp','ArrowDown','Space'].includes(e.code)) {
      const slide = document.getElementById('slide-platformer');
      const rect  = slide?.getBoundingClientRect();
      if (rect && rect.top === 0) e.preventDefault();
    }
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') keys.left  = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      jumpPressed = false;
    }
  });

  // ── Mobile buttons ────────────────────────────────────────────
  function bindMobileBtn(id, keyName) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const press = () => {
      if (gameState !== 'running') return;
      if (keyName === 'jump') { keys.jump = true; }
      else { keys[keyName] = true; }
    };
    const release = () => {
      if (keyName !== 'jump') keys[keyName] = false;
    };
    btn.addEventListener('touchstart', e => { e.preventDefault(); press(); }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); release(); }, { passive: false });
    btn.addEventListener('mousedown',  press);
    btn.addEventListener('mouseup',    release);
  }

  bindMobileBtn('plat-btn-left',  'left');
  bindMobileBtn('plat-btn-right', 'right');
  bindMobileBtn('plat-btn-jump',  'jump');

  // ── Start button ──────────────────────────────────────────────
  const startBtn = document.getElementById('plat-start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  const replayBtn = document.getElementById('plat-win-replay-btn');
  if (replayBtn) replayBtn.addEventListener('click', startGame);

  // ── Prevent Swiper scroll when game active ────────────────────
  canvas.addEventListener('wheel', e => { e.stopPropagation(); }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    if (gameState === 'running') e.stopPropagation();
  }, { passive: true });

  // ── Initial static draw ───────────────────────────────────────
  buildLevel();
  resetPlayer();
  frameCount = 0;
  cameraX = 0;

  drawBg();
  drawStars();
  drawClouds();
  drawPlatforms();
  obstacles.forEach(o => drawObstacle(o));
  drawBoy();
  drawPlayer();

  updateHUD();

  // ── Decorative bg stars for the slide div ────────────────────
  (function addBgStars() {
    const slide = document.getElementById('slide-platformer');
    if (!slide) return;
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'plat-star';
      star.style.left  = Math.random() * 100 + '%';
      star.style.top   = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 3) + 's';
      star.style.animationDuration = (2 + Math.random() * 3) + 's';
      slide.appendChild(star);
    }
  })();

  // Expose startGame globally for start-btn onclick fallback
  window.platStartGame = startGame;

})();
