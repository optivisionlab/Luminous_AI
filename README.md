# Thử Thách Cùng Luminous AI

## Giới thiệu dự án

"Thử Thách Cùng Luminous AI" là một ứng dụng web được xây dựng với Next.js (frontend) và FastAPI (backend), cung cấp một trò chơi hỏi đáp kiến thức tổng quát hấp dẫn. Người chơi có thể đăng ký, đăng nhập, tham gia các lượt chơi với 20 câu hỏi ngẫu nhiên và theo dõi điểm số của mình trên bảng xếp hạng.

### Các tính năng chính:

*   **Đăng ký & Đăng nhập:** Quản lý tài khoản người dùng an toàn.
*   **Chơi game hỏi đáp:** Mỗi lượt chơi bao gồm 20 câu hỏi ngẫu nhiên, độc đáo.
*   **Đếm ngược trước khi chơi:** Tạo sự hồi hộp với màn hình đếm ngược 5 giây.
*   **Tính điểm:** Ghi nhận điểm số dựa trên câu trả lời đúng.
*   **Kết thúc lượt chơi sớm:** Người chơi có thể tự nguyện kết thúc lượt chơi bất cứ lúc nào để lưu điểm.
*   **Bảng xếp hạng:** Hiển thị điểm số cao nhất của người chơi, với thông tin người dùng hiện tại được làm nổi bật.
*   **Giao diện người dùng thân thiện:** Thiết kế hiện đại, dễ sử dụng với Tailwind CSS.

## Cài đặt dự án

Để chạy dự án này, bạn cần cài đặt các thư viện Python cho backend và các gói Node.js cho frontend.

### 1. Cài đặt Backend (FastAPI)

Đảm bảo bạn có Python 3.8+ và `pip` được cài đặt.

1.  **Di chuyển đến thư mục gốc của dự án:**
    ```bash
    cd Luminous_AI
    ```

2.  **Cài đặt các thư viện Python cần thiết:**
    ```bash
    pip install -r requirements.txt
    ```

### 2. Cài đặt Frontend (Next.js)

Đảm bảo bạn có Node.js (phiên bản 18+) và `npm` được cài đặt.

1.  **Di chuyển đến thư mục frontend:**
    ```bash
    cd Luminous_AI/nextjs-app
    ```

2.  **Cài đặt các gói Node.js:**
    ```bash
    npm install
    ```

## Cách chạy dự án

Để ứng dụng hoạt động, bạn cần chạy cả backend và frontend cùng lúc.

### 1. Chạy Backend Server (FastAPI)

Trong terminal, từ thư mục gốc của dự án (`Luminous_AI`), chạy lệnh:

```bash
uvicorn app:app --reload
```

Server sẽ chạy tại `http://127.0.0.1:8000` hoặc `http://localhost:8000`.

### 2. Chạy Frontend Server (Next.js)

Mở một terminal **mới**, di chuyển đến thư mục frontend (`/u01/manhquang/Luminous_AI/nextjs-app`), và chạy lệnh:

```bash
npm run dev
```

Ứng dụng Next.js sẽ chạy tại `http://localhost:3000`.

## Sử dụng ứng dụng

Sau khi cả hai server đều chạy, bạn có thể truy cập ứng dụng qua trình duyệt:

*   **Trang chủ (mặc định):** `http://localhost:3000` (sẽ chuyển hướng đến `/login` hoặc `/register` nếu chưa đăng nhập)
*   **Đăng ký:** `http://localhost:3000/register`
*   **Đăng nhập:** `http://localhost:3000/login`
*   **Hỏi đáp:** `http://localhost:3000/question`
*   **Bảng xếp hạng:** `http://localhost:3000/leaderboard`
