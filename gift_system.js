'use strict';
// =============================================
// QR GIFT SYSTEM — gift_system.js
// Chạy TRƯỚC script.js để set window.QR_GIFT_MODE
// =============================================

// ── Cấu hình 4 món quà ──────────────────────
const GIFT_CONFIG = {
  1: {
    token: 'vutru22',
    slideIndex: 2,                   // Galaxy slide (swiper index 2)
    title: 'Vũ trụ của Em',
    emoji: '🌌',
    subtitle: 'Có một bất ngờ đang đợi em ở phía bên kia vũ trụ...',
    question: 'Bài hát nào trong playlist của chúng mình — anh hay nghĩ đến em mỗi khi nghe? (Gõ tên bài bằng tiếng Anh)',
    hint: '💡 Chỉ 1 từ thôi — và nó nói lên mọi thứ 🎵',
    // So sánh case-insensitive, bỏ dấu space thừa
    answers: ['nothing'],
    revealType: 'video',
    videoSrc: '90356.mp4',   // ← đặt file mp4 cùng thư mục với tên này
    giftName: '🌍 Video bí mật từ khắp nơi trên thế giới',
    blessing:
      `Tình yêu anh dành cho em —
không có biên giới.

Không phân biệt ngôn ngữ, không phân biệt màu da,
không phân biệt khoảng cách hay vũ trụ nào hết.

Vũ trụ này rộng lớn thật...
nhưng trái tim anh chỉ có một chỗ duy nhất —
và đó là chỗ của em. 🌌

Chúc mừng sinh nhật Thảo yêu 🩷`,
  },

  2: {
    token: 'vuonhoa22',
    slideIndex: 3,                   // Garden slide (swiper index 3)
    title: 'Vườn hoa tình yêu',
    emoji: '🌸',
    subtitle: 'Một bông hoa được làm từ chính đôi tay anh — dành riêng cho em',
    question: 'Món quà đầu tiên anh tặng em là gì, và có bao nhiêu cái?',
    hint: '💡 Nhỏ xíu, màu hồng, dễ thương yêu — và số đó em không bao giờ được quên nhé 🧸',
    answers: ['6', 'sáu', '6 con loopy', 'sáu con loopy', '6 loopy', 'loopy'],
    revealType: 'flower',
    giftName: '🌹 Bông hoa tự tay anh làm tặng em',
    blessing:
      `Anh không giỏi vẽ,
cũng không giỏi thủ công lắm.

Nhưng bông hoa này —
anh đã làm với tất cả sự nghiêm túc
và tình yêu thật sự.

Mỗi cánh hoa là một điều
anh trân trọng ở em.

Em xứng đáng nhận được tất cả
những bông hoa đẹp nhất trên đời.
Và bông hoa nhỏ này —
dù giản dị thôi — nhưng là từ trái tim anh. 🌸`,
  },

  3: {
    token: 'bimo22',
    slideIndex: 0,                   // Hero slide — placeholder cho section sau
    title: 'Bí mật #3',
    emoji: '🎀',
    subtitle: 'Sắp được tiết lộ thôi...',
    question: 'Người đã làm trang web này tên là gì?',
    hint: '💡 Em biết anh ấy rồi đó 😏',
    answers: ['đạt', 'dat', 'nguyen dat', 'nguyễn đạt'],
    revealType: 'text',
    giftName: '🎀 Quà đặc biệt #3',
    blessing:
      `Món quà này đang được chuẩn bị...
Dành tặng em thật đặc biệt.

Đợi anh một chút nhé em 🎀`,
  },

  4: {
    token: 'finale22',
    slideIndex: 7,                   // Finale slide
    title: 'Bí mật cuối cùng',
    emoji: '✨',
    subtitle: 'Điều bí ẩn cuối của ngày hôm nay...',
    question: 'Em lần đầu tiên biết đến anh vào tháng mấy năm nào?',
    hint: '💡 Cũng là tháng đặc biệt của chúng mình 🌃',
    answers: ['tháng 10', 'tháng 10 2024', '10', 'october', 'october 2024'],
    revealType: 'text',
    giftName: '✨ Lời nhắn đặc biệt',
    blessing:
      `Dù thế giới có rộng đến đâu,
dù thời gian có dài đến đâu —

anh luôn biết ơn tháng 10 đó
đã đưa em đến bên anh.

Chúc sinh nhật em yêu, Thảo ✨
— Đạt 🩷`,
  },
};

// ── Parse URL params ─────────────────────────
(function detectQRMode() {
  const params = new URLSearchParams(window.location.search);
  const giftNum = parseInt(params.get('gift'), 10);
  const token = (params.get('t') || '').trim();

  if (!giftNum || !GIFT_CONFIG[giftNum]) return;
  if (GIFT_CONFIG[giftNum].token !== token) return;

  // Flag toàn cục — script.js sẽ đọc trước khi init
  window.QR_GIFT_MODE = true;
  window.QR_GIFT_NUM = giftNum;
  window.QR_GIFT_DATA = GIFT_CONFIG[giftNum];
})();

// ── State ────────────────────────────────────
let _gcPhase = 0;   // 0=question, 1=opening, 2=reveal
let _gcSwiperRef = null;
let _gcSparkles = [];

// ── Entry point — gọi từ script.js sau khi swiper sẵn sàng ──
window.initGiftChamber = function (swiperInstance) {
  if (!window.QR_GIFT_MODE) return;
  _gcSwiperRef = swiperInstance;
  const gift = window.QR_GIFT_DATA;

  // Lock + Jump
  _lockSwiper(swiperInstance, gift.slideIndex);

  // Show chamber sau 1.2s (để warp / transition kịp xong)
  setTimeout(() => {
    _buildChamber(gift);
    _spawnSparkles();
    setTimeout(() => {
      const chamber = document.getElementById('gift-chamber');
      if (chamber) chamber.classList.add('gc-visible');
    }, 80);
  }, 1200);
};

// ── Lock Swiper & jump đến đúng slide ────────
function _lockSwiper(swiper, targetIndex) {
  // Tắt toàn bộ input của swiper
  if (swiper.mousewheel) swiper.mousewheel.disable();
  if (swiper.keyboard) swiper.keyboard.disable();
  swiper.allowTouchMove = false;
  swiper.allowSlidePrev = false;
  swiper.allowSlideNext = false;

  // Jump đến đúng slide ngay lập tức (speed=0)
  swiper.slideTo(targetIndex, 0);

  // Ẩn nav / arrows
  document.body.classList.add('qr-gift-mode');
}

// ── Build DOM cho gift chamber ────────────────
function _buildChamber(gift) {
  // Xóa chamber cũ nếu có
  const existing = document.getElementById('gift-chamber');
  if (existing) existing.remove();

  const chamber = document.createElement('div');
  chamber.id = 'gift-chamber';

  chamber.innerHTML = `
    <!-- PHASE 1: Question -->
    <div class="gc-phase" id="gc-phase-q">
      <!-- 3D Gift Box -->
      <div class="gc-box-wrap">
        <div class="gc-box-3d" id="gc-box-3d">
          <div class="gc-box-bow">🎀</div>
          <div class="gc-box-lid" id="gc-lid"></div>
          <div class="gc-box-body"></div>
        </div>
      </div>

      <!-- Title -->
      <h2 class="gc-title">
        ${gift.emoji} ${gift.title}
        <span class="gc-num-badge">${window.QR_GIFT_NUM}</span>
      </h2>
      <p class="gc-subtitle">${gift.subtitle}</p>

      <!-- Question card -->
      <div class="gc-q-card" id="gc-q-card">
        <p class="gc-q-label">✦ câu hỏi bí mật ✦</p>
        <p class="gc-q-text">${gift.question}</p>
        <p class="gc-q-hint">${gift.hint}</p>
        <input
          class="gc-answer-input"
          id="gc-ans-input"
          type="text"
          placeholder="Nhập đáp án của em..."
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        >
        <button class="gc-unlock-btn" id="gc-unlock-btn" onclick="gcSubmitAnswer()">
          🔓 Mở quà
        </button>
        <p class="gc-error-msg" id="gc-err">Chưa đúng rồi em ơi~ Thử lại nhé 💕</p>
      </div>
    </div>

    <!-- PHASE 2: Opening animation (hidden initially) -->
    <div class="gc-phase gc-phase-hidden" id="gc-phase-opening">
      <div class="gc-opening-content">
        <div class="gc-opening-box-wrap" id="gc-opening-box-wrap">
          <div class="gc-box-3d">
            <div class="gc-box-bow">🎀</div>
            <div class="gc-box-lid lid-open" id="gc-lid-open"></div>
            <div class="gc-box-body"></div>
          </div>
        </div>
        <p class="gc-opening-text" id="gc-opening-text">✨ Mở ra nhé... ✨</p>
      </div>
    </div>

    <!-- PHASE 3: Reveal (hidden initially) -->
    <div class="gc-phase gc-phase-hidden" id="gc-phase-reveal">
      <div class="gc-reveal-wrap" id="gc-reveal-wrap"></div>
    </div>

    <!-- Burst layer -->
    <div id="gc-burst-layer"></div>
  `;

  document.body.appendChild(chamber);

  // Enter key submit
  const inp = document.getElementById('gc-ans-input');
  if (inp) {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') gcSubmitAnswer();
    });
  }
}

// ── Submit answer ────────────────────────────
window.gcSubmitAnswer = function () {
  const inp = document.getElementById('gc-ans-input');
  const errEl = document.getElementById('gc-err');
  const card = document.getElementById('gc-q-card');
  if (!inp) return;

  const val = inp.value.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // bỏ dấu để so sánh nhẹ hơn
  const answers = window.QR_GIFT_DATA.answers.map(a =>
    a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );

  if (answers.includes(val)) {
    _onCorrectAnswer();
  } else {
    // Shake + error
    if (errEl) { errEl.classList.add('gc-err-show'); }
    if (card) {
      card.classList.add('gc-shaking');
      setTimeout(() => card.classList.remove('gc-shaking'), 600);
    }
    inp.style.borderColor = '#E8637A';
    setTimeout(() => { if (inp) inp.style.borderColor = ''; }, 1200);

    // Rung nhẹ
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  }
};

// ── Correct answer flow ──────────────────────
function _onCorrectAnswer() {
  // Đóng lid trên phase 1
  const lid1 = document.getElementById('gc-lid');
  if (lid1) lid1.classList.add('lid-open');

  // Muted confetti
  _burstParticles();

  setTimeout(() => {
    // Chuyển sang phase 2 (opening)
    _switchPhase(1);
    setTimeout(() => {
      // Chuyển sang phase 3 (reveal)
      _switchPhase(2);
      _buildReveal(window.QR_GIFT_DATA);
    }, 2000);
  }, 600);
}

// ── Switch phase ─────────────────────────────
function _switchPhase(phaseIdx) {
  _gcPhase = phaseIdx;
  const phaseIds = ['gc-phase-q', 'gc-phase-opening', 'gc-phase-reveal'];
  phaseIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i === phaseIdx) {
      el.classList.remove('gc-phase-hidden');
      // Reset animation
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    } else {
      el.classList.add('gc-phase-hidden');
    }
  });
}

// ── Build reveal content ─────────────────────
function _buildReveal(gift) {
  const wrap = document.getElementById('gc-reveal-wrap');
  if (!wrap) return;

  let contentHtml = '';

  if (gift.revealType === 'video') {
    contentHtml = `
      <div class="gc-video-wrap">
        <video controls autoplay playsinline loop>
          <source src="${gift.videoSrc}" type="video/mp4">
          Trình duyệt không hỗ trợ video. Vui lòng cập nhật nhé em!
        </video>
      </div>
    `;
  } else if (gift.revealType === 'flower') {
    contentHtml = `<div class="gc-flower-scene">${_buildFlowerHTML()}</div>`;
  } else {
    contentHtml = `<div style="font-size:72px;text-align:center;">${gift.emoji}</div>`;
  }

  wrap.innerHTML = `
    <p class="gc-reveal-badge">✦ quà của em ✦</p>
    <h3 class="gc-reveal-name">${gift.giftName}</h3>
    ${contentHtml}
    <p class="gc-blessing">${gift.blessing}</p>
    <button class="gc-close-btn" onclick="gcCloseChamber()">
      🩷 Cảm ơn anh — Đóng lại
    </button>
  `;
}

// ── CSS Animated Flower HTML ─────────────────
function _buildFlowerHTML() {
  // Stem + leaves + hub + 8 outer petals + 8 inner petals + center + glow + dew
  return `
    <div class="gcf-stem"></div>
    <div class="gcf-leaf leaf-l"></div>
    <div class="gcf-leaf leaf-r"></div>
    <div class="gcf-hub">
      <!-- 8 outer petals -->
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <div class="gcf-petal"></div>
      <!-- 8 inner petals -->
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <div class="gcf-petal-inner"></div>
      <!-- Center -->
      <div class="gcf-center">🩷</div>
      <!-- Glow ring -->
      <div class="gcf-glow"></div>
      <!-- Dewdrops -->
      <div class="gcf-dew"></div>
      <div class="gcf-dew"></div>
      <div class="gcf-dew"></div>
    </div>
  `;
}

// ── Burst particles ───────────────────────────
function _burstParticles() {
  const layer = document.getElementById('gc-burst-layer');
  if (!layer) return;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const EMOJIS = ['🌸', '✨', '🩷', '🌷', '⭐', '💫', '🌟'];
  const COLORS = ['#FFB3C6', '#FF8FAB', '#E8637A', '#F7D794', '#fff'];

  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 / 36) * i + (Math.random() - 0.5) * 0.5;
    const dist = 120 + Math.random() * 220;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const size = 8 + Math.random() * 12;

    if (Math.random() < 0.35) {
      // Emoji particle
      p.style.cssText = `
        position:absolute;
        left:${cx}px; top:${cy}px;
        font-size:${14 + Math.random() * 10}px;
        animation: gcBurstOut ${0.9 + Math.random() * 0.8}s ease-out ${Math.random() * 0.2}s forwards;
        --tx:${tx}px; --ty:${ty}px;
        pointer-events:none;
      `;
      p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    } else {
      // Dot particle
      p.className = 'gc-burst-p';
      p.style.cssText = `
        left:${cx - size / 2}px; top:${cy - size / 2}px;
        width:${size}px; height:${size}px;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${Math.random() * 0.25}s;
        animation-duration:${1.0 + Math.random() * 0.7}s;
        opacity:0.9;
      `;
    }

    layer.appendChild(p);
    setTimeout(() => p.remove(), 2400);
  }
}

// ── Close chamber ─────────────────────────────
window.gcCloseChamber = function () {
  const chamber = document.getElementById('gift-chamber');
  if (chamber) {
    chamber.style.opacity = '0';
    chamber.style.pointerEvents = 'none';
    setTimeout(() => {
      chamber.classList.add('gc-hidden');
      _cleanSparkles();
    }, 700);
  }
};

// ── Floating sparkles background ─────────────
function _spawnSparkles() {
  const ICONS = ['✦', '✧', '·', '🌸', '✨', '🩷', '⭐'];
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('div');
    s.className = 'gc-sparkle';
    s.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
    s.style.cssText = `
      left:${Math.random() * 100}vw;
      bottom:${Math.random() * 60}vh;
      --dur:${5 + Math.random() * 6}s;
      --delay:${Math.random() * 5}s;
      font-size:${10 + Math.random() * 10}px;
    `;
    document.body.appendChild(s);
    _gcSparkles.push(s);
  }
}
function _cleanSparkles() {
  _gcSparkles.forEach(s => s.remove());
  _gcSparkles = [];
}

// ── Console log ───────────────────────────────
if (window.QR_GIFT_MODE) {
  console.log(`🎁 QR Gift Mode — Quà #${window.QR_GIFT_NUM}: ${window.QR_GIFT_DATA.title}`);
}
