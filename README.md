# Todo List App

Ứng dụng Todo List full-stack dùng cho bài test intern developer, gồm:

- Backend: Spring Boot + JPA + Flyway + PostgreSQL
- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Triển khai cục bộ: Docker Compose hoặc chạy thủ công

## Giới thiệu

Ứng dụng cho phép quản lý danh sách công việc với API REST ở backend và giao diện web responsive ở frontend.

Checklist tính năng đã implement:

- [x] Hiển thị danh sách công việc
- [x] Thêm công việc mới
- [x] Sửa công việc
- [x] Xóa công việc
- [x] Đánh dấu hoàn thành / bỏ hoàn thành
- [x] Tìm kiếm theo tiêu đề hoặc mô tả
- [x] Lọc theo trạng thái
- [x] Phân trang
- [x] Sắp xếp
- [x] Responsive cho desktop và mobile
- [x] Docker setup cho toàn hệ thống
- [x] Unit test backend ở mức controller

## Kiến trúc tổng quan

```text
+------------------+        HTTP/JSON         +-----------------------+        SQL        +------------------+
| Next.js Frontend |  <-------------------->  | Spring Boot REST API  |  <------------->  | PostgreSQL DB    |
+------------------+                          +-----------------------+                   +------------------+
```

Kiến trúc backend:

- `Controller -> Service -> Repository`
- `Controller` nhận request REST và validate đầu vào
- `Service` chứa nghiệp vụ chính
- `Repository` dùng Spring Data JPA để truy cập database
- `DTO` tách biệt với `Entity` để tránh lộ trực tiếp model persistence ra API
- `Specification` được dùng để filter động theo `status` và `keyword`
- `Flyway` quản lý migration schema và seed data

Kiến trúc frontend:

- `app/` quản lý routing và entry page
- `components/ui/` chứa UI dùng chung như `Pagination`, `Toast`, `ConfirmDialog`
- `components/tasks/` chứa UI theo domain Task như `TaskList`, `TaskTable`, `TaskCard`, `TaskForm`
- `services/task/` chứa logic gọi API và presenter/helper liên quan dữ liệu task
- `lib/api-client.ts` là lớp hạ tầng generic để gọi HTTP và chuẩn hóa lỗi
- `hooks/useTaskFilters` đồng bộ `keyword`, `status`, `page`, `size`, `sort` với URL

## Yêu cầu môi trường

Chạy bằng Docker, khuyến nghị:

- Docker Desktop
- Docker Compose

Chạy thủ công:

- Java 21
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16

Lưu ý:

- `pom.xml` hiện tại của repo đang target `Java 21`
- `docker-compose.yml` đang dùng PostgreSQL 16

## Cách chạy nhanh bằng Docker Compose

Đây là cách chạy được ưu tiên. Có 2 mode Docker khác nhau.

### Mode 1. Chạy full local với PostgreSQL trong Docker

1. Tạo file `.env` từ `.env.example`

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Giữ nguyên hoặc chỉnh `.env` theo cấu hình local

```env
POSTGRES_DB=todo_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/todo_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
JAVA_OPTS=-Xms256m -Xmx512m
```

3. Chạy hệ thống

```bash
docker compose up --build
```

4. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend Swagger UI: http://localhost:8080/swagger-ui.html
- Backend API ví dụ: http://localhost:8080/api/tasks

Luồng khởi động:

- `postgres` lên trước
- `backend` chờ `postgres` healthy rồi start
- Flyway chạy migration vào database local trong container `postgres`
- `frontend` build và start sau khi `backend` healthy

### Mode 2. Chạy Docker nhưng backend dùng database ngoài, ví dụ Supabase

1. Tạo file `.env`

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Sửa datasource trong `.env` sang database ngoài

Ví dụ:

```env
POSTGRES_DB=todo_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
SPRING_DATASOURCE_USERNAME=your_user
SPRING_DATASOURCE_PASSWORD=your_password
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
JAVA_OPTS=-Xms256m -Xmx512m
```

3. Chạy hệ thống

```bash
docker compose up --build
```

4. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend Swagger UI: http://localhost:8080/swagger-ui.html

Lưu ý:

- Trong mode này, backend dùng database ngoài theo `SPRING_DATASOURCE_*`
- Service `postgres` local trong Compose vẫn có thể được khởi động, nhưng không phải datasource thực tế của backend
- Flyway sẽ chạy migration trên database ngoài mà bạn cấu hình, không phải trên container `postgres`

Nếu máy bạn dùng binary cũ, `docker-compose up --build` cũng tương đương.

## Chạy theo hướng Production

Mục này áp dụng khi:

- backend chạy với profile `prod`
- database không nằm trong Docker local mà là PostgreSQL ngoài, ví dụ Supabase
- frontend vẫn được chạy qua Docker

### 1. Chuẩn bị file `.env`

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 2. Cấu hình biến môi trường production

Ví dụ:

```env
POSTGRES_DB=todo_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
SPRING_DATASOURCE_USERNAME=your_user
SPRING_DATASOURCE_PASSWORD=your_password
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
JAVA_OPTS=-Xms256m -Xmx512m
```

Ý nghĩa:

- `SPRING_DATASOURCE_*` quyết định backend sẽ kết nối vào database production
- `NEXT_PUBLIC_API_BASE_URL` là URL frontend dùng để gọi backend
- `SPRING_PROFILES_ACTIVE=prod` đã được set sẵn trong `docker-compose.yml` cho service `backend`

### 3. Chạy hệ thống

```bash
docker compose up --build -d
```

### 4. Kiểm tra log

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### 5. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend Swagger UI: http://localhost:8080/swagger-ui.html

### 6. Kiểm tra Flyway migration trên production database

Khi backend khởi động thành công:

- Flyway sẽ tự chạy migration trên database được khai báo trong `SPRING_DATASOURCE_URL`
- nếu bạn dùng Supabase, có thể kiểm tra bảng `flyway_schema_history` trong SQL Editor để xác nhận các migration đã chạy đủ

Ví dụ:

```sql
select installed_rank, version, description, success
from flyway_schema_history
order by installed_rank;
```

### 7. Lưu ý quan trọng

- Không commit file `.env` chứa secret thật lên git
- Với mode production hiện tại, service `postgres` trong `docker-compose.yml` có thể vẫn được khởi động nhưng backend sẽ không dùng đến nếu `SPRING_DATASOURCE_URL` trỏ ra ngoài
- Nếu deploy thật ra server, nên đặt reverse proxy như Nginx hoặc Traefik phía trước để xử lý domain, HTTPS và routing

## Cách chạy thủ công, không Docker

### 1. Tạo PostgreSQL local

Tạo database ví dụ:

```sql
CREATE DATABASE todo_db;
```

### 2. Cấu hình datasource backend

Repo hiện có:

- `application-dev.yml` đang mặc định dùng `localhost:5433`
- `application-prod.yml` đọc từ biến môi trường `SPRING_DATASOURCE_*`

Nếu chạy local không Docker, bạn có 2 cách:

- Cách 1: sửa `todobackend/src/main/resources/application-dev.yml` cho đúng host, port, username, password của PostgreSQL local
- Cách 2: export biến môi trường và chạy với profile `prod`

Ví dụ cấu hình local phổ biến:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/todo_db
    username: postgres
    password: postgres
```

### 3. Chạy backend

```bash
cd todobackend
mvn spring-boot:run
```

Flyway sẽ tự chạy migration khi backend start.

### 4. Chạy frontend

```bash
cd todo-frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Trên Windows PowerShell:

```powershell
cd todo-frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Sau đó truy cập:

- Frontend: http://localhost:3000
- Backend Swagger UI: http://localhost:8080/swagger-ui.html

## Danh sách API endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/tasks?status=&keyword=&page=&size=&sort=` | Lấy danh sách task có filter, phân trang, sắp xếp |
| `GET` | `/api/tasks/{id}` | Lấy chi tiết một task theo id |
| `POST` | `/api/tasks` | Tạo task mới |
| `PUT` | `/api/tasks/{id}` | Cập nhật toàn bộ thông tin task |
| `PATCH` | `/api/tasks/{id}/status` | Đổi trạng thái task |
| `DELETE` | `/api/tasks/{id}` | Xóa task |

Ví dụ query:

```text
GET /api/tasks?status=IN_PROGRESS&keyword=báo cáo&page=0&size=10&sort=dueDate,asc
```

## Cách chạy test

Backend:

```bash
cd todobackend
mvn test
```

Lưu ý:

- Repo đã có test backend ở mức controller (`TaskControllerTest`)
- Nếu máy local bị lỗi certificate khi Maven tải dependency/plugin từ Maven Central, cần xử lý truststore hoặc mirror nội bộ trước khi chạy test

Frontend:

- Chưa implement test tự động ở thời điểm hiện tại

## Cấu trúc thư mục

```text
.
├── docker-compose.yml
├── .env.example
├── README.md
├── todobackend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kienminh/todobackend/
│   │   │   │   ├── config/
│   │   │   │   ├── constant/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── enums/
│   │   │   │   ├── exception/
│   │   │   │   ├── mapper/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   │       └── db/migration/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
└── todo-frontend/
    ├── app/
    ├── components/
    │   ├── tasks/
    │   └── ui/
    ├── constants/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── types/
    ├── Dockerfile
    ├── next.config.mjs
    └── package.json
```

## Ghi chú, hạn chế hiện tại và hướng phát triển tiếp theo

Hiện tại:

- Chưa có authentication / authorization
- Chưa có soft-delete
- Chưa có frontend automated test
- Chưa có upload file hoặc attachment cho task
- Chưa có audit log lịch sử thay đổi task
- Chưa có realtime update giữa nhiều client

Hướng phát triển tiếp theo:

- Thêm đăng nhập bằng JWT hoặc OAuth2
- Thêm soft-delete và khôi phục task
- Thêm test frontend bằng Playwright hoặc React Testing Library
- Thêm realtime update qua WebSocket hoặc SSE
- Thêm gán task cho user, deadline notification, và dashboard thống kê
- Thêm CI/CD để build, test, scan image Docker và deploy tự động
