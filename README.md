<<<<<<< HEAD
# Hướng Dẫn Hiểu Kiến Trúc Project

## 1. Hãy Tưởng Tượng Project Như Một Nhà Hàng 🍽️

Để hiểu kiến trúc **Clean Architecture** mà nhóm đang dùng, hãy hình dung quy trình phục vụ trong một nhà hàng lớn:

1.  **Khách hàng (Client)**: Chính là Web (ReactJS) hoặc App Mobile. Họ nhìn vào Menu và gọi món.
2.  **Bồi bàn (API Controller)**:
    *   Nhận yêu cầu từ khách (Nhận Request).
    *   Không trực tiếp nấu ăn.
    *   Chuyển yêu cầu xuống bếp (Gọi Service).
    *   Mang món ăn đã xong ra cho khách (Trả Response).
3.  **Đầu bếp chính (Service Layer)**:
    *   Biết công thức nấu ăn (Xử lý nghiệp vụ logic).
    *   Ví dụ: Kiểm tra xem còn nguyên liệu không, chế biến thịt sao cho ngon, nêm nếm gia vị...
4.  **Phụ bếp kho (Repository / UnitOfWork)**:
    *   Đầu bếp sai: "Lấy cho anh 5kg thịt bò".
    *   Phụ bếp vào kho lấy đúng 5kg thịt bò (Truy vấn Database).
    *   Phụ bếp không cần biết thịt bò để làm món gì, chỉ biết nhiệm vụ là lấy và cất dữ liệu.
5.  **Kho nguyên liệu (Database)**: Nơi chứa toàn bộ dữ liệu (SQL Server).

> **Tại sao phải chia như vậy?**
> Để dễ quản lý. Nếu ông bồi bàn (API) mà chạy vào bếp nấu ăn (Code logic), rồi tự chạy vào kho lấy thịt (Code SQL) thì nhà hàng sẽ loạn ngay. Ai làm việc nấy thì khi có lỗi sửa rất nhanh.

---

## 2. Giải Mã Cấu Trúc Thư Mục (Bản Đồ Kho Báu)

Project chia thành 4 thư mục chính (tương ứng 4 Layer):

### 🏢 1. PTJ.Domain (Trái Tim)
*   **Là gì?**: Chứa các "định nghĩa gốc" của hệ thống.
*   **Có gì?**:
    *   `Entities`: Các class đại diện cho bảng trong DB (ví dụ class `User` sẽ thành bảng `Users`).
    *   *Ví dụ*: `User.cs` quy định User phải có Tên, Email, Mật khẩu.

### 🧠 2. PTJ.Application (Bộ Não)
*   **Là gì?**: Chứa các "luật lệ" và "cách giao tiếp".
*   **Có gì?**:
    *   `Interfaces`: Các bản hợp đồng (Ví dụ: `IJobPostService` nói rằng "Hệ thống phải có chức năng Tìm Việc", nhưng chưa nói rõ code tìm như thế nào).
    *   `DTOs` (Data Transfer Object): Cái hộp gói quà.
        *   *Ví dụ*: Trong DB class `User` có chứa `PasswordHash` (mật khẩu mã hóa). Nhưng khi trả về cho Client, ta dùng `UserDto` chỉ chứa `Name`, `Email` (bỏ mật khẩu đi). DTO giúp bảo mật và gọn nhẹ.

### 🛠️ 3. PTJ.Infrastructure (Cơ Bắp)
*   **Là gì?**: Nơi thực sự "làm việc tay chân".
*   **Có gì?**:
    *   `Services Implementation`: Code chi tiết (Ví dụ: `JobPostService` viết code if-else để tìm việc).
    *   `Repositories`: Code giao tiếp trực tiếp với SQL Server (dùng Entity Framework).
    *   `Migrations`: Các file lịch sử thay đổi Database.

### 🚪 4. PTJ.API (Cánh Cửa)
*   **Là gì?**: Nơi mở cổng để Client kết nối vào.
*   **Có gì?**:
    *   `Controllers`: Các API endpoint (ví dụ `/api/login`).
    *   `Program.cs`: File khởi động, nơi lắp ráp tất cả các bộ phận lại với nhau.

---

## 3. Hành trình của một Request: "Đăng Nhập" 🔑

Hãy xem cụ thể chuyện gì xảy ra khi bạn bấm nút **"Đăng Nhập"**:

1.  **BƯỚC 1: Khách gọi món (Client gửi Request)**
    *   Client gửi một gói tin JSON: `{ "email": "hung@gmail.com", "password": "123" }` tới đường dẫn `POST /api/auth/login`.

2.  **BƯỚC 2: Bồi bàn tiếp nhận (API Layer)**
    *   File `AuthController.cs` nhận yêu cầu.
    *   Nó kiểm tra sơ bộ: "Email có đúng định dạng không?".

3.  **BƯỚC 3: Đầu bếp chế biến (Service Layer)**
    *   Controller gọi `_authService.LoginAsync()`.
    *   Code trong `AuthService.cs` (tại Infrastructure) bắt đầu chạy:
        *   "Tìm xem trong kho có ai email là hung@gmail.com không?" (Gọi Repository).
        *   "Nếu có, kiểm tra mật khẩu giải mã ra có trùng với '123' không?".
        *   "Nếu đúng hết, tạo ra một cái vé (JWT Token) cho người này".

4.  **BƯỚC 4: Phụ bếp vào kho (Infrastructure Layer)**
    *   `GenericRepository.FirstOrDefaultAsync()` dịch lệnh tìm kiếm C# sang SQL: `SELECT * FROM Users WHERE Email = 'hung@gmail.com'`.
    *   SQL Server trả kết quả về.

5.  **BƯỚC 5: Trả món (Response)**
    *   Service đóng gói kết quả vào `AuthResponseDto` (chứa Token).
    *   Controller trả về cho Client: `200 OK` kèm Token.
    *   User đăng nhập thành công!

---

## 4. Giải Ngố Thuật Ngữ (Dùng Để Trả Lời Vấn Đáp)

### ❓ 1. Dependency Injection (DI) là gì?
*   **Giải thích**: Thay vì trong code Service ta viết `new Repository()`, ta sẽ nhờ một "người quản lý" (Container) tự động đưa (inject) Repository vào khi Service cần.
*   **Tại sao dùng**: Giống như chơi Lego. Các mảnh ghép rời rạc, muốn đổi mảnh khác rất dễ. Giúp code lỏng lẻo (loose coupling), dễ bảo trì và test.
*   **Code ở đâu**: Trong `Program.cs` (`builder.Services.AddScoped...`).

### ❓ 2. Tại sao dùng Entity Framework (ORM)?
*   **Giải thích**: Để không phải viết câu lệnh SQL thủ công (`SELECT * FROM...`). Ta thao tác trên Class C#, EF tự dịch ra SQL.
*   **Lợi ích**: Code nhanh hơn, đỡ sai sót cú pháp SQL, an toàn hơn (chống Hack SQL Injection).

### ❓ 3. JWT (JSON Web Token) là gì?
*   **Giải thích**: Sau khi đăng nhập, Server không lưu session (để tiết kiệm RAM). Server phát cho Client một cái "Vé" (Token) có chữ ký điện tử.
*   **Cách dùng**: Lần sau Client muốn lấy dữ liệu, chỉ cần chìa cái Vé này ra. Server nhìn Vé là biết "À, đây là Hùng, quyền Admin" mà không cần tra lại DB.

### ❓ 4. Unit of Work là gì?
*   **Giải thích**: Cơ chế "Làm tất cả hoặc không làm gì cả".
*   **Ví dụ**: Khi tạo một bài đăng (Job), cần lưu vào 2 bảng: `JobPosts` và `JobShifts`.
    *   Nếu lưu `JobPosts` ok nhưng lưu `JobShifts` bị lỗi => `UnitOfWork` sẽ hủy hết, coi như chưa lưu gì. Đảm bảo dữ liệu không bị rác.

---

## 5. Phân Tích Database (Các Bảng Chính)

*   **Users**: Chứa mọi người dùng (Admin, Employer, Student). Phân biệt bằng bảng `UserRoles`.
*   **JobPosts**: Các bài đăng tuyển dụng.
    *   Nối với **Companies**: Bài đăng của công ty nào.
    *   Nối với **JobShifts**: 1 bài đăng có nhiều ca làm việc (Sáng/Chiều).
*   **Applications**: Đơn ứng tuyển.
    *   Nối **JobPost** và **User** (Ai ứng tuyển bài nào).
*   **Profiles**: Hồ sơ ứng viên chi tiết (Kinh nghiệm, Học vấn...).

---

## 6. Mẹo Khi Thuyết Trình & Onboarding 💡

*   Nếu bị hỏi: *"Dự án này có gì đặc biệt?"*
    *   Trả lời: "Em dùng kiến trúc **Clean Architecture** chuẩn công nghiệp, có chia tách 4 tầng rõ ràng. Có áp dụng **Unit of Work** để đảm bảo dữ liệu. Hệ thống có chức năng **Chat Realtime** bằng SignalR."
*   Nếu bị hỏi: *"Tại sao dùng SQL Server mà không dùng MongoDB?"*
    *   Trả lời: "Vì dữ liệu của em có tính cấu trúc cao và quan hệ chặt chẽ (Relational). Một bài đăng gắn với một công ty, một ứng viên... SQL Server quản lý các mối quan hệ (Foreign Key) tốt hơn NoSQL."
*   Nếu bị hỏi: *"Xử lý lỗi như thế nào?"*
    *   Trả lời: "Em dùng **Global Exception Middleware**. Dù code có lỗi ở bất kỳ đâu, Middleware này sẽ bắt lại, ghi log vào DB để Admin kiểm tra, và trả về thông báo lỗi thân thiện cho user chứ không làm sập app."

---
*Chúc các bạn học tốt và bảo vệ đồ án thành công!*
=======
# Part_time_JobFinding
>>>>>>> 432fe0d68b32ff724d8eddeb1e258237f8246d34
