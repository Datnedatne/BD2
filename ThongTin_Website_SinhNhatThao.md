# Ghi chú chi tiết về Website Sinh Nhật Thảo

Bản ghi chú này mô tả chi tiết các thành phần, tính năng và luồng hoạt động thực tế trên giao diện của phiên bản code trang web `birthday_thao.html`.

## 1. Tổng quan thiết kế & Hiệu ứng chung (Design & Effects)
- **Màu sắc chủ đạo**: Tone màu hồng pastel đan xen đa dạng (`--pink-light`, `--pink-mid`, `--pink-rose`) trên nền tối sang trọng (`--dark-ink`, `--dark-plum`), tạo sự lãng mạn.
- **Font chữ điểm nhấn**: Sử dụng kết hợp các font chữ từ Google Fonts:
  - `Playfair Display`: Tiêu đề lớn sang trọng.
  - `Cormorant Garamond`: Thơ thơ tình, đoạn trích dẫn (quote).
  - `DM Sans` và `Space Mono`: Nội dung văn bản thân thiện và thông số/số đếm ngược.
  - `Dancing Script`: Các đoạn thư, ghi chú tay.
- **Hiệu ứng bao trùm toàn trang**:
  - Trỏ chuột (Cursor) tùy biến hình bông hoa `✿`, có vệt trail di chuyển mượt mà bám theo.
  - Cánh hoa đào bay lơ lửng, rơi ngẫu nhiên trên toàn trang web (hiệu ứng `petal-canvas`).
  - Thanh Tiến trình cuộn (Progress bar) chạy ngang ở mép trên màn hình.
  - Cột điều hướng tiện lợi ở bên phải (Sidebar Nav) hiển thị dạng dấu chấm lốm đốm, khi thu gọn thì như ẩn đi.

## 2. Kịch bản các phân cảnh (9 Scenes)

Trang web kể chuyện rất mạch lạc, kết nối xuyên suốt thông qua 9 phân cảnh:

### Scene 0: Trò chơi Khủng Long - DINO GAME (`#scene-dino`)
- **Chức năng khởi động kì lạ**: Giả lập màn hình "No Internet" của Google Chrome với chú khủng long T-Rex đen trắng.
- **Điểm bí ẩn (Twist)**: Nếu nhấp để chơi và đạt chính xác **105 điểm** (kỷ niệm 01/05), cây xương rồng sẽ biến thành một chiếc bánh kem 3D.
- **Cú lừa ngoạn mục**: Khủng long sẽ ngừng chạy. Ấn vào chiếc bánh sinh nhật sẽ kích hoạt hiệu ứng lõm không gian (Warp) tuyệt đẹp đẩy người xem vào trải nghiệm chính!

### Scene 1: Chào đón sinh nhật - HERO (`#scene-hero`)
- **Không gian hiện ra**: Sự tập trung đổ dồn vào dòng chữ "THẢO" thật to, được áp dụng gradient màu hồng vàng lấp lánh đi vào lòng người. Phía trên là thông báo "**22 tuổi - 01/05/2025**".
- **Thổi nến sinh nhật**: Nút nhấn `"Thổi nến nào em 🕯️"`, kích hoạt hiệu ứng ngọn nến thổi tắt trên chiếc bánh SVG, sau đó tự bay tung tóe Confetti. 

### Scene 2: Chuyện chúng mình - TIMELINE (`#scene-timeline`)
- **Thiết kế dạng thẻ kỷ niệm**: Trình bày theo chiều dọc/ngang (tuỳ kích thước màn hình).
- **Các mốc sự kiện quan trọng lưu dấu**:
  1. *Tháng 10, 2024*: Ngày anh về Technopark.
  2. *Một ngày đặc biệt*: Em ngồi cạnh anh.
  3. *Ngày đầu tiên*: Chuyến đi anh đưa em về.
  4. *Món quà đầu tiên*: 6 chú Loopy ngộ nghĩnh (Easter Egg: 6 con Loopy bằng icon text đang nhảy múa).
  5. *01/05/2025*: Ngày thổi nến sinh nhật của tuổi 22 đầy ý nghĩa.

### Scene 3: Kho báu thời gian - GIFT VAULT (`#scene-gifts`)
- **Ba hộp quà bị khoá**: Thiết kế sử dụng bộ đếm thời gian thật theo máy tĩnh (realtime). Phải đến thời điểm yêu cầu thì quà mới được unlock:
  - **Mở lúc 8:00 sáng**: Thông điệp "Buổi sáng đầu tiên" hiển thị thư chúc ngày mới vui vẻ đầu ngày. 
  - **Mở lúc 12:30 trưa**: Gợi ý link playlist 2 bài hát ("Nothing" Bruno Major, "A Thousand Years" Christina Perri).
  - **Mở lúc 20:00 tối**: Cuối ngày! Nhắc khéo một hộp quà to đùng đang đợi ở phòng.

### Scene 4: Mini Games - MINI GAMES (`#scene-games`)
- Các Tab trò chơi làm nơi giải trí nhanh trên site:
  - **Anh biết em chưa?** (Quiz game): Bộ câu hỏi test về đối  tượng.
  - **Hứng hoa rơi** (Catch game): Tính điểm hứng cánh hoa trong 30 giây bằng con trỏ chuột.
  - **Puzzle ký ức** (Puzzle game): Trò ảo thuật ghép nối tấm ảnh nhỏ 3x3 grid bằng cách click.

### Scene 5: Lời thư tâm tình - LOVE LETTER (`#scene-letter`)
- Tái hiện một bức thư phong bì giấy trên màn hình với ấn sáp hình hoa sinh động.
- Khi Click vào Ấn sáp (seal), phong bì lật ngửa, tờ giấy note mở bung nội dung thư đàm thoại với font chữ viết tay ấm áp từ Đạt.

### Scene 6: Playlist Tình yêu - PLAYLIST (`#scene-playlist`)
- **Máy phát đĩa đĩa than**: Đĩa Vinyl tròn sẽ thực sự "quay" kèm gợn sóng Âm thanh nhấp nhô sống động (Waveform Bar).
- **Trải nghiệm nhạc**: Bấm nút Play/Pause mô phỏng giao diện chơi nhạc của 2 bản thánh ca nổi tiếng: Nothing & A Thousand Years kèm theo tính năng đổ Lyric. (Do hạn chế môi trường nên đây có thể là tính năng Demo / Placeholder ảo tuyệt đỉnh).

### Scene 7: Đếm ngược & Điều ước - COUNTDOWN & WISH BOARD (`#scene-countdown`)
- **Bộ đếm tương lai**: Một đếm lên "Đến sinh nhật 23 của em" và một đếm thời gian kể từ khoảnh khắc yêu nhau.
- **Bảng điều ước**: Thảo có không gian ghi lời ước nhập vào để đính làm 1 tệp giấy nhớ (Sticky Note) dán lên tường ghim vàng bên trên, trộn lẫn với Note từ chính tay Đạt viết sẵn.

### Scene 8: Pháo hoa bế mạc - GRAND FINALE (`#scene-finale`)
- **Khúc vĩ thanh**: Không giãn tối giản, Pháo hoa nổ to trên Canvas nền. 
- Ngôi sao lấp lánh kèm Lời tri ân "Từ người thương em - Đạt 🩷", kèm nụ hôn "Cảm ơn em vì đã đến."
- Ẩn dưới nụ cười đó là các biểu tượng nhỏ nhún nhảy và nút khởi động xem lại trang.
