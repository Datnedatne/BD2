# 🌸 SRS — Trang Web Sinh Nhật Thảo
### "Happy Birthday, My Favourite Person"
> Một trải nghiệm web tương tác, cá nhân hoá hoàn toàn — dành tặng Thảo từ Đạt, nhân dịp sinh nhật 1/5/2025

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Thiết kế tổng thể & Design System](#2-thiết-kế-tổng-thể--design-system)
3. [Kiến trúc trang & Flow điều hướng](#3-kiến-trúc-trang--flow-điều-hướng)
4. [SCENE 0 — Màn hình Loading & Game Khủng Long](#4-scene-0--màn-hình-loading--game-khủng-long)
5. [SCENE 1 — Hero / Màn Chào Đón](#5-scene-1--hero--màn-chào-đón)
6. [SCENE 2 — Our Story (Timeline)](#6-scene-2--our-story-timeline)
7. [SCENE 3 — Gift Vault (3 Món Quà Unlock theo giờ)](#7-scene-3--gift-vault-3-món-quà-unlock-theo-giờ)
8. [SCENE 4 — Mini Games](#8-scene-4--mini-games)
9. [SCENE 5 — Love Letter (Thư Tình)](#9-scene-5--love-letter-thư-tình)
10. [SCENE 6 — Our Playlist](#10-scene-6--our-playlist)
11. [SCENE 7 — Countdown & Wish Board](#11-scene-7--countdown--wish-board)
12. [SCENE 8 — Grand Finale](#12-scene-8--grand-finale)
13. [Âm thanh & Hiệu ứng toàn cục](#13-âm-thanh--hiệu-ứng-toàn-cục)
14. [Yêu cầu kỹ thuật](#14-yêu-cầu-kỹ-thuật)
15. [Prompt để build trang web này](#15-prompt-để-build-trang-web-này)

---

## 1. TỔNG QUAN DỰ ÁN

| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Happy Birthday Thảo |
| **Người tặng** | Đạt |
| **Người nhận** | Thảo (sinh 1/5/2003 — tròn 22 tuổi) |
| **Ngày ra mắt** | 1/5/2025 |
| **Phong cách** | Romantic-Cool: hồng pastel × dark moody × studio film |
| **Nền tảng** | Web (mobile-first, responsive desktop) |
| **Ngôn ngữ** | HTML5 + CSS3 + Vanilla JS (không cần framework) |
| **Bài hát nền** | "Nothing" – Bruno Major / "A Thousand Years" – Christina Perri |

### Mục tiêu trải nghiệm
Khi Thảo mở link lần đầu tiên, cô ấy phải:
1. **Ngạc nhiên** ngay từ giây đầu tiên (game khủng long → warp)
2. **Xúc động** khi đọc timeline câu chuyện tình
3. **Tò mò & hào hứng** khi thấy các hộp quà chưa unlock
4. **Cười** khi chơi mini games
5. **Khóc (vì hạnh phúc)** khi đọc thư tình ở cuối
6. **Chạy về nhà** khi thấy quà cuối chỉ mở được tối hôm đó

---

## 2. THIẾT KẾ TỔNG THỂ & DESIGN SYSTEM

### 2.1 Palette màu sắc

```
/* ===== COLOR SYSTEM ===== */

/* Primary — Pink Pastel World */
--pink-light:     #FFD6E0   /* nền nhẹ, card background */
--pink-mid:       #FFB3C6   /* accent chính */
--pink-deep:      #FF8FAB   /* CTA buttons, highlights */
--pink-rose:      #E8637A   /* text accent, icon */

/* Dark Layer — Moody & Cool */
--dark-ink:       #1A1220   /* background chính scene tối */
--dark-plum:      #2D1B33   /* card nền tối */
--dark-wine:      #3D1F3A   /* hover states tối */

/* Gold Accent — Special Moments */
--gold-soft:      #F7D794   /* số đếm ngược, điểm game */
--gold-warm:      #E8B86D   /* icon đặc biệt */

/* Neutral */
--white-cream:    #FFF8F9   /* text trên nền tối */
--grey-mist:      #C4A0B0   /* placeholder, secondary text */

/* Gradient Signatures */
--grad-hero:      linear-gradient(135deg, #1A1220 0%, #2D1B33 50%, #3D1F3A 100%)
--grad-pink:      linear-gradient(135deg, #FFD6E0 0%, #FFB3C6 100%)
--grad-sunset:    linear-gradient(180deg, #1A1220 0%, #FF8FAB 200%)
```

### 2.2 Typography

```
/* Display — Lãng mạn, có hồn */
font-family: 'Playfair Display', serif;      /* tiêu đề lớn */
font-family: 'Cormorant Garamond', serif;    /* thơ, quote */

/* Body — Hiện đại, sạch */
font-family: 'DM Sans', sans-serif;          /* text thường */
font-family: 'Space Mono', monospace;        /* số, code effect, game score */

/* Decorative */
font-family: 'Dancing Script', cursive;      /* chữ ký, lời nhắn tay */
```

### 2.3 Motion & Animation Language

- **Entrance**: fade-up + slight scale (transform: translateY(30px) → 0, opacity 0→1)
- **Scroll reveal**: Intersection Observer — mỗi section wipe vào khi scroll đến
- **Parallax**: hero background layer chạy chậm hơn foreground
- **Particle system**: hoa anh đào / tim nhỏ rơi nhẹ toàn trang
- **Cursor tùy chỉnh**: cursor là ✿ hoa nhỏ màu hồng, để lại trail sparkle
- **Transition giữa scenes**: wipe/morph effect thay vì scroll thông thường

### 2.4 Responsive

- Mobile (≤768px): layout dọc, font scale nhỏ hơn, game touch-friendly
- Desktop (≥1024px): layout hai cột ở một số section, hiệu ứng parallax đầy đủ

---

## 3. KIẾN TRÚC TRANG & FLOW ĐIỀU HƯỚNG

```
[SCENE 0] Game Khủng Long
     │  (đạt 0105 điểm → xương rồng → bánh sinh nhật → click ăn)
     ▼
[SCENE 1] Hero — "Chúc mừng sinh nhật Thảo 🎂"
     │  (nến thổi được, confetti nổ)
     ▼
[SCENE 2] Our Story — Timeline cuộn ngang
     │  (từ tháng 10/2024 đến nay)
     ▼
[SCENE 3] Gift Vault — 3 hộp quà theo giờ
     │  [Sáng] [Trưa/Chiều] [Tối — về nhà đợi em]
     ▼
[SCENE 4] Mini Games — 3 trò chơi
     │  (câu đố | bắt hoa rơi | ghép ảnh kỷ niệm)
     ▼
[SCENE 5] Love Letter — Thư tình cuộn chữ
     │  (hiệu ứng chữ tay, envelope animation)
     ▼
[SCENE 6] Our Playlist — 2 bài hát
     │  (waveform animation, lyric highlight)
     ▼
[SCENE 7] Countdown & Wish Board
     │  (đếm ngược đến sinh nhật năm sau / anniversary)
     ▼
[SCENE 8] Grand Finale — Màn pháo hoa + lời kết
```

Navigation: **Sidebar chấm tròn bên phải** — 8 chấm tương ứng 8 scene, hover hiện tên scene.

---

## 4. SCENE 0 — MÀN HÌNH LOADING & GAME KHỦNG LONG

### 4.1 Mô tả tổng quan
Người dùng mở link → **KHÔNG** thấy trang web sinh nhật ngay. Thay vào đó là màn hình giả lập "No Internet" của Chrome — đen trắng pixel, con khủng long T-Rex đứng giữa màn hình. Một dòng chữ nhỏ phía dưới:

> *"Có vẻ kết nối bị mất... hoặc là có thứ gì đó đang chờ em? Nhảy thôi ✦"*

### 4.2 Gameplay

**Cơ chế:**
- **Desktop**: Phím Space hoặc ↑ để nhảy
- **Mobile**: Tap màn hình để nhảy
- Chướng ngại vật: xương rồng từ phải sang trái, tốc độ tăng dần
- Background: mây pixel, mặt trời, núi — đen trắng như Chrome gốc
- Score hiển thị góc phải: `Space Mono` font, màu trắng

**Twist đặc biệt — Milestone 0105:**
- Khi đạt đúng **105 điểm** (ý nghĩa: ngày sinh 01/05):
  - Nhạc nền thay đổi: một nốt piano nhẹ vang lên
  - Xương rồng tiếp theo **không phải xương rồng** — mà là **một chiếc bánh sinh nhật pixel** xuất hiện
  - Con khủng long **KHÔNG** va chạm với bánh — thay vào đó nó dừng lại, quay đầu nhìn bánh
  - Nến trên bánh tự bật sáng, sparkle pixel nổ ra
  - Xuất hiện text nhấp nháy: *"Thổi nến đi em... 🕯️"*
  - Người dùng **click/tap vào bánh** → bánh nổ confetti pixel
  - **Màn hình WARP**: hiệu ứng hyperspace/wormhole (các vạch sáng kéo dài ra tâm màn hình)
  - Transition sang SCENE 1

**Nếu thua (va chạm xương rồng trước khi đạt 105):**
- Text: *"Gần rồi... thử lại nhé em 💕"*
- Game reset, điểm về 0
- Con khủng long có animation "ngượng ngùng" lắc đầu

### 4.3 Giao diện chi tiết

```
┌─────────────────────────────────────────────────┐
│  [DINO GAME SCREEN]             HI  00000       │
│                                                 │
│  ──────────────── ☁  ──────── ☁ ──────────────  │
│                                                 │
│           🦕                       🌵           │
│  ─────────────────────────────────────────────  │
│                                                 │
│   "Có vẻ kết nối bị mất... hoặc là có thứ      │
│    gì đó đang chờ em? Nhảy thôi ✦"              │
│                              [SPACE to start]   │
└─────────────────────────────────────────────────┘
```

**Visual style**: Pixel art đen trắng thuần túy. Font `Space Mono`. Không có màu nào khác cho đến khi đạt milestone.

---

## 5. SCENE 1 — HERO / MÀN CHÀO ĐÓN

### 5.1 Visual

**Background**: Gradient đêm sâu (`--dark-ink` → `--dark-plum`) với:
- Particle system: ~80 hạt sáng nhỏ li ti trôi lên (như bong bóng nhỏ hoặc đom đóm)
- Một vầng trăng mờ góc trên phải (SVG, opacity 30%)
- Texture noise nhẹ overlay toàn màn hình

**Foreground chính**:
```
┌─────────────────────────────────────────────────┐
│                     ✦ ✦ ✦                       │
│                                                 │
│           🎂  ← (3D cake SVG, nến lung linh)    │
│                                                 │
│      ╔═══════════════════════════════╗          │
│      ║   Chúc mừng sinh nhật         ║          │
│      ║                               ║          │
│      ║       T H Ả O  ✿             ║          │
│      ║                               ║          │
│      ║    22 tuổi · 1 tháng 5 · 2025 ║          │
│      ╚═══════════════════════════════╝          │
│                                                 │
│         [ Thổi nến nào em... 🕯️ ]              │
│                  ↓ cuộn xuống                   │
└─────────────────────────────────────────────────┘
```

**Tên "THẢO"**: Font `Playfair Display`, size rất lớn (clamp 60px–120px), màu gradient từ `--pink-mid` sang `--gold-soft`, letter-spacing rộng, có shimmer animation chạy qua từng chữ cái theo lượt.

### 5.2 Tương tác "Thổi nến"

- Chiếc bánh sinh nhật SVG có 22 ngọn nến lung linh (flicker animation CSS)
- Nút "Thổi nến nào em" ở dưới bánh
- Khi click: **Mic API** (xin quyền mic) — nếu người dùng thổi vào mic thật sự, phát hiện tiếng thở/thổi → nến tắt dần từng cái
- Fallback (không cho mic): click vào từng nến để tắt
- Khi tất cả nến tắt: confetti nổ toàn màn hình 🎊, nhạc nền bắt đầu phát ("Nothing" – Bruno Major, nhẹ nhàng, autoplay sau gesture)
- Text xuất hiện: *"Happy birthday, tình yêu của anh 💕"*

### 5.3 Scroll Indicator
Arrow nhấp nháy xuống dưới + text nhỏ *"Chuyện của chúng mình ↓"*

---

## 6. SCENE 2 — OUR STORY (TIMELINE)

### 6.1 Concept
Timeline **cuộn ngang** (horizontal scroll snap) trên desktop, dọc trên mobile. Mỗi milestone là một "thẻ phim" — như tấm film analog cũ với viền đen, góc bo nhẹ, texture grain.

### 6.2 Các Mốc Timeline

**Mốc 1 — Tháng 10, 2024**
> *"Ngày đầu tiên"*
- Visual: Minh hoạ văn phòng Technopark, tầng 8A, cửa sổ nhìn ra Hà Nội
- Text: *"Anh chuyển văn phòng về Technopark. Tầng 8A. Và rồi anh thấy em."*
- Icon: 🏢 + ✨
- Animation: thẻ slide vào từ phải, có timestamp dạng film reel

**Mốc 2 — "Ngày em ngồi cạnh anh"**
> *"The universe conspired"*
- Visual: Hai ghế cạnh nhau (flat illustration), ánh sáng từ màn hình laptop
- Text: *"Rồi một ngày, em qua ngồi cạnh chỗ anh. Anh không biết team em chuyển chỗ hay vũ trụ đã sắp xếp... nhưng anh thích kết quả này lắm."*
- Icon: 🪑💻
- Easter egg: hover vào ghế → xuất hiện trái tim nhỏ

**Mốc 3 — "Ngày đầu anh đưa em về"**
> *"The beginning of everything"*
- Visual: Con đường đêm Hà Nội, ánh đèn đường vàng, hai bóng người
- Text: *"Và tất cả bắt đầu từ ngày hôm đó — ngày đầu tiên anh đưa em về."*
- Icon: 🌃
- Hiệu ứng: background parallax — đèn đường nhấp nháy nhẹ

**Mốc 4 — "6 con Loopy màu hồng"**
> *"Món quà đầu tiên"*
- Visual: 6 con thú bông Loopy cute màu hồng pastel, xếp hàng ngang
- Text: *"Anh tặng em 6 con Loopy màu hồng. Nhỏ thôi, nhưng anh nhớ mãi cái lúc em nhận."*
- Icon: 🩷🧸
- Animation: từng con Loopy bounce vào lần lượt với delay
- Interactive: hover vào từng con → mỗi con phát ra âm thanh "squeaky" nhỏ

**Mốc 5 — "Hôm nay — 1/5/2025"**
> *"Happy Birthday ✿"*
- Visual: Hoa hồng Eden nở rộ, cánh hoa rơi
- Text: *"Và hôm nay, lần đầu tiên anh được ở bên cạnh em đón sinh nhật. Mong sẽ còn thật nhiều lần như thế này."*
- Icon: 🌹✨
- Hiệu ứng: petals animation rơi xuống từ trên

### 6.3 UI Timeline

```
◀ ──[●]──────[●]──────[●]──────[●]──────[●]── ▶
   Oct'24   Ngồi   Đưa về   Loopy   1/5/25
              cạnh

[      CARD HIỆN TẠI — chiếm 80vw, snap scroll      ]
```

Progress bar màu hồng chạy ngang theo scroll.

---

## 7. SCENE 3 — GIFT VAULT (3 MÓN QUÀ UNLOCK THEO GIỜ)

### 7.1 Concept tổng quan

Ba chiếc hộp quà 3D xếp ngang, mỗi hộp có:
- Trạng thái **LOCKED** 🔒: hộp tối, có ổ khoá, hiển thị giờ mở khoá
- Trạng thái **UNLOCKED** 🎁: hộp sáng, nắp mở, nội dung reveal với animation

Phía trên 3 hộp là đồng hồ đếm ngược real-time đến giờ unlock tiếp theo.

### 7.2 Chi tiết từng món quà

---

**🎁 HỘP 1 — "Buổi sáng đầu tiên" (Mở lúc 8:00 sáng)**

*Trạng thái locked:*
- Hộp màu hồng nhạt, ruy băng vàng, ổ khoá hình ☀️
- Text: *"Em ơi, đừng mở vội... ☀️ Mở lúc 8 giờ sáng nhé"*
- Đếm ngược: `08:00:00 AM`

*Khi mở (sau 8h sáng):*
- Animation: nắp hộp bật lên, ánh sáng vàng tỏa ra
- Bên trong: một **tấm bưu thiếp kỹ thuật số** xuất hiện với chữ viết tay:

> *"Chào buổi sáng, người anh thương nhất 🌸*
> *Hôm nay là ngày đặc biệt của em — và anh muốn em bắt đầu ngày này với nụ cười.*
> *Em đã 22 tuổi rồi, đẹp hơn, trưởng thành hơn... và anh thấy mình may mắn lắm khi được ở cạnh em.*
> *Ăn sáng ngon nhé, hôm nay còn nhiều bất ngờ nữa đấy 🎀"*

- Kèm theo: một **bức ảnh pixel art** vẽ cô gái ngồi bên cửa sổ buổi sáng, ánh nắng vàng — phong cách Studio Ghibli

---

**🎁 HỘP 2 — "Giữa ngày" (Mở lúc 12:30 trưa)**

*Trạng thái locked:*
- Hộp màu hồng đậm hơn, ruy băng hồng, ổ khoá hình 🌸
- Text: *"Lại rồi... 🌸 Đợi đến trưa nhé em"*

*Khi mở (sau 12:30):*
- Animation: hộp rung nhẹ, nắp từ từ nhấc lên, hoa hồng Eden 3D mọc ra từ trong hộp
- Bên trong: **Mini album ảnh kỹ thuật số** — một slideshow nhẹ nhàng với các ảnh minh hoạ/kỷ niệm (placeholder cho ảnh thật của 2 người nếu có), mỗi ảnh có caption tay
- Có thể thêm: **một playlist Spotify embed** với bài "Nothing" – Bruno Major + "A Thousand Years"
- Lời nhắn ngắn:

> *"Nhìn lại những khoảnh khắc này... anh thấy ấm lòng lắm.*
> *Cảm ơn em vì đã xuất hiện. 🩷"*

---

**🎁 HỘP 3 — "Tối nay — Về nhà đợi em" (Mở lúc 20:00 tối)**

*Trạng thái locked:*
- Hộp to nhất, màu đỏ hồng đậm, nơ lớn, ổ khoá hình 🌙
- Text in đậm: *"Món này... em phải về nhà mới mở được 🌙"*
- Subtext nhỏ italic: *"(Nghiêm túc đó, về đi rồi tính)"*
- Countdown realtime đến 20:00

*Khi mở (sau 20:00):*
- Animation GRAND: màn hình tối dần, một vệt sáng vàng từ trên xuống như spotlight
- Hộp từ từ mở, ánh sáng rose gold tràn ra
- Text xuất hiện từ từ, chữ lớn, font `Cormorant Garamond`:

> *"Em đã về rồi..."*
> *(pause 2 giây)*
> *"Nhìn ra chỗ anh để ở đặt nhé 🎀"*

- Hiệu ứng: confetti vàng hồng rơi, nhạc "A Thousand Years" bắt đầu phát
- Subtext: *"Quà thật đang chờ em ở đó — anh không spoil đâu 🤫"*

*(Đây là nơi bạn điền hint về món quà thật trong nhà)*

---

### 7.3 Giao diện Gift Vault

```
┌──────────────────────────────────────────────┐
│         🎁  Q U À  C H O  E M  🎁           │
│                                              │
│  Món tiếp theo mở sau:  02 : 34 : 12        │
│                                              │
│  ┌──────┐    ┌──────┐    ┌──────────┐       │
│  │  🌅  │    │  🌸  │    │    🌙    │       │
│  │      │    │      │    │          │       │
│  │  ✓   │    │  🔒  │    │   🔒     │       │
│  │ 8:00 │    │12:30 │    │  20:00   │       │
│  └──────┘    └──────┘    └──────────┘       │
│  ĐÃ MỞ     Chờ chút      Về nhà nhé         │
└──────────────────────────────────────────────┘
```

---

## 8. SCENE 4 — MINI GAMES

### 8.1 Tổng quan

Ba mini game, mỗi game có nút Play riêng, có thể chơi độc lập, không cần hoàn thành game này để mở game kia. Mỗi game có màn hình kết quả và reward nhỏ.

---

### 🎮 GAME 1 — "Anh biết em bao nhiêu?" (Quiz về chuyện 2 người)

**Concept**: Câu đố trắc nghiệm 5 câu về chuyện của Đạt & Thảo. Câu hỏi dí dỏm, đáp án có lựa chọn buồn cười.

**Giao diện**:
- Card câu hỏi hiện từng cái, animation flip
- 4 đáp án dạng button, hover effect màu hồng
- Thanh tiến trình: ●●●○○
- Score góc phải

**Câu hỏi gợi ý** (Đạt điền nội dung thật):
1. *"Lần đầu tiên anh để ý em là khi nào?"*
   - A. Ngay ngày đầu về Technopark ✓
   - B. Sau 1 tuần
   - C. Khi em mang cà phê qua
   - D. Khi em hỏi mượn sạc

2. *"Món quà đầu tiên anh tặng em là gì?"*
   - A. Hoa hồng
   - B. 6 con Loopy màu hồng ✓
   - C. Cà phê sáng
   - D. Sticker cute

3. *"Bài hát của chúng mình là?"*
   - A. Nothing – Bruno Major ✓
   - B. Shape of You
   - C. Despacito
   - D. Bống Bống Bang Bang

4. *"Em ngồi cạnh anh vì lý do gì?"*
   - A. Vũ trụ sắp xếp 🔮
   - B. Team em chuyển chỗ ✓
   - C. Ghế bên kia hỏng
   - D. Để ý anh lâu rồi 😏

5. *"Điều anh thích nhất ở em là?"*
   - A. Nụ cười
   - B. Sự bao dung
   - C. Cá tính
   - D. Tất cả những điều trên ✓

**Kết quả**:
- 5/5: *"Em giỏi quá! (Hoặc anh dễ đoán quá... 🤔) 💕"*
- 3-4/5: *"Gần đúng rồi, từ từ hiểu anh thêm nhé~"*
- <3: *"Ơ... em quên anh rồi à 😤 (Đùa thôi, anh thương em 🩷)"*

---

### 🎮 GAME 2 — "Hứng Hoa Rơi" (Bắt cánh hoa hồng Eden)

**Concept**: Cánh hoa hồng Eden hồng rơi từ trên xuống. Người dùng di chuyển giỏ (hoặc bàn tay) để hứng. Tránh những chiếc lá gai (mất điểm). Thời gian 30 giây.

**Giao diện**:
- Background: gradient tím hồng, hoa bokeh mờ phía sau
- Hoa rơi: SVG cánh hoa hồng, size khác nhau, rơi lắc lư nhẹ
- Giỏ hứng: hình trái tim hoặc bàn tay cute
- Desktop: di chuột điều khiển
- Mobile: touch/drag điều khiển
- Counter: `🌸 x 23` góc trái

**Kết thúc**:
- ≥25 hoa: *"Em khéo tay thế! Anh thương em 🌸"* + hiệu ứng hoa nở đầy màn hình
- 15-24: *"Ổn lắm rồi em~ 🌷"*
- <15: *"Thôi được, anh chịu hứng bù cho em 💕"*

---

### 🎮 GAME 3 — "Puzzle Ký Ức" (Ghép mảnh ảnh kỷ niệm)

**Concept**: Một bức ảnh/illustration kỷ niệm bị chia thành 9 mảnh (3×3). Người dùng kéo thả ghép lại. Khi hoàn thành, ảnh sáng lên với hiệu ứng glow và một câu chú thích xuất hiện.

**Giao diện**:
- Grid 3×3, các mảnh xáo trộn
- Drag & drop (desktop) / touch drag (mobile)
- Khi ghép đúng 1 mảnh: click nhẹ + màu sắc sáng lên
- Timer tùy chọn (có thể tắt)

**Ảnh gợi ý** (Đạt có thể thay bằng ảnh thật):
- Ảnh pixel art: hai người ngồi cạnh nhau nhìn ra cửa sổ văn phòng, đèn thành phố phía xa

**Khi hoàn thành**: ảnh sáng lên, text fade-in:
> *"Mỗi mảnh nhỏ của kỷ niệm — ghép lại thành một chuyện tình đẹp 🩷"*

---

## 9. SCENE 5 — LOVE LETTER (THƯ TÌNH)

### 9.1 Concept

Một phong bì thư cổ điển, màu hồng pastel, seal sáp đỏ hình ✿. Animation phong bì mở ra → tờ thư cuộn ra từ bên trong.

### 9.2 Animation sequence

1. Phong bì nằm giữa màn hình, seal sáp lấp lánh nhẹ
2. Text nhỏ phía dưới: *"Thư từ Đạt 💌 — Click để mở"*
3. Click → seal vỡ ra (particle effect nhỏ)
4. Phong bì mở nắp từ từ
5. Tờ thư slide ra từ bên trong, unfold animation
6. Chữ viết tay (font `Dancing Script`) xuất hiện từng dòng, như đang được viết live

### 9.3 Nội dung thư

*(Chính xác lời Đạt đã nhắn, được format đẹp)*

```
                        Hà Nội, ngày 1 tháng 5 năm 2025

  Gửi em,
  Người anh thương,

  Chúc mừng sinh nhật em ạ !!

  Trước tiên thì cảm ơn em vì đã đến, đã bước vào cuộc
  đời anh, đã bao dung và dành thời gian, tình cảm cho anh.

  Ở cạnh em, anh luôn cảm thấy anh được là chính mình,
  an tâm rằng mọi chuyện sẽ ổn chỉ cần em còn ở bên.

  Sinh nhật năm nay của em đặc biệt lắm, vì đây là lần
  đầu tiên anh được ở cạnh em đón dịp này. Hmmm rất hy
  vọng sau này chúng ta sẽ còn thật nhiều lần thổi nến
  cùng nhau nữa ạ — và mỗi lần trôi qua đó chúng ta đều
  yêu nhau hơn một chút. Nhiều cũng được :>

  Thật sự ấy, không biết từ bao giờ, anh cảm thấy rằng
  mình đang trân trọng một người đến thế.

  Mong em một năm mới ngập tràn niềm vui, luôn vững vàng,
  mạnh mẽ như hiện tại và đạt được mọi điều em mong muốn.

  Chúc mừng sinh nhật em,
  Tình yêu của anh. ❤️


                                             Đạt ✍️
```

### 9.4 Chi tiết visual

- Nền thư: màu kem `#FFF8F0`, texture paper nhẹ
- Chữ: `Dancing Script`, màu `#5C3D2E` (nâu ấm như mực thật)
- Dòng kẻ ngang mờ phía sau chữ
- Góc thư: hoa hồng Eden nhỏ trang trí
- Sau khi đọc xong: nút *"Cất thư lại 💌"* → phong bì đóng lại

---

## 10. SCENE 6 — OUR PLAYLIST

### 10.1 Concept

Giao diện như một vinyl record player vintage. Đĩa vinyl quay, kim đọc chạy qua rãnh đĩa. Danh sách 2 bài hát chính + có thể thêm vài bài gợi ý.

### 10.2 Giao diện

```
┌─────────────────────────────────────────────────────┐
│              🎵 NHẠC CỦA CHÚNG MÌNH 🎵              │
│                                                     │
│    ╭─────────────────╮                              │
│    │   ○  [VINYL]  ○  │   ▶ Nothing                │
│    │    ◉  ~~  ◉   │       Bruno Major             │
│    │   ○           ○  │   ─────────────────         │
│    ╰─────────────────╯   ▷ A Thousand Years         │
│    [đĩa đang quay...]       Christina Perri         │
│                                                     │
│    Waveform: ▁▂▄▆▇▆▄▃▂▁▂▃▅▇▅▃▂▁ (animated)         │
│                                                     │
│    "Bài hát này, mỗi lần nghe lại anh lại nhớ em"  │
└─────────────────────────────────────────────────────┘
```

### 10.3 Tính năng

- Đĩa vinyl SVG quay animation khi đang "play"
- Waveform bar animation theo nhịp giả lập
- Click vào bài → embed YouTube/Spotify (nếu có link) hoặc chỉ hiệu ứng visual
- Lyric highlight: một câu lyric đặc biệt của mỗi bài xuất hiện fade-in phía dưới

**Quote lyric gợi ý:**
- Nothing: *"I don't need nothing, when I'm with you..."*
- A Thousand Years: *"I have loved you for a thousand years, I'll love you for a thousand more"*

*(Hiển thị lyric ngắn, không vi phạm copyright)*

---

## 11. SCENE 7 — COUNTDOWN & WISH BOARD

### 11.1 Countdown

Hai đồng hồ đếm ngược song song:

**Đồng hồ 1 — "Đến sinh nhật năm sau"**
```
Sinh nhật 22 của em đã qua...
Còn 364 ngày : 23 giờ : 12 phút : 05 giây
đến sinh nhật 23 🎂
```

**Đồng hồ 2 — "Chúng mình đã ở bên nhau được"**
```
Kể từ tháng 10, 2024...
Đã được  X ngày  Y giờ  Z phút
(Đạt điền ngày chính xác bắt đầu yêu nhau)
```

Visual: Font `Space Mono` lớn, màu `--gold-soft`, glow effect, background dark.

### 11.2 Wish Board — "Điều ước năm 22"

**Concept**: Một bảng ghim ảo (corkboard texture). Thảo có thể gõ một điều ước của mình → nó xuất hiện như một tờ note giấy màu vàng nhỏ được ghim lên bảng → animation tờ giấy rơi xuống và ghim lại.

- Input: text field nhỏ, placeholder *"Em ước điều gì cho năm 22? ✨"*
- Nút: *"Ghim điều ước 📌"*
- Note xuất hiện với font handwritten, màu ngẫu nhiên (vàng/xanh/hồng nhạt)
- Lưu vào localStorage (persist khi reload)
- Tối đa 5 note

**Phía dưới Wish Board**: Một note đã ghim sẵn từ Đạt:
> *"Anh ước chúng mình còn thật nhiều lần thổi nến cùng nhau 🕯️ — Đạt"*

---

## 12. SCENE 8 — GRAND FINALE

### 12.1 Concept

Màn cuối cùng — như credits của một bộ phim. Nền tối, pháo hoa bắn lên, nhạc nền lên to hơn một chút.

### 12.2 Visual sequence

1. Màn hình tối dần từ scene trước
2. Pháo hoa canvas animation — bắn từ phía dưới, nổ hình tim ❤️ và hoa hồng 🌹
3. Text xuất hiện từng dòng, chậm rãi:

```
          ✦ ✦ ✦


     Happy Birthday
         Thảo

        22 tuổi
     01 / 05 / 2025


    Từ người thương em,
         Đạt 🩷


          ✦ ✦ ✦


   "Cảm ơn em vì đã đến."
```

4. Nút cuối: **"Chơi lại từ đầu 🔄"** (nhỏ, góc dưới) — reset về Scene 0

### 12.3 Easter Egg cuối

Nếu người dùng click 10 lần vào ngôi sao ✦:
- Màn hình flash nhẹ
- 6 con Loopy pixel art xuất hiện nhảy nhót xung quanh tên "Thảo"
- Text: *"6 con Loopy gửi lời chúc sinh nhật em 🩷"*

---

## 13. ÂM THANH & HIỆU ỨNG TOÀN CỤC

### 13.1 Âm thanh

| Thời điểm | Âm thanh |
|---|---|
| Scene 0 (Dino game) | Chiptune 8-bit nhẹ |
| Milestone 0105 | Nốt piano ding |
| Warp transition | Whoosh + shimmer |
| Scene 1 (nến tắt) | "Nothing" – Bruno Major (soft, loop) |
| Mở hộp quà | Pop! + tinkle |
| Game win | Fanfare nhỏ 8-bit |
| Scene 5 (thư tình) | Acoustic guitar ambient |
| Grand Finale | "A Thousand Years" – crescendo nhẹ |

*Lưu ý: Tất cả audio chỉ play sau user gesture (click đầu tiên) để bypass autoplay policy.*

### 13.2 Hiệu ứng toàn cục

- **Custom cursor**: ✿ hoa nhỏ màu hồng, để lại sparkle trail khi di chuyển
- **Particle background**: hoa nhỏ li ti rơi cực nhẹ, opacity thấp, toàn trang
- **Scroll progress bar**: thanh mỏng màu hồng trên cùng, thể hiện đã đọc bao nhiêu %
- **Sidebar navigation**: 8 chấm tròn bên phải, chấm active lớn hơn + màu hồng, hover hiện tên scene
- **Smooth scroll**: scroll snap giữa các scene

---

## 14. YÊU CẦU KỸ THUẬT

### 14.1 Tech Stack

```
HTML5 + CSS3 + Vanilla JavaScript (ES6+)
Không cần framework — chạy được bằng 1 file HTML duy nhất
Fonts: Google Fonts (Playfair Display, Cormorant Garamond, DM Sans, Space Mono, Dancing Script)
Icons: Unicode emoji + SVG inline
Audio: HTML5 Audio API
Canvas: Particle system + Pháo hoa
LocalStorage: Wish Board persistence
```

### 14.2 Performance

- Lazy load từng section khi scroll đến
- requestAnimationFrame cho tất cả animation
- SVG thay bitmap cho illustration
- Không dùng thư viện nặng (không jQuery, không Bootstrap)

### 14.3 Accessibility

- Nút đủ lớn cho mobile (min 44×44px)
- Fallback cho mic API (click tắt nến)
- Keyboard navigation cho games
- `prefers-reduced-motion` media query cho animation

---

## 15. PROMPT ĐỂ BUILD TRANG WEB NÀY

*Đây là prompt bạn paste vào Claude / AI để build trang web theo SRS này:*

---

```
Hãy build cho tôi một trang web sinh nhật cá nhân hoá hoàn toàn bằng HTML5 + CSS3 + Vanilla JS (single file). Trang web dành tặng bạn gái tên Thảo (22 tuổi, sinh 1/5/2003) từ người yêu tên Đạt. Dưới đây là toàn bộ SRS chi tiết:

[DÁN TOÀN BỘ NỘI DUNG SRS NÀY VÀO ĐÂY]

Yêu cầu:
- Output là 1 file HTML duy nhất, hoàn chỉnh, có thể mở trực tiếp trên browser
- Tất cả CSS và JS inline trong file
- Fonts load từ Google Fonts CDN
- Không dùng framework ngoài
- Code đẹp, có comment rõ từng section
- Ưu tiên mobile-first, responsive
- Tất cả animation mượt mà, dùng CSS transition/animation + requestAnimationFrame
- Màu sắc theo Design System đã mô tả trong SRS

Hãy build từng SCENE một, bắt đầu từ SCENE 0 (Game Khủng Long) trước.
```

---

*Ghi chú cho Đạt: Sau khi có file HTML, bạn có thể host miễn phí trên **Netlify Drop** (kéo thả file) hoặc **GitHub Pages**. Chia sẻ link cho Thảo đúng ngày 1/5 là xong! 🎉*

---

> **Tài liệu này được tạo bởi Claude · Phiên bản SRS v1.0 · Dành riêng cho Đạt & Thảo 🩷**
