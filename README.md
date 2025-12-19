# Khuyến nghị địa điểm du lịch

Website hỗ trợ người dùng xây dựng lộ trình chuyến du lịch cá nhân hóa.

## Cài Đặt

### 1. Chạy server Back-end

1. Mở terminal bằng cmd.  
2. Di chuyển vào thư mục chứa mã nguồn server:
```bash
cd path/to/folder/tổng
```
3. Chạy server bằng lệnh:
```bash
uvicorn server_python.app:app --reload --port 5000
```

### 2. Chạy server Front-end
1. Mở terminal bằng cmd.   và di chuyển vào thư mục front-end:
```bash
cd path/to/folder/travelai
```
2. Cài đặt các package (chỉ cần chạy lần đầu hoặc khi cần cập nhật):
```bash
npm install
```
3. Khởi động server phát triển:
```bash
npm run dev
```