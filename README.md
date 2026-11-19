# must-do — Personal Developer Workspace

Workspace cá nhân cho dân code: to-do list, thói quen hằng ngày, Pomodoro, biểu đồ hoạt động và ghi chú nháp trên cùng một màn hình. Chạy hoàn toàn trên trình duyệt, không cần tài khoản hay server.

**Bản chạy thử:** https://nguyenvoquocviet.github.io/must-do-task-website/

## Chức năng

- **Task:** thêm nhanh task kèm tag, độ ưu tiên `P1/P2/P3` và deadline; sửa, xoá, tìm kiếm; lọc theo Tất cả / Hôm nay / Ưu tiên cao / từng tag. Nút cờ để đưa task vào hoặc bỏ khỏi ưu tiên cao.
- **Thói quen hằng ngày:** checklist tự reset khi sang ngày mới, đếm streak (số ngày liên tiếp) và hiện 7 ngày gần nhất.
- **Tiến độ hôm nay:** thanh % hoàn thành của task đến hạn và thói quen trong ngày.
- **Pomodoro:** 25 phút tập trung / 5 phút nghỉ, gắn với task đang chọn, phát tiếng "ting" khi hết giờ.
- **Biểu đồ hoạt động:** heatmap 12 tuần kiểu GitHub, có nút đặt lại lịch sử.
- **Ghi chú nháp:** tự lưu, hợp để dán link tài liệu hay lệnh terminal.
- **Sao lưu:** Export / Import JSON, nhắc sao lưu khi quá 3 ngày chưa export.
- Giao diện sáng / tối, phím tắt `N` (thêm task) và `/` (tìm kiếm).

## Công nghệ

React 18 · Vite 6 · Tailwind CSS 4 · Lucide React · `localStorage` · Web Audio API · File System Access API · GitHub Pages + GitHub Actions

## Chạy trên máy

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build ra thư mục dist/
```

## Hướng dẫn dùng

1. **Thêm task:** gõ tiêu đề ở ô "Thêm task mới…", chọn tag, độ ưu tiên, deadline rồi bấm **Thêm** (hoặc Enter).
2. **Hoàn thành:** tick vòng tròn bên trái task hoặc ô vuông của thói quen.
3. **Thao tác trên task:** rê chuột vào task để hiện các nút cờ ưu tiên, tập trung (Pomodoro), sửa, xoá. Xoá cần bấm 2 lần.
4. **Pomodoro:** chọn task ở ô "Đang tập trung vào", bấm **Bắt đầu**.
5. **Sao lưu:** bấm **Export JSON**. Trên Chrome/Edge, lần đầu sẽ hỏi chọn thư mục lưu (ví dụ `exports/` trong dự án); các lần sau ghi thẳng vào đó, tên file dạng `must-do-task_2026-11-19_1430.json`. Trình duyệt khác sẽ tải file về Downloads.
6. **Khôi phục / chuyển máy:** bấm **Import JSON** và chọn file đã export. Dữ liệu hiện tại sẽ bị ghi đè.

> Dữ liệu chỉ nằm trong trình duyệt đang dùng. Xoá dữ liệu duyệt web hoặc đổi máy/trình duyệt là mất, nên hãy export định kỳ.

## Deploy

Mỗi lần push lên nhánh `main`, GitHub Actions (`.github/workflows/deploy.yml`) tự build và đăng lên GitHub Pages. Lần đầu cần vào **Settings → Pages → Source** chọn **GitHub Actions**.
