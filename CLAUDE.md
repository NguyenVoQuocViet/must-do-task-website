# CLAUDE.md

## Quy tắc khi làm UI

Mỗi khi tạo hoặc sửa bất kỳ giao diện nào (HTML/CSS, React, Tailwind, component, trang, artifact, dashboard…), **luôn áp dụng cả hai skill**:

1. **`frontend-design`** — định hướng thẩm mỹ có chủ đích, typography, bố cục không theo template.
2. **`anti-ai-slop`** — quy chuẩn chống AI slop:
   - Cấm gradient tím/xanh, neon glow, card lồng card đổ bóng dày.
   - Ưu tiên viền mảnh 1px; bóng đổ tối thiểu, chỉ cho lớp nổi.
   - Bảng màu trung tính tương phản cao + **đúng 1 màu nhấn**.
   - Font: **Plus Jakarta Sans** (UI) + **JetBrains Mono** (số, code, nhãn).
   - Phong cách tham chiếu: Linear / Teenage Engineering.

Gọi skill (Skill tool) trước khi viết dòng code UI đầu tiên. Nếu hai skill mâu thuẫn về màu, font, viền, bóng thì **`anti-ai-slop` được ưu tiên**. Chạy checklist cuối file `anti-ai-slop/SKILL.md` trước khi bàn giao.
