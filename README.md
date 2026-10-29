# HỆ THỐNG QUẢN LÝ MÓN ĂN - MERN STACK & DOCKER

## Thông Tin Sinh Viên
- **Họ và tên:** Văn Thái Toàn
- **MSSV:** 236102
- **Trường:** Đại học Nam Cần Thơ
- **Công nghệ sử dụng:** MongoDB Atlas, Express.js, React.js, Node.js, Docker, Docker Compose, Nginx.

---

## Kiến Trúc Hệ Thống
Ứng dụng được đóng gói và vận hành hoàn toàn bằng **Docker Compose** trong môi trường **GitHub Codespaces**:

1. **Frontend Container (`food_frontend`):**
   - Xây dựng bằng React.js, đóng gói qua Multi-Stage Build với Nginx.
   - Chạy trên cổng `3000`.
   - Cấu hình Reverse Proxy chuyển tiếp các request `/api/` về Backend (`http://host.docker.internal:5000`).

2. **Backend Container (`food_backend`):**
   - Xây dựng bằng Node.js / Express.js.
   - Chạy ở chế độ `network_mode: "host"` trên cổng `5000`.
   - Kết nối trực tiếp cơ sở dữ liệu MongoDB Atlas qua chuỗi kết nối Cloud.

3. **Database:**
   - **MongoDB Atlas Cluster Cloud** (`Cluster tqqlcx1`, CSDL: `236102_VanThaiToan`).

---

## Docker Hub Repositories
Các Docker Image của dự án đã được đóng gói và đẩy công khai lên Docker Hub:
- **Backend Image:** `zeno2005q/backend:latest`
- **Frontend Image:** `zeno2005q/frontend:latest`

---

## Hướng Dẫn Khởi Chạy Ứng Dụng

### 1. Khởi chạy bằng Docker Compose
Tại thư mục gốc của dự án, chạy lệnh:

```bash
docker compose up --build -d