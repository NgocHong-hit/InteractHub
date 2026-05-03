# InteractHub

InteractHub là nền tảng mạng xã hội (social network) cho phép người dùng:
- Tạo tài khoản và đăng nhập
- Đăng trạng thái, hình ảnh
- Bình luận, thích, chia sẻ bài viết
- Nhận thông báo thời gian thực
- Quản lý hồ sơ và cài đặt

## Cấu trúc dự án

- frontend/ : React + TypeScript SPA
- backend/  : ASP.NET Core Web API + EF Core
- docs/     : sơ đồ, báo cáo
- scripts/  : scripts deploy / migrate / seed data

## Hướng dẫn cài đặt
## chạy fontend
npm run dev

1. Frontend: `cd frontend && npm install && npm run dev`
2. Backend: `cd backend/InteractHub.API && dotnet restore && dotnet run`

![giao diện đăng nhập](image-1.png)
![giao diện đăng ký](image-2.png)
![giao diện trang chủ](image-3.png)
![giao diện tạo một bài viết](image-4.png)
![giao diện trang cá nhân](image-5.png)
![giao diện chỉnh sửa thông tin cá nhân](image-6.png)
![giao diện story](image-7.png)
![giao diện tin đã được chia sẽ](image-8.png)
![giao diện quản lý bạn bè](image-9.png)
![giao diện hashtag](image-10.png)
![giao diện admin](image-11.png)
![giao diện thông báo](image-12.png)
